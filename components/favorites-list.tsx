'use client'
import { useMemo } from 'react'
import Link from 'next/link'
import { Heart, Shuffle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { GameCard } from '@/components/game-card'
import { useBrowserStorage } from '@/hooks/use-browser-storage'
import type { GameMetadata } from '@/types/game'

export function FavoritesList({ games }: { games: GameMetadata[] }) {
  const stored = useBrowserStorage('favorites')
  const router = useRouter()
  const favorites = useMemo(() => {
    try {
      const parsed: unknown = JSON.parse(stored || '[]')
      if (!Array.isArray(parsed)) return []
      // Keep the order games were hearted, newest first.
      return parsed
        .filter((id): id is string => typeof id === 'string')
        .reverse()
        .map((id) => games.find((game) => game.id === id))
        .filter((game): game is GameMetadata => !!game)
    } catch {
      return []
    }
  }, [stored, games])

  if (!favorites.length) {
    return (
      <div className="text-center py-16 px-4 bg-white/5 border border-white/10 rounded-2xl max-w-md mx-auto">
        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4 text-pink-300">
          <Heart className="w-6 h-6" />
        </div>
        <p className="text-lg font-medium text-white mb-1">No favorites yet</p>
        <p className="text-sm text-white/60 mb-5">
          Tap the heart on any game card and it will wait for you here.
        </p>
        <Link href="/games" className="cafe-control primary">
          Browse games
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <p className="text-sm text-white/70" role="status">
          {favorites.length} favorite{favorites.length === 1 ? '' : 's'} saved
          on this browser
        </p>
        <button
          className="cafe-control gap-2"
          onClick={() =>
            router.push(
              `/games/${favorites[Math.floor(Math.random() * favorites.length)].slug}`,
            )
          }
        >
          <Shuffle className="w-4 h-4" /> Play a random favorite
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {favorites.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </>
  )
}
