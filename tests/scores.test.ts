import { test } from 'node:test'
import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import {
  SCORE_EVENT,
  ROUND_START_EVENT,
  formatDuration,
  reportScore,
  supportsLeaderboard,
} from '../lib/game-score'
import { isBetter } from '../lib/daily'
import { dailyStreak, summarizeActivities, type Activity } from '../lib/passport'
import { gamesQuerySchema } from '../lib/validation'

function fakeScene() {
  const emitted: unknown[][] = []
  return {
    emitted,
    game: { events: { emit: (...args: unknown[]) => emitted.push(args) } },
  }
}

test('reportScore emits a sanitized score with a default label', () => {
  const scene = fakeScene()
  reportScore(scene, { score: 1234.6 })
  reportScore(scene, { score: -5, label: 'Solved in 0:42' })
  reportScore(scene, { score: Number.NaN })
  assert.deepEqual(scene.emitted, [
    [SCORE_EVENT, { score: 1235, label: 'Score 1,235' }],
    [SCORE_EVENT, { score: 0, label: 'Solved in 0:42' }],
    [SCORE_EVENT, { score: 0, label: 'Score 0' }],
  ])
})

test('lower-is-better games rank fewer strokes/seconds first and skip leaderboards', () => {
  assert.equal(isBetter('mini-golf-course', { score: 30, label: '' }, { score: 34, label: '' }), true)
  assert.equal(isBetter('sudoku-zen', { score: 300, label: '' }, { score: 200, label: '' }), false)
  assert.equal(isBetter('snake', { score: 30, label: '' }, { score: 34, label: '' }), false)
  assert.equal(supportsLeaderboard('snake'), true)
  assert.equal(supportsLeaderboard('mini-golf-course'), false)
  assert.equal(supportsLeaderboard('neon-pong-pvp'), false)
  assert.equal(formatDuration(192), '3:12')
  assert.equal(formatDuration(5), '0:05')
})

test('non-finite and oversized game results remain safe to store and submit', () => {
  const scene = fakeScene()
  reportScore(scene, { score: Infinity, secondary: NaN })
  reportScore(scene, { score: Number.MAX_VALUE, secondary: -1, label: 'x'.repeat(200) })
  assert.deepEqual(scene.emitted, [
    [SCORE_EVENT, { score: 0, secondary: 0, label: 'Score 0' }],
    [SCORE_EVENT, { score: Number.MAX_SAFE_INTEGER, secondary: 0, label: 'x'.repeat(120) }],
  ])
})

test('scene restarts announce exactly one new round after a reported result', () => {
  const scene = { ...fakeScene(), events: new EventEmitter() }
  reportScore(scene, { score: 10 })
  reportScore(scene, { score: 20 })
  scene.events.emit('start')
  scene.events.emit('start')
  assert.equal(scene.emitted.filter(([event]) => event === ROUND_START_EVENT).length, 1)
  reportScore(scene, { score: 30 })
  scene.events.emit('start')
  assert.equal(scene.emitted.filter(([event]) => event === ROUND_START_EVENT).length, 2)
})

test('daily streaks count consecutive days and stay alive until today ends', () => {
  const dates = ['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-05', '2026-10-06']
  assert.deepEqual(dailyStreak(dates, '2026-10-06'), { current: 2, longest: 3 })
  assert.deepEqual(dailyStreak(dates, '2026-10-07'), { current: 2, longest: 3 })
  assert.deepEqual(dailyStreak(dates, '2026-10-08'), { current: 0, longest: 3 })
  assert.deepEqual(dailyStreak([], '2026-10-08'), { current: 0, longest: 0 })
  assert.deepEqual(dailyStreak(['2026-12-31', '2027-01-01', '2026-12-31'], '2027-01-01'), {
    current: 2,
    longest: 2,
  })
})

test('passport counts plays per game and awards streak and personal-best badges', () => {
  const events: Activity[] = []
  const add = (run: string, slug: string, date?: string, score = 10) => {
    const base = {
      version: 1 as const,
      run,
      slug,
      title: slug,
      category: 'Arcade',
      at: '2026-10-04T12:00:00.000Z',
      daily: date ? { date, practice: false } : undefined,
    }
    events.push({ ...base, id: `${run}:start`, kind: 'start' })
    events.push({ ...base, id: `${run}:result`, kind: 'result', result: { score, label: `${score}` } })
  }
  for (const [i, slug] of ['snake', 'breakout', '2048', 'snake', 'breakout', 'sudoku-zen'].entries())
    add(`r${i}`, slug)
  for (const [i, date] of ['2026-10-01', '2026-10-02', '2026-10-03'].entries())
    add(`d${i}`, 'cup-stack', date)
  const summary = summarizeActivities(events)
  assert.equal(summary.plays.snake, 2)
  assert.equal(summary.totalPlays, 9)
  assert.equal(summary.longestStreak, 3)
  assert.ok(summary.badges.includes('streak-three'))
  assert.ok(summary.badges.includes('bests-five'))
})

test('catalog sort accepts known orders only', () => {
  assert.equal(gamesQuerySchema.parse({ sort: 'rating' }).sort, 'rating')
  assert.equal(gamesQuerySchema.parse({}).sort, undefined)
  assert.equal(gamesQuerySchema.safeParse({ sort: 'id; drop table' }).success, false)
})
