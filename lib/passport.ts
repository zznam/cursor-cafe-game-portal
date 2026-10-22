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
  ['streak-three', 'Steady sipper', 'Finish dailies 3 days in a row'],
  ['bests-five', 'Personal best', 'Finish a round in 5 different games'],
] as const

const DAY = 86400000
/** Whole days between two YYYY-MM-DD dates (b - a). */
function dayGap(a: string, b: string) {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / DAY)
}
/**
 * Consecutive-day streaks over finished daily dates. The current streak stays
 * alive through today: finishing yesterday but not yet today still counts.
 */
export function dailyStreak(dates: string[], today?: string) {
  const sorted = [...new Set(dates)].sort()
  let longest = 0,
    run = 0
  for (let i = 0; i < sorted.length; i++) {
    run = i > 0 && dayGap(sorted[i - 1], sorted[i]) === 1 ? run + 1 : 1
    longest = Math.max(longest, run)
  }
  const last = sorted.at(-1)
  const current =
    last && today !== undefined && dayGap(last, today) <= 1 ? run : 0
  return { current, longest }
}
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
  const plays: Record<string, number> = {}
  for (const e of starts.values()) plays[e.slug] = (plays[e.slug] ?? 0) + 1
  const finishedDates = Object.entries(days)
    .filter(([, d]) => d.best)
    .map(([date]) => date)
  const streak = dailyStreak(finishedDates)
  const count = Object.keys(stamps).length,
    dailyCount = finishedDates.length
  const checks = [
    count >= 1,
    count >= 5,
    count >= 10,
    new Set(Object.values(stamps).map((s) => s.category)).size >= 3,
    CAFE_GAMES.every((s) => stamps[s]),
    dailyCount >= 1,
    dailyCount >= 7,
    dailyCount >= 30,
    streak.longest >= 3,
    Object.keys(bests).length >= 5,
  ]
  return {
    stamps,
    bests,
    days,
    practiceDays,
    plays,
    totalPlays: starts.size,
    finishedDates,
    longestStreak: streak.longest,
    badges: BADGES.filter((_, i) => checks[i]).map((b) => b[0]),
  }
}
