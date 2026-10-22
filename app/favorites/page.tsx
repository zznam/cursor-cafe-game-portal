import type { Metadata } from 'next'
import { getGames } from '@/lib/server/catalog'
import { FavoritesList } from '@/components/favorites-list'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'My Favorites — Cursor Café',
  description: 'The games you have hearted at Cursor Café.',
}

export default async function FavoritesPage() {
  const games = await getGames({ limit: 100 })
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold bg-linear-to-r from-amber-200 via-purple-300 to-pink-300 bg-clip-text text-transparent mb-3">
          My Favorites
        </h1>
        <p className="text-lg text-white/70">
          Your personal shelf of games worth coming back to.
        </p>
      </div>
      <FavoritesList games={games} />
    </div>
  )
}
