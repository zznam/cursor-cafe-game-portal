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

export async function getGames(
  options: {
    category?: string
    featured?: boolean
    limit?: number
    offset?: number
    search?: string
  } = {},
) {
  const input = gamesQuerySchema.parse({
    ...options,
    featured:
      options.featured === undefined ? undefined : String(options.featured),
  })
  const data = await query<GameRow>(
    `SELECT * FROM public.games
     WHERE ($1::text IS NULL OR category = $1)
       AND ($2::boolean IS NULL OR featured = $2)
       AND ($3::text IS NULL OR title ILIKE $3 OR description ILIKE $3 OR category ILIKE $3)
     ORDER BY play_count DESC, id LIMIT $4 OFFSET $5`,
    [input.category ?? null, input.featured ?? null,
      input.search ? `%${input.search}%` : null, input.limit, input.offset],
    { readOnly: true },
  )
  return data.map(mapGame)
}

export async function getGameBySlug(slug: string) {
  const [data] = await query<GameRow>(
    'SELECT * FROM public.games WHERE slug = $1', [slug], { readOnly: true },
  )
  return data ? mapGame(data) : null
}
