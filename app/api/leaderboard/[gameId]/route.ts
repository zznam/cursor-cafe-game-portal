import { database } from '@/lib/server/database'
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
    const { data, error } = await database({ primary: true })
      .from('leaderboards')
      .select('*')
      .eq('game_id', gameId)
      .order('score', { ascending: false })
      .order('id')
      .limit(limit)
    if (error) throw error
    return json(
      data.map((entry) => ({
        id: entry.id,
        gameId: entry.game_id,
        userId: entry.user_id,
        username: entry.username,
        score: entry.score,
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
    const { error } = await database({ write: true })
      .from('leaderboards')
      .insert({
        game_id: gameId,
        user_id: userId,
        score: body.score,
        username: body.username,
        metadata: body.metadata || null,
      })
    if (error) throw error
    return json({ success: true }, 201)
  } catch (error) {
    return handleError(error)
  }
}
