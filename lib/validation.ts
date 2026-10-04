import { z } from 'zod'

export const gameIdSchema = z.uuid()
const pageNumber = (fallback: number, max: number) =>
  z.preprocess(
    (value) => (value === undefined ? fallback : value),
    z.coerce.number().int().min(0).max(max),
  )
export const gamesQuerySchema = z.object({
  limit: pageNumber(24, 100).refine((value) => value > 0),
  offset: pageNumber(0, 10000),
  mood: z.enum(['Relaxed', 'Focused', 'Energetic']).optional(),
  duration: z.enum(['quick', 'short', 'long']).optional(),
  touch: z.enum(['true', 'false']).transform(value => value === 'true').optional(),
  category: z.string().trim().max(40).optional(),
  featured: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
  search: z
    .string()
    .trim()
    .max(80)
    .regex(/^[\p{L}\p{N}\s-]*$/u)
    .optional(),
})
export const leaderboardQuerySchema = z.object({
  limit: pageNumber(10, 100).refine((value) => value > 0),
})
const username = z.string().trim().min(1).max(30)
const metadata = z.record(z.string().max(60), z.json()).optional()
export const scoreSchema = z
  .object({
    score: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER),
    username,
    metadata,
  })
  .strict()
export const ratingSchema = z
  .object({
    rating: z.number().int().min(1).max(5),
    review: z.string().trim().max(2000).optional(),
  })
  .strict()
export const commentSchema = z
  .object({ content: z.string().trim().min(1).max(2000), username })
  .strict()
export const eventSchema = z
  .object({
    gameId: gameIdSchema,
    eventType: z.enum(['play', 'complete', 'quit', 'score_submit']),
    sessionId: z.string().min(1).max(100),
    metadata,
  })
  .strict()
