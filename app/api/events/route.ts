import { database } from '@/lib/server/database'
import { eventSchema } from '@/lib/validation'
import { guestForWrite, readJson, handleError, json } from '@/lib/server/http'
export async function POST(request: Request) {
  try {
    const event = await readJson(request, eventSchema)
    const userId = await guestForWrite(request)
    const { error } = await database({ write: true })
      .from('analytics')
      .insert({
        game_id: event.gameId,
        user_id: userId,
        event_type: event.eventType,
        session_id: event.sessionId,
        metadata: event.metadata || null,
      })
    if (error) throw error
    return json({ success: true }, 201)
  } catch (error) {
    return handleError(error)
  }
}
