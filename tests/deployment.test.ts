import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

function simulateRelease({
  rollback = false,
  smokeExit = 0,
  initialCount = 2,
} = {}) {
  const directory = mkdtempSync(join(tmpdir(), 'cafe-release-'))
  const old =
    'arn:aws:ecs:eu-west-1:123456789012:task-definition/cursor-cafe-eu-west-1:1'
  const current = old.replace(/:1$/, ':2')
  writeFileSync(join(directory, 'state'), old)
  writeFileSync(
    join(directory, 'aws'),
    `#!${process.execPath}
const fs = require('fs');
const args = process.argv.slice(2); const dir = process.env.MOCK_DIR;
fs.appendFileSync(dir + '/calls', JSON.stringify(args) + '\\n');
const value = key => args[args.indexOf(key) + 1];
if (args[1] === 'describe-task-definition') console.log(JSON.stringify({family:'cursor-cafe-eu-west-1',containerDefinitions:[{name:'app',image:'old',environment:[]}]}));
else if (args[1] === 'describe-services') console.log(value('--query').includes('desiredCount') ? process.env.MOCK_COUNT : fs.readFileSync(dir+'/state','utf8'));
else if (args[1] === 'register-task-definition') console.log(process.env.MOCK_NEW);
else if (args[1] === 'update-service') fs.writeFileSync(dir+'/state', value('--task-definition'));
else if (args[1] === 'wait' && process.env.MOCK_ROLLBACK === 'true') fs.writeFileSync(dir+'/state', process.env.MOCK_OLD);
else if (args[1] !== 'wait') process.exit(99);
`,
    { mode: 0o755 },
  )
  writeFileSync(join(directory, 'node'), `#!/bin/sh\nexit ${smokeExit}\n`, {
    mode: 0o755,
  })
  try {
    const result = spawnSync(
      'bash',
      [resolve('scripts/deploy-aws-region.sh')],
      {
        cwd: directory,
        encoding: 'utf8',
        env: {
          ...process.env,
          PATH: `${directory}:${process.env.PATH}`,
          MOCK_DIR: directory,
          MOCK_NEW: current,
          MOCK_OLD: old,
          MOCK_COUNT: String(initialCount),
          MOCK_ROLLBACK: String(rollback),
          AWS_REGION: 'eu-west-1',
          AWS_PROJECT: 'cursor-cafe',
          IMAGE_URI: 'registry/app@sha256:123',
          REGIONAL_URL: 'https://eu-west-1.example.com',
          APP_VERSION: 'tested-sha',
        },
      },
    )
    const calls = readFileSync(join(directory, 'calls'), 'utf8')
      .trim()
      .split('\n')
      .map((line) => JSON.parse(line) as string[])
    return { status: result.status, calls, old, current }
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
}

test('AWS release verifies a newly stable revision without rolling back', () => {
  const result = simulateRelease()
  assert.equal(result.status, 0)
  const updates = result.calls.filter((call) => call[1] === 'update-service')
  assert.equal(updates.length, 1)
  assert.ok(updates[0].includes(result.current))
})
test('AWS release rejects a stable service that ECS already rolled back', () => {
  const result = simulateRelease({ rollback: true })
  assert.notEqual(result.status, 0)
  assert.ok(
    result.calls
      .filter((call) => call[1] === 'update-service')
      .at(-1)
      ?.includes(result.old),
  )
})
test('a failing post-deploy smoke test restores the prior revision and bootstrap count', () => {
  const result = simulateRelease({ smokeExit: 7, initialCount: 0 })
  assert.notEqual(result.status, 0)
  const restore = result.calls
    .filter((call) => call[1] === 'update-service')
    .at(-1)!
  assert.ok(restore.includes(result.old))
  assert.equal(restore[restore.indexOf('--desired-count') + 1], '0')
})
