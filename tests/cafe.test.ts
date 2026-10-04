import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  dailyChallenge,
  seededRandom,
  CAFE_GAMES,
  isBetter,
  resultShare,
} from '../lib/daily'
import {
  createPipes,
  pipesConnected,
  rotatePipe,
  canPlace,
  placePiece,
  pieceAt,
  hasPlacement,
  stackOverlap,
  orbitObstacle,
  orbitRunResult,
} from '../lib/cafe-rules'
import {
  activitySchema,
  summarizeActivities,
  type Activity,
} from '../lib/passport'
import { gamesQuerySchema } from '../lib/validation'

test('daily rotation is stable, versioned, timezone independent and validates dates', () => {
  const now = new Date('2026-10-04T23:59:59Z')
  const days = Array.from({ length: 4 }, (_, i) =>
    dailyChallenge(`2026-10-0${i + 1}`, now),
  )
  assert.equal(new Set(days.map((d) => d.slug)).size, 4)
  assert.deepEqual(
    dailyChallenge(undefined, now),
    dailyChallenge('2026-10-04', new Date('2026-10-05T06:59:59+07:00')),
  )
  assert.equal(days[3].practice, false)
  assert.equal(days[0].practice, true)
  assert.equal(days[3].nextReset, '2026-10-05T00:00:00.000Z')
  for (const date of ['bad', '2026-02-30', '2026-10-05', '2026-1-1'])
    assert.throws(() => dailyChallenge(date, now))
  assert.notEqual(
    dailyChallenge('2026-10-04', now).seed,
    dailyChallenge('2026-10-03', now).seed,
  )
})
test('pipe puzzles have a deterministic valid solution over 1000 seeds', () => {
  for (let seed = 0; seed < 1000; seed++) {
    const puzzle = createPipes(seed)
    assert.ok(
      pipesConnected(puzzle.solution, 5, puzzle.start, puzzle.end),
      `seed ${seed}`,
    )
    assert.deepEqual(createPipes(seed), puzzle)
    for (let i = 0; i < 25; i++)
      if (puzzle.solution[i]) {
        let mask = puzzle.tiles[i],
          found = false
        for (let n = 0; n < 4; n++) {
          found ||= mask === puzzle.solution[i]
          mask = rotatePipe(mask)
        }
        assert.ok(found)
      }
  }
})
test('block placement respects boundaries and clears intersecting lines once', () => {
  const board = Array<number>(64).fill(0)
  assert.equal(
    canPlace(
      board,
      [
        [0, 0],
        [1, 0],
      ],
      7,
      0,
    ),
    false,
  )
  assert.equal(placePiece(board, [[0, 0]], -1, 0), null)
  for (let n = 1; n < 8; n++) {
    board[n] = 1
    board[n * 8] = 1
  }
  const placed = placePiece(board, [[0, 0]], 0, 0)!
  assert.equal(placed.score, 310)
  assert.ok(placed.board.every((v) => v === 0))
  assert.equal(board[0], 0)
  assert.equal(hasPlacement(Array<number>(64).fill(1), [[0, 0]]), false)
  assert.deepEqual(
    Array.from({ length: 30 }, (_, i) => pieceAt(10, i)),
    Array.from({ length: 30 }, (_, i) => pieceAt(10, i)),
  )
})
test('stack overlap, deterministic obstacle courses and score comparators', () => {
  assert.deepEqual(stackOverlap(120, 100, 100), { width: 80, center: 110 })
  assert.equal(stackOverlap(300, 100, 100).width, 0)
  for (let i = 0; i < 100; i++)
    assert.deepEqual(orbitObstacle(22, i), orbitObstacle(22, i))
  assert.ok(
    isBetter(
      'coffee-connections',
      { score: 10, label: '' },
      { score: 11, label: '' },
    ),
  )
  assert.ok(
    !isBetter(
      'coffee-connections',
      { score: 12, label: '' },
      { score: 11, label: '' },
    ),
  )
  assert.ok(
    isBetter(
      'cup-stack',
      { score: 10, secondary: 90, label: '' },
      { score: 10, secondary: 80, label: '' },
    ),
  )
  assert.ok(
    !isBetter(
      'cup-stack',
      { score: 9, secondary: 100, label: '' },
      { score: 10, secondary: 80, label: '' },
    ),
  )
  assert.ok(
    isBetter(
      'cup-stack',
      { score: 30, secondary: 90.2, label: '' },
      { score: 30, secondary: 90.1, label: '' },
    ),
  )
  assert.ok(
    !isBetter(
      'pastry-blocks',
      { score: 100, label: '' },
      { score: 100, label: '' },
    ),
  )
  assert.ok(
    isBetter(
      'sugar-orbit',
      { score: 90000, label: '' },
      { score: 89999, label: '' },
    ),
  )
  const a = seededRandom(123),
    b = seededRandom(123)
  assert.deepEqual(Array.from({ length: 20 }, a), Array.from({ length: 20 }, b))
})
function event(
  run: string,
  slug: string,
  kind: 'start' | 'result',
  date?: string,
  practice = false,
): Activity {
  return {
    version: 1,
    id: `${run}:${kind}`,
    run,
    slug,
    title: slug,
    category: 'Puzzle',
    kind,
    at: '2026-10-04T23:59:00.000Z',
    daily: date ? { date, practice } : undefined,
    result: kind === 'result' ? { score: 10, label: '10 points' } : undefined,
  }
}
test('passport deduplicates replays and independent concurrent runs; abandoned runs count only attempts', () => {
  const start = event('one', 'cup-stack', 'start', '2026-10-04'),
    done = event('one', 'cup-stack', 'result', '2026-10-04')
  const summary = summarizeActivities([
    start,
    start,
    done,
    done,
    event('two', 'cup-stack', 'start', '2026-10-04'),
  ])
  assert.equal(Object.keys(summary.stamps).length, 1)
  assert.equal(summary.days['2026-10-04'].attempts, 2)
  assert.equal(summary.days['2026-10-04'].best?.score, 10)
  assert.ok(summary.badges.includes('daily-first'))
  assert.deepEqual(summarizeActivities([done]).bests, {})
  assert.deepEqual(
    summarizeActivities([
      event('practice', 'cup-stack', 'start', '2026-10-03', true),
      event('practice', 'cup-stack', 'result', '2026-10-03', true),
    ]).days,
    {},
  )
  const practice = summarizeActivities([
    event('practice', 'cup-stack', 'start', '2026-10-03', true),
    event('practice', 'cup-stack', 'result', '2026-10-03', true),
  ])
  assert.equal(practice.practiceDays['2026-10-03'].attempts, 1)
  assert.equal(practice.practiceDays['2026-10-03'].best?.score, 10)
  assert.ok(!practice.badges.includes('daily-first'))
  done.at = '2026-10-05T00:01:00.000Z'
  assert.equal(
    summarizeActivities([start, done]).days['2026-10-04'].best?.score,
    10,
  )
})
test('badges use distinct games, categories and nonconsecutive daily dates', () => {
  const events: Activity[] = []
  for (const [i, slug] of [
    ...CAFE_GAMES,
    ...Array.from({ length: 6 }, (_, n) => `game-${n}`),
  ].entries())
    events.push({
      ...event(`g${i}`, slug, 'start'),
      category: ['Puzzle', 'Arcade', 'Sports'][i % 3],
    })
  for (let i = 0; i < 30; i++)
    for (const kind of ['start', 'result'] as const)
      events.push(
        event(
          `d${i}`,
          'cup-stack',
          kind,
          new Date(Date.UTC(2026, 0, 1 + i * 2)).toISOString().slice(0, 10),
        ),
      )
  assert.equal(summarizeActivities(events).badges.length, 8)
})
test('progress and discovery inputs reject invalid data; sharing contains date and replay link', () => {
  assert.equal(activitySchema.safeParse({ version: 7 }).success, false)
  assert.equal(
    activitySchema.safeParse({
      ...event('one', 'cup-stack', 'result'),
      result: { score: Infinity, label: 'bad' },
    }).success,
    false,
  )
  assert.equal(
    gamesQuerySchema.parse({
      mood: 'Relaxed',
      duration: 'quick',
      touch: 'true',
    }).touch,
    true,
  )
  assert.equal(gamesQuerySchema.parse({ touch: 'false' }).touch, false)
  assert.equal(gamesQuerySchema.safeParse({ mood: 'Unknown' }).success, false)
  const challenge = dailyChallenge('2026-10-04', new Date('2026-10-04'))
  assert.match(
    resultShare(
      'Test',
      challenge,
      { score: 1, label: 'One point' },
      2,
      'https://example.com',
    ),
    /2 attempts\nhttps:\/\/example.com\/daily\?date=2026-10-04$/,
  )
})

test('orbit daily ends exactly at 90 seconds even across a fixed-step boundary', () => {
  assert.equal(orbitRunResult(89, false, true), null)
  assert.equal(orbitRunResult(90, false, false), null)
  assert.equal(orbitRunResult(12.5, true, true)?.score, 12500)
  let elapsed = 0
  for (let frame = 0; frame < 5400; frame++) elapsed += 1 / 60
  assert.equal(orbitRunResult(elapsed, false, true)?.score, 90000)
  assert.equal(orbitRunResult(90 + 1 / 60, true, true)?.score, 90000)
  assert.equal(orbitRunResult(95, true, false)?.score, 95000)
})
