import { supabase } from './supabase'
import { GameMetadata, LeaderboardEntry, Rating, Comment } from '@/types/game'

export async function getGames(options?: {
  category?: string
  featured?: boolean
  limit?: number
  offset?: number
}): Promise<GameMetadata[]> {
  let query = supabase
    .from('games')
    .select('*')
    .order('play_count', { ascending: false })

  if (options?.category) {
    query = query.eq('category', options.category)
  }

  if (options?.featured !== undefined) {
    query = query.eq('featured', options.featured)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }

  const { data, error } = await query

  if (error) throw error

  // @ts-ignore - Supabase types are overly restrictive
  return data?.map((game: any) => ({
    id: game.id,
    slug: game.slug,
    title: game.title,
    description: game.description,
    thumbnailUrl: game.thumbnail_url,
    bannerUrl: game.banner_url || undefined,
    category: game.category,
    tags: game.tags,
    developerName: game.developer_name,
    developerUrl: game.developer_url || undefined,
    packageName: game.package_name,
    version: game.version,
    playCount: game.play_count,
    averageRating: game.average_rating,
    totalRatings: game.total_ratings,
    featured: game.featured,
    createdAt: game.created_at,
    updatedAt: game.updated_at
  }))
}

export async function getGameBySlug(slug: string): Promise<GameMetadata | null> {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) return null

  // @ts-ignore - Supabase types are overly restrictive
  const gameData: any = data
  return {
    id: gameData.id,
    slug: gameData.slug,
    title: gameData.title,
    description: gameData.description,
    thumbnailUrl: gameData.thumbnail_url,
    bannerUrl: gameData.banner_url || undefined,
    category: gameData.category,
    tags: gameData.tags,
    developerName: gameData.developer_name,
    developerUrl: gameData.developer_url || undefined,
    packageName: gameData.package_name,
    version: gameData.version,
    playCount: gameData.play_count,
    averageRating: gameData.average_rating,
    totalRatings: gameData.total_ratings,
    featured: gameData.featured,
    createdAt: gameData.created_at,
    updatedAt: gameData.updated_at
  }
}

export async function getLeaderboard(gameId: string, limit = 10): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('leaderboards')
    .select('*')
    .eq('game_id', gameId)
    .order('score', { ascending: false })
    .limit(limit)

  if (error) throw error

  // @ts-ignore - Supabase types are overly restrictive
  return data?.map((entry: any) => ({
    id: entry.id,
    gameId: entry.game_id,
    userId: entry.user_id,
    username: entry.username,
    score: entry.score,
    metadata: entry.metadata as Record<string, any> | undefined,
    createdAt: entry.created_at
  }))
}

export async function submitScore(
  gameId: string,
  score: number,
  username: string,
  metadata?: Record<string, any>
): Promise<void> {
  const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') || 'anonymous' : 'anonymous'

  // @ts-ignore - Supabase types are overly restrictive
  const { error } = await supabase.from('leaderboards').insert({
    game_id: gameId,
    user_id: userId,
    username,
    score,
    metadata: metadata || null
  })

  if (error) throw error
}

export async function getRatings(gameId: string): Promise<Rating[]> {
  const { data, error } = await supabase
    .from('ratings')
    .select('*')
    .eq('game_id', gameId)
    .order('created_at', { ascending: false })

  if (error) throw error

  // @ts-ignore - Supabase types are overly restrictive
  return data?.map((rating: any) => ({
    id: rating.id,
    gameId: rating.game_id,
    userId: rating.user_id,
    rating: rating.rating,
    review: rating.review || undefined,
    createdAt: rating.created_at,
    updatedAt: rating.updated_at
  }))
}

export async function submitRating(
  gameId: string,
  rating: number,
  review?: string
): Promise<void> {
  const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') || 'anonymous' : 'anonymous'

  // @ts-ignore - Supabase types are overly restrictive
  const { error } = await supabase.from('ratings').upsert({
    game_id: gameId,
    user_id: userId,
    rating,
    review: review || null
  })

  if (error) throw error
}

export async function getComments(gameId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('game_id', gameId)
    .order('created_at', { ascending: false })

  if (error) throw error

  // @ts-ignore - Supabase types are overly restrictive
  return data?.map((comment: any) => ({
    id: comment.id,
    gameId: comment.game_id,
    userId: comment.user_id,
    username: comment.username,
    content: comment.content,
    createdAt: comment.created_at,
    updatedAt: comment.updated_at
  }))
}

export async function submitComment(
  gameId: string,
  content: string,
  username: string
): Promise<void> {
  const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') || 'anonymous' : 'anonymous'

  // @ts-ignore - Supabase types are overly restrictive
  const { error } = await supabase.from('comments').insert({
    game_id: gameId,
    user_id: userId,
    username,
    content
  })

  if (error) throw error
}
