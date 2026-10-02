import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  gamesQuerySchema,
  scoreSchema,
  commentSchema,
  ratingSchema,
} from '../lib/validation'
import { signGuest, verifyGuest } from '../lib/server/guest-token'

test('zero scores are valid; negative, fractional, infinite, or unsafe scores are rejected', () => {
  assert.equal(
    scoreSchema.parse({ score: 0, username: ' Player ' }).username,
    'Player',
  )
  for (const score of [-1, 0.1, Infinity, Number.MAX_SAFE_INTEGER + 1])
    assert.equal(
      scoreSchema.safeParse({ score, username: 'Player' }).success,
      false,
    )
  assert.equal(
    scoreSchema.safeParse({ score: 1, username: 'Player', userId: 'forged' })
      .success,
    false,
  )
})
test('pagination is bounded and featured=false is preserved', () => {
  assert.equal(
    gamesQuerySchema.parse({ featured: 'false', offset: '0' }).featured,
    false,
  )
  for (const limit of ['NaN', '-1', '0', '101', '2.5', ''])
    assert.equal(gamesQuerySchema.safeParse({ limit }).success, false)
  assert.equal(
    gamesQuerySchema.safeParse({ search: 'x),id.eq.1' }).success,
    false,
  )
  assert.equal(gamesQuerySchema.safeParse({ search: 'café' }).success, true)
})
test('social input cannot be blank or exceed storage constraints', () => {
  assert.equal(
    commentSchema.safeParse({ content: ' ', username: 'Test' }).success,
    false,
  )
  assert.equal(
    commentSchema.safeParse({ content: 'a'.repeat(2001), username: 'Test' })
      .success,
    false,
  )
  assert.equal(ratingSchema.safeParse({ rating: 6 }).success, false)
})
test('guest tokens work across regions but reject forgery, rotation and expiry', () => {
  const secret = 'shared-region-secret-with-at-least-32-characters'
  const id = 'a0000000-0000-4000-8000-000000000001'
  const token = signGuest(id, secret, 2000)
  assert.equal(verifyGuest(token, secret, 1000), id)
  assert.equal(verifyGuest(token.replace('a000', 'b000'), secret, 1000), null)
  assert.equal(verifyGuest(`${token}x`, secret, 1000), null)
  assert.equal(verifyGuest(token, 'different-secret', 1000), null)
  assert.equal(verifyGuest(token, secret, 2000), null)
  assert.equal(verifyGuest('malformed', secret, 1000), null)
})
test('guest token parsing rejects malformed IDs, timestamps, signatures and extra fields', () => {
  const secret = 'shared-secret'
  const id = 'a0000000-0000-4000-8000-000000000001'
  const token = signGuest(id, secret, 10000)
  for (const value of [
    '',
    `${token}.extra`,
    'bad.10000.sig',
    `${id}.NaN.sig`,
    `${id}.10000.`,
    `${id}.10000.${'a'.repeat(43)}`,
  ])
    assert.equal(verifyGuest(value, secret, 0), null)
  assert.equal(
    verifyGuest(signGuest(id, secret, Date.now() + 10000), secret),
    id,
  )
  assert.equal(gamesQuerySchema.parse({}).offset, 0)
  assert.equal(gamesQuerySchema.parse({ featured: 'true' }).featured, true)
})
test('event and leaderboard boundaries enforce supported event types and page sizes', async () => {
  const { eventSchema, gameIdSchema, leaderboardQuerySchema } = await import(
    '../lib/validation'
  )
  const id = 'a0000000-0000-4000-8000-000000000001'
  assert.equal(gameIdSchema.parse(id), id)
  assert.equal(
    eventSchema.parse({ gameId: id, eventType: 'play', sessionId: 'test' })
      .eventType,
    'play',
  )
  assert.equal(
    eventSchema.safeParse({
      gameId: id,
      eventType: 'invalid',
      sessionId: 'test',
    }).success,
    false,
  )
  assert.equal(leaderboardQuerySchema.parse({}).limit, 10)
  assert.equal(leaderboardQuerySchema.parse({ limit: '100' }).limit, 100)
  assert.equal(leaderboardQuerySchema.safeParse({ limit: '0' }).success, false)
  assert.equal(verifyGuest(id, 'secret', 0), null)
})
