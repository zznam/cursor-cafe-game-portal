import type { Database } from '@/types/database'
import { query } from '@/lib/server/database'
import {
  gameIdSchema,
  leaderboardQuerySchema,
  scoreSchema,
} from '@/lib/validation'
import { guestForWrite, readJson, handleError, json } from '@/lib/server/http'
type Context = { params: Promise<{ gameId: string }> }
export async function GET(request: Request, { params }: Context) {
  try {
    const gameId = gameIdSchema.parse((await params).gameId)
    const { limit } = leaderboardQuerySchema.parse(
      Object.fromEntries(new URL(request.url).searchParams),
    )
    const data = await query<Database['public']['Tables']['leaderboards']['Row']>(
      'SELECT * FROM public.leaderboards WHERE game_id = $1 ORDER BY score DESC, id LIMIT $2',
      [gameId, limit],
    )
    return json(
      data.map((entry) => ({
        id: entry.id,
        gameId: entry.game_id,
        userId: entry.user_id,
        username: entry.username,
        score: Number(entry.score),
        metadata: entry.metadata,
        createdAt: entry.created_at,
      })),
    )
  } catch (error) {
    return handleError(error)
  }
}
export async function POST(request: Request, { params }: Context) {
  try {
    const gameId = gameIdSchema.parse((await params).gameId)
    const body = await readJson(request, scoreSchema)
    const userId = await guestForWrite(request)
    await query(
      'INSERT INTO public.leaderboards(game_id, user_id, score, username, metadata) VALUES ($1, $2, $3, $4, $5)',
      [gameId, userId, body.score, body.username, body.metadata || null],
    )
    return json({ success: true }, 201)
  } catch (error) {
    return handleError(error)
  }
}
