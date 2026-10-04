import { z } from 'zod'
import { CAFE_GAMES, isBetter, type GameResult } from './daily'

const resultSchema = z.object({
  score: z.number().finite().nonnegative(),
  secondary: z.number().finite().nonnegative().optional(),
  label: z.string().max(120),
})
export const activitySchema = z.object({
  version: z.literal(1),
  id: z.string().max(100),
  run: z.string().max(100),
  kind: z.enum(['start', 'result']),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .max(80),
  title: z.string().max(100),
  category: z.string().max(40),
  at: z.string().datetime(),
  daily: z
    .object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      practice: z.boolean(),
    })
    .optional(),
  result: resultSchema.optional(),
})
export type Activity = z.infer<typeof activitySchema>
export interface DailyRecord {
  slug: string
  title: string
  attempts: number
  best?: GameResult
}
export const BADGES = [
  ['first', 'First sip', 'Play your first game'],
  ['five', 'Café explorer', 'Try 5 different games'],
  ['ten', 'Regular visitor', 'Try 10 different games'],
  ['categories', 'Variety blend', 'Explore 3 categories'],
  ['new-four', 'House specials', 'Try all 4 café games'],
  ['daily-first', 'Daily brew', 'Finish a daily challenge'],
  ['daily-seven', 'Weekly sampler', 'Finish dailies on 7 distinct days'],
  ['daily-thirty', 'Café regular', 'Finish dailies on 30 distinct days'],
] as const
export function summarizeActivities(events: Activity[]) {
  const starts = new Map(
    events.filter((e) => e.kind === 'start').map((e) => [e.run, e]),
  )
  const stamps: Record<
    string,
    { title: string; category: string; at: string }
  > = {}
  const bests: Record<string, GameResult> = {},
    days: Record<string, DailyRecord> = {},
    practiceDays: Record<string, DailyRecord> = {}
  for (const e of starts.values()) {
    if (!stamps[e.slug] || e.at < stamps[e.slug].at)
      stamps[e.slug] = { title: e.title, category: e.category, at: e.at }
    if (e.daily) {
      const history = e.daily.practice ? practiceDays : days
      const day = (history[e.daily.date] ??= {
        slug: e.slug,
        title: e.title,
        attempts: 0,
      })
      day.attempts++
    }
  }
  for (const e of new Map(
    events.filter((e) => e.kind === 'result').map((e) => [e.run, e]),
  ).values()) {
    const start = starts.get(e.run)
    if (!start || start.slug !== e.slug || !e.result) continue
    if (isBetter(e.slug, e.result, bests[e.slug])) bests[e.slug] = e.result
    if (start.daily) {
      const day = (start.daily.practice ? practiceDays : days)[start.daily.date]
      if (day && isBetter(e.slug, e.result, day.best)) day.best = e.result
    }
  }
  const count = Object.keys(stamps).length,
    dailyCount = Object.values(days).filter((d) => d.best).length
  const checks = [
    count >= 1,
    count >= 5,
    count >= 10,
    new Set(Object.values(stamps).map((s) => s.category)).size >= 3,
    CAFE_GAMES.every((s) => stamps[s]),
    dailyCount >= 1,
    dailyCount >= 7,
    dailyCount >= 30,
  ]
  return {
    stamps,
    bests,
    days,
    practiceDays,
    badges: BADGES.filter((_, i) => checks[i]).map((b) => b[0]),
  }
}
