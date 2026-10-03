import { database } from '@/lib/server/database'
import { gameIdSchema, commentSchema } from '@/lib/validation'
import { guestForWrite, readJson, handleError, json } from '@/lib/server/http'
type Context = { params: Promise<{ gameId: string }> }
export async function GET(_request: Request, { params }: Context) {
  try {
    const gameId = gameIdSchema.parse((await params).gameId)
    const { data, error } = await database({ primary: true })
      .from('comments')
      .select('*')
      .eq('game_id', gameId)
      .order('created_at', { ascending: false })
      .limit(50)
    if (error) throw error
    return json(
      data.map((row) => ({
        id: row.id,
        gameId: row.game_id,
        userId: row.user_id,
        username: row.username,
        content: row.content,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })),
    )
  } catch (error) {
    return handleError(error)
  }
}
export async function POST(request: Request, { params }: Context) {
  try {
    const gameId = gameIdSchema.parse((await params).gameId)
    const body = await readJson(request, commentSchema)
    const userId = await guestForWrite(request)
    const { error } = await database({ write: true })
      .from('comments')
      .insert({
        game_id: gameId,
        user_id: userId,
        username: body.username,
        content: body.content,
      })
    if (error) throw error
    return json({ success: true }, 201)
  } catch (error) {
    return handleError(error)
  }
}
