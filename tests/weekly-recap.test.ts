import { test } from 'node:test'
import assert from 'node:assert/strict'
import { weeklyRecap, type Activity } from '../lib/passport'

function play(run: string, slug: string, at: string, finished = false): Activity[] {
  const start: Activity = {
    version: 1,
    id: `${run}:start`,
    run,
    kind: 'start',
    slug,
    title: slug.replace(/-/g, ' '),
    category: 'Puzzle',
    at,
  }
  return finished
    ? [start, { ...start, id: `${run}:result`, kind: 'result', result: { score: 1, label: '1 point' } }]
    : [start]
}

// Thursday 2026-11-26; the UTC week starts Monday 2026-11-23.
const now = new Date('2026-11-26T15:00:00Z')

test('weekly recap counts this Monday–Sunday UTC week against the previous one', () => {
  const events = [
    ...play('old', 'cup-stack', '2026-11-10T10:00:00Z'),
    ...play('last-1', 'cup-stack', '2026-11-16T00:00:00Z'),
    ...play('last-2', 'sugar-orbit', '2026-11-22T23:59:59Z', true),
    ...play('this-1', 'cup-stack', '2026-11-23T00:00:00Z', true),
    ...play('this-2', 'pastry-blocks', '2026-11-24T08:00:00Z'),
    ...play('this-3', 'cup-stack', '2026-11-26T14:00:00Z', true),
  ]
  const recap = weeklyRecap([...events, ...events], now)
  assert.deepEqual(recap, {
    weekStart: '2026-11-23',
    plays: 3,
    lastWeekPlays: 2,
    finished: 2,
    games: 2,
    newGames: 1,
    top: { slug: 'cup-stack', title: 'cup stack', plays: 2 },
  })
})

test('weekly recap handles Sundays, empty history and future timestamps', () => {
  const sunday = new Date('2026-11-29T23:00:00Z')
  assert.equal(weeklyRecap([], sunday).weekStart, '2026-11-23')
  assert.deepEqual(weeklyRecap([], now), {
    weekStart: '2026-11-23',
    plays: 0,
    lastWeekPlays: 0,
    finished: 0,
    games: 0,
    newGames: 0,
    top: undefined,
  })
  const future = weeklyRecap(play('clock-skew', 'cup-stack', '2026-11-27T00:00:00Z'), now)
  assert.equal(future.plays, 0)
})

test('results only count when they belong to a run started this week for the same game', () => {
  const stray = play('a', 'cup-stack', '2026-11-24T10:00:00Z', true)
  stray[1] = { ...stray[1], slug: 'sugar-orbit' }
  assert.equal(weeklyRecap(stray, now).finished, 0)
  const lastWeekRun = play('b', 'cup-stack', '2026-11-22T10:00:00Z', true)
  lastWeekRun[1] = { ...lastWeekRun[1], at: '2026-11-23T00:10:00Z' }
  assert.equal(weeklyRecap(lastWeekRun, now).finished, 0)
})

test('ties for most played resolve alphabetically', () => {
  const events = [
    ...play('1', 'zen-garden', '2026-11-24T10:00:00Z'),
    ...play('2', 'apple-drop', '2026-11-24T11:00:00Z'),
  ]
  assert.equal(weeklyRecap(events, now).top?.slug, 'apple-drop')
})
