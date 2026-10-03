import type { Database } from '@/types/database'
import { query } from '@/lib/server/database'
import { gameIdSchema, commentSchema } from '@/lib/validation'
import { guestForWrite, readJson, handleError, json } from '@/lib/server/http'
type Context = { params: Promise<{ gameId: string }> }
export async function GET(_request: Request, { params }: Context) {
  try {
    const gameId = gameIdSchema.parse((await params).gameId)
    const data = await query<Database['public']['Tables']['comments']['Row']>(
      'SELECT * FROM public.comments WHERE game_id = $1 ORDER BY created_at DESC, id LIMIT $2',
      [gameId, 50],
    )
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
    await query(
      'INSERT INTO public.comments(game_id, user_id, username, content) VALUES ($1, $2, $3, $4)',
      [gameId, userId, body.username, body.content],
    )
    return json({ success: true }, 201)
  } catch (error) {
    return handleError(error)
  }
}
