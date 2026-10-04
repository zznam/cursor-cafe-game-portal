import { randomGame } from '@/lib/server/catalog'
import { gamesQuerySchema } from '@/lib/validation'
import { handleError, json } from '@/lib/server/http'
export async function GET(request: Request) {
  try {
    return json(
      await randomGame(
        gamesQuerySchema.parse(
          Object.fromEntries(new URL(request.url).searchParams),
        ),
      ),
    )
  } catch (error) {
    return handleError(error)
  }
}
