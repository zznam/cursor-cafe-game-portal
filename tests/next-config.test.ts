import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'

const commit = '709298da59725bba2338d27c4293e2a829809865'

function deploymentId(environment: Record<string, string> = {}) {
  const result = spawnSync(process.execPath, [
    '--import', 'tsx', '--eval',
    "const config = require('./next.config.ts').default; console.log(JSON.stringify(config.deploymentId ?? null))",
  ], {
    cwd: process.cwd(),
    encoding: 'utf8',
    env: {
      ...process.env,
      APP_VERSION: '',
      APP_DEPLOYMENT_ID: '',
      VERCEL: '',
      VERCEL_GIT_COMMIT_SHA: '',
      NEXT_DEPLOYMENT_ID: '',
      ...environment,
    },
  })
  assert.equal(result.status, 0, result.stderr)
  return JSON.parse(result.stdout.trim()) as string | null
}

test('native Vercel builds leave deployment identity to the platform', () => {
  assert.equal(deploymentId({ VERCEL: '1', VERCEL_GIT_COMMIT_SHA: commit }), null)
  assert.equal(deploymentId({ VERCEL: '1', APP_VERSION: commit }), null)
})

test('prebuilt Vercel releases use a valid unique ID on each retry of the same commit', () => {
  const environment = { VERCEL: '1', APP_VERSION: commit }
  const first = deploymentId({ ...environment, APP_DEPLOYMENT_ID: '123-456-1' })
  const retry = deploymentId({ ...environment, APP_DEPLOYMENT_ID: '123-456-2' })
  assert.match(first!, /^[a-f0-9]{32}$/)
  assert.match(retry!, /^[a-f0-9]{32}$/)
  assert.notEqual(first, retry)
  assert.equal(first, deploymentId({ ...environment, APP_DEPLOYMENT_ID: '123-456-1' }))
})

test('AWS deployment IDs are bounded, deterministic, and use the entire version', () => {
  const first = deploymentId({ APP_VERSION: commit })
  assert.match(first!, /^[a-f0-9]{32}$/)
  assert.equal(first, deploymentId({ APP_VERSION: commit }))
  assert.notEqual(first, deploymentId({ APP_VERSION: `${commit.slice(0, -1)}6` }))
  assert.match(deploymentId({ APP_VERSION: `release/unsafe characters ${'x'.repeat(100)}` })!, /^[a-f0-9]{32}$/)
})

test('local builds without a release version do not override deployment identity', () => {
  assert.equal(deploymentId(), null)
})
