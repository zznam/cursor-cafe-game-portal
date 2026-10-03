import { getGames } from '@/lib/server/catalog'
import { GAME_CATEGORIES } from '@/types/game'
import { GamesGrid } from '@/components/games-grid'

export const dynamic = 'force-dynamic'

export default async function GamesPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams
  const selected = GAME_CATEGORIES.find(value => value === category)
  const games = await getGames({ limit: 24, category: selected })

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">All Games</h1>
      </div>
      <GamesGrid initialCategory={selected || null} games={games} categories={[...GAME_CATEGORIES]} />
    </div>
  )
}
