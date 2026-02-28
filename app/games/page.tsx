import { getGames } from '@/lib/api'
import { GAME_CATEGORIES } from '@/types/game'
import { GamesGrid } from '@/components/games-grid'

export const revalidate = 60

export default async function GamesPage() {
  let games = []

  try {
    games = await getGames({ limit: 50 })
  } catch (error) {
    console.error('Failed to load games:', error)
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">All Games</h1>
      </div>
      <GamesGrid games={games} categories={[...GAME_CATEGORIES]} />
    </div>
  )
}
