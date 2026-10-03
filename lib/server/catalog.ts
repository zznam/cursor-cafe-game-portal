import 'server-only'
import type { GameMetadata } from '@/types/game'
import type { Database } from '@/types/database'
import { database } from './database'
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
    playCount: game.play_count,
    averageRating: game.average_rating,
    totalRatings: game.total_ratings,
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
  let query = database()
    .from('games')
    .select('*')
    .order('play_count', { ascending: false })
    .order('id')
  if (input.category) query = query.eq('category', input.category)
  if (input.featured !== undefined) query = query.eq('featured', input.featured)
  if (input.search)
    query = query.or(
      `title.ilike.%${input.search}%,description.ilike.%${input.search}%,category.ilike.%${input.search}%`,
    )
  const { data, error } = await query.range(
    input.offset,
    input.offset + input.limit - 1,
  )
  if (error) throw error
  return (data || []).map(mapGame)
}

export async function getGameBySlug(slug: string) {
  const { data, error } = await database()
    .from('games')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()
  if (error) throw error // Outages must not turn into cached 404s.
  return data ? mapGame(data) : null
}
