import { NextResponse } from 'next/server'
import { getGames } from '@/lib/api'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') || undefined
  const featured = searchParams.get('featured') === 'true' ? true : undefined
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = parseInt(searchParams.get('offset') || '0')

  try {
    const games = await getGames({ category, featured, limit, offset })
    return NextResponse.json(games)
  } catch (error) {
    console.error('Failed to fetch games:', error)
    return NextResponse.json(
      { error: 'Failed to fetch games' },
      { status: 500 }
    )
  }
}
