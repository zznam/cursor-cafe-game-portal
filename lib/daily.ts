export const CAFE_GAMES = [
  'coffee-connections',
  'pastry-blocks',
  'cup-stack',
  'sugar-orbit',
] as const
export type CafeGame = (typeof CAFE_GAMES)[number]
export interface DailyChallenge {
  date: string
  slug: CafeGame
  seed: number
  version: 1
  nextReset: string
  practice: boolean
}
export interface GameResult {
  score: number
  secondary?: number
  label: string
}

export function hashSeed(value: string): number {
  let hash = 2166136261
  for (const char of value)
    hash = Math.imul(hash ^ char.charCodeAt(0), 16777619)
  return hash >>> 0
}
export function seededRandom(seed: number) {
  return () => {
    seed += 0x6d2b79f5
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
export function dailyChallenge(
  date?: string,
  now = new Date(),
): DailyChallenge {
  const today = now.toISOString().slice(0, 10)
  date ??= today
  const timestamp = Date.parse(`${date}T00:00:00Z`)
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !Number.isFinite(timestamp) ||
    new Date(timestamp).toISOString().slice(0, 10) !== date ||
    date > today
  )
    throw new Error('Choose today or a valid past date.')
  const slug = CAFE_GAMES[((Math.floor(timestamp / 86400000) % 4) + 4) % 4]
  return {
    date,
    slug,
    seed: hashSeed(`cafe-v1:${date}:${slug}`),
    version: 1,
    nextReset: new Date(
      Date.parse(`${today}T00:00:00Z`) + 86400000,
    ).toISOString(),
    practice: date < today,
  }
}
export function isBetter(
  slug: string,
  next: GameResult,
  previous?: GameResult,
) {
  if (!previous) return true
  if (slug === 'coffee-connections') return next.score < previous.score
  return (
    next.score > previous.score ||
    (next.score === previous.score &&
      (next.secondary ?? 0) > (previous.secondary ?? 0))
  )
}
export function resultShare(
  title: string,
  challenge: DailyChallenge,
  result: GameResult,
  attempts: number,
  origin: string,
) {
  return `Cursor Café · ${title}\n${challenge.date}${challenge.practice ? ' · Practice' : ''}\n${result.label} · ${attempts} attempt${attempts === 1 ? '' : 's'}\n${origin}/daily?date=${challenge.date}`
}
