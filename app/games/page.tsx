import { getGames, countGames } from '@/lib/server/catalog'
import { GAME_CATEGORIES } from '@/types/game'
import { gamesQuerySchema } from '@/lib/validation'
import { GamesGrid } from '@/components/games-grid'
export const dynamic = 'force-dynamic'
export default async function GamesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const parsed = gamesQuerySchema.safeParse(await searchParams)
  const filters = parsed.success
    ? { ...parsed.data, limit: 24, offset: 0 }
    : gamesQuerySchema.parse({})
  const [games, total] = await Promise.all([
    getGames(filters),
    countGames(filters),
  ])
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold bg-linear-to-r from-amber-200 via-purple-300 to-pink-300 bg-clip-text text-transparent mb-3">
          All Games
        </h1>
        <p className="text-lg text-white/70">
          Find a little break that fits your mood. Handcrafted, touch-friendly, and ready to play.
        </p>
      </div>
      {!parsed.success && (
        <p role="alert" className="text-amber-200 mb-6 bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-xl">
          Those filters were invalid. Showing all games; try letters, numbers,
          or hyphens in search.
        </p>
      )}
      <GamesGrid
        key={JSON.stringify(filters)}
        games={games}
        categories={[...GAME_CATEGORIES]}
        filters={filters}
        total={total}
      />
    </div>
  )
}
