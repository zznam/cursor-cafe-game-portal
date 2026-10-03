import { getGames } from '@/lib/server/catalog'
import { gamesQuerySchema } from '@/lib/validation'
import { handleError, json } from '@/lib/server/http'
export async function GET(request: Request) {
  try {
    const options = gamesQuerySchema.parse(
      Object.fromEntries(new URL(request.url).searchParams),
    )
    return json(await getGames(options))
  } catch (error) {
    return handleError(error)
  }
}
