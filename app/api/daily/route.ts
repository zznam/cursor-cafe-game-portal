import { dailyChallenge } from '@/lib/daily'
import { json } from '@/lib/server/http'
export function GET(request: Request) {
  try {
    return json(
      dailyChallenge(
        new URL(request.url).searchParams.get('date') ?? undefined,
      ),
    )
  } catch {
    return Response.json(
      { error: 'Choose today or a valid past date.' },
      { status: 400 },
    )
  }
}
