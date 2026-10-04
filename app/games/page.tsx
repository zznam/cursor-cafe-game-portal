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
      <h1 className="text-4xl font-bold text-white mb-3">All Games</h1>
      <p className="text-white/70 mb-8">
        Find a little break that fits your mood.
      </p>
      {!parsed.success && (
        <p role="alert" className="text-amber-200 mb-4">
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
