import { getGames } from '@/lib/api'
import { GameCard } from '@/components/game-card'
import { GAME_CATEGORIES } from '@/types/game'

export const revalidate = 60

export default async function GamesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  let games = []
  
  try {
    games = await getGames({ category, limit: 50 })
  } catch (error) {
    console.error('Failed to load games:', error)
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">All Games</h1>
        <div className="flex flex-wrap gap-2">
          <a
            href="/games"
            className={`px-4 py-2 rounded-full transition-colors ${
              !category
                ? 'bg-white text-purple-600'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            All
          </a>
          {GAME_CATEGORIES.map((cat) => (
            <a
              key={cat}
              href={`/games?category=${cat}`}
              className={`px-4 py-2 rounded-full transition-colors ${
                category === cat
                  ? 'bg-white text-purple-600'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {cat}
            </a>
          ))}
        </div>
      </div>

      {games.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl text-white/80">No games found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </div>
  )
}
