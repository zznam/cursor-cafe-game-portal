import type {
  GameMetadata,
  LeaderboardEntry,
  Rating,
  Comment,
} from '@/types/game'
import type { Json } from '@/types/database'

async function request<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(path, {
    method: body === undefined ? 'GET' : 'POST',
    headers:
      body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Request failed')
  return data as T
}
export function getGames(
  options: {
    mood?: 'Relaxed' | 'Focused' | 'Energetic'
    duration?: 'quick' | 'short' | 'long'
    touch?: boolean
    category?: string
    featured?: boolean
    limit?: number
    offset?: number
    search?: string
  } = {},
) {
  const query = new URLSearchParams()
  Object.entries(options).forEach(([key, value]) => {
    if (value !== undefined) query.set(key, String(value))
  })
  return request<GameMetadata[]>(`/api/games?${query}`)
}
export const getLeaderboard = (gameId: string, limit = 10) =>
  request<LeaderboardEntry[]>(`/api/leaderboard/${gameId}?limit=${limit}`)
export const submitScore = (
  gameId: string,
  score: number,
  username: string,
  metadata?: Record<string, Json>,
) => request(`/api/leaderboard/${gameId}`, { score, username, metadata })
export const getRatings = (gameId: string) =>
  request<Rating[]>(`/api/ratings/${gameId}`)
export const submitRating = (gameId: string, rating: number, review?: string) =>
  request(`/api/ratings/${gameId}`, { rating, review })
export const getComments = (gameId: string) =>
  request<Comment[]>(`/api/comments/${gameId}`)
export const submitComment = (
  gameId: string,
  content: string,
  username: string,
) => request(`/api/comments/${gameId}`, { content, username })
export const submitEvent = (event: unknown) => request('/api/events', event)
