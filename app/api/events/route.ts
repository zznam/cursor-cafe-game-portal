import { query } from '@/lib/server/database'
import { eventSchema } from '@/lib/validation'
import { guestForWrite, readJson, handleError, json } from '@/lib/server/http'
export async function POST(request: Request) {
  try {
    const event = await readJson(request, eventSchema)
    const userId = await guestForWrite(request)
    await query(
      'INSERT INTO public.analytics(game_id, user_id, event_type, session_id, metadata) VALUES ($1, $2, $3, $4, $5)',
      [event.gameId, userId, event.eventType, event.sessionId, event.metadata || null],
    )
    return json({ success: true }, 201)
  } catch (error) {
    return handleError(error)
  }
}
