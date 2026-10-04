import 'server-only'
import type { GameMetadata } from '@/types/game'
import type { Database } from '@/types/database'
import { query } from './database'
import { gamesQuerySchema } from '@/lib/validation'

type GameRow = Database['public']['Tables']['games']['Row']
export function mapGame(game: GameRow): GameMetadata {
  return {
    id: game.id,
    slug: game.slug,
    title: game.title,
    description: game.description,
    thumbnailUrl: game.thumbnail_url,
    bannerUrl: game.banner_url || undefined,
    category: game.category,
    mood: game.mood ?? undefined,
    sessionMinutes: game.session_minutes ?? undefined,
    touch: game.touch,
    tags: game.tags || [],
    developerName: game.developer_name,
    developerUrl: game.developer_url || undefined,
    packageName: game.package_name,
    version: game.version,
    playCount: Number(game.play_count),
    averageRating: Number(game.average_rating),
    totalRatings: Number(game.total_ratings),
    featured: game.featured,
    createdAt: game.created_at,
    updatedAt: game.updated_at,
  }
}

export interface CatalogFilters {
  category?: string
  featured?: boolean
  limit?: number
  offset?: number
  search?: string
  mood?: 'Relaxed' | 'Focused' | 'Energetic'
  duration?: 'quick' | 'short' | 'long'
  touch?: boolean
}
function filterQuery(options: CatalogFilters) {
  const input = gamesQuerySchema.parse({
    ...options,
    featured:
      options.featured === undefined ? undefined : String(options.featured),
    touch: options.touch === undefined ? undefined : String(options.touch),
  })
  return {
    input,
    where: `WHERE ($1::text IS NULL OR category = $1)
    AND ($2::boolean IS NULL OR featured = $2)
    AND ($3::text IS NULL OR title ILIKE $3 OR description ILIKE $3 OR category ILIKE $3)
    AND ($4::text IS NULL OR mood = $4)
    AND ($5::text IS NULL OR ($5='quick' AND session_minutes<=3) OR ($5='short' AND session_minutes BETWEEN 4 AND 5) OR ($5='long' AND session_minutes>5))
    AND ($6::boolean IS NULL OR touch = $6)`,
    values: [
      input.category ?? null,
      input.featured ?? null,
      input.search ? `%${input.search}%` : null,
      input.mood ?? null,
      input.duration ?? null,
      input.touch ?? null,
    ],
  }
}
export async function getGames(options: CatalogFilters = {}) {
  const { input, where, values } = filterQuery(options)
  return (
    await query<GameRow>(
      `SELECT * FROM public.games ${where} ORDER BY play_count DESC, id LIMIT $7 OFFSET $8`,
      [...values, input.limit, input.offset],
      { readOnly: true },
    )
  ).map(mapGame)
}
export async function countGames(options: CatalogFilters = {}) {
  const { where, values } = filterQuery(options)
  const [row] = await query<{ count: string }>(
    `SELECT count(*) AS count FROM public.games ${where}`,
    values,
    { readOnly: true },
  )
  return Number(row.count)
}
export async function randomGame(options: CatalogFilters = {}) {
  const { where, values } = filterQuery(options)
  const [row] = await query<GameRow>(
    `SELECT * FROM public.games ${where} ORDER BY random() LIMIT 1`,
    values,
    { readOnly: true },
  )
  return row ? mapGame(row) : null
}
export async function getGameBySlug(slug: string) {
  const [data] = await query<GameRow>(
    'SELECT * FROM public.games WHERE slug = $1',
    [slug],
    { readOnly: true },
  )
  return data ? mapGame(data) : null
}
