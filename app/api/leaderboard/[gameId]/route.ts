import { NextResponse } from 'next/server'
import { getLeaderboard, submitScore } from '@/lib/api'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ gameId: string }> }
) {
  const { gameId } = await params
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '10')

  try {
    const leaderboard = await getLeaderboard(gameId, limit)
    return NextResponse.json(leaderboard)
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ gameId: string }> }
) {
  const { gameId } = await params
  
  try {
    const body = await request.json()
    const { score, username, metadata } = body

    if (!score || !username) {
      return NextResponse.json(
        { error: 'Score and username are required' },
        { status: 400 }
      )
    }

    await submitScore(gameId, score, username, metadata)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to submit score:', error)
    return NextResponse.json(
      { error: 'Failed to submit score' },
      { status: 500 }
    )
  }
}
