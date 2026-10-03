import type { Database } from '@/types/database'
import { query } from '@/lib/server/database'
import { gameIdSchema, ratingSchema } from '@/lib/validation'
import { guestForWrite, readJson, handleError, json } from '@/lib/server/http'
type Context = { params: Promise<{ gameId: string }> }
export async function GET(_request: Request, { params }: Context) {
  try {
    const gameId = gameIdSchema.parse((await params).gameId)
    const data = await query<Database['public']['Tables']['ratings']['Row']>(
      'SELECT * FROM public.ratings WHERE game_id = $1 ORDER BY created_at DESC, id LIMIT $2',
      [gameId, 50],
    )
    return json(
      data.map((row) => ({
        id: row.id,
        gameId: row.game_id,
        userId: row.user_id,
        rating: row.rating,
        review: row.review,
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
    const body = await readJson(request, ratingSchema)
    const userId = await guestForWrite(request)
    await query(
      `INSERT INTO public.ratings(game_id, user_id, rating, review) VALUES ($1, $2, $3, $4)
       ON CONFLICT (game_id, user_id) DO UPDATE
       SET rating = EXCLUDED.rating, review = EXCLUDED.review, updated_at = now()`,
      [gameId, userId, body.rating, body.review || null],
    )
    return json({ success: true })
  } catch (error) {
    return handleError(error)
  }
}
