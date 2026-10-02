'use client'
import { useRef, useState } from 'react'
import { GameCard } from '@/components/game-card'
import { getGames } from '@/lib/api'
import type { GameMetadata } from '@/types/game'
const PAGE_SIZE = 24
export function GamesGrid({
  games,
  categories,
  initialCategory = null,
}: {
  games: GameMetadata[]
  categories: string[]
  initialCategory?: string | null
}) {
  const [active, setActive] = useState<string | null>(initialCategory)
  const [items, setItems] = useState(games)
  const [hasMore, setHasMore] = useState(games.length === PAGE_SIZE)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const generation = useRef(0)
  async function load(category: string | null, append = false) {
    const current = ++generation.current
    setActive(category)
    setLoading(true)
    setError('')
    if (!append) {
      setItems([])
      setHasMore(false)
    }
    try {
      const next = await getGames({
        category: category || undefined,
        limit: PAGE_SIZE,
        offset: append ? items.length : 0,
      })
      if (current !== generation.current) return
      setItems((previous) =>
        append
          ? [
              ...previous,
              ...next.filter(
                (item) => !previous.some((existing) => existing.id === item.id),
              ),
            ]
          : next,
      )
      setHasMore(next.length === PAGE_SIZE)
    } catch {
      if (current === generation.current)
        setError('Could not load games. Please try again.')
    } finally {
      if (current === generation.current) setLoading(false)
    }
  }
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-8" aria-label="Game categories">
        {[null, ...categories].map((category) => (
          <button
            key={category || 'all'}
            aria-pressed={active === category}
            onClick={() => void load(category)}
            className={`px-4 py-2 rounded-full transition-colors cursor-pointer ${active === category ? 'bg-white text-purple-600 font-medium' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            {category || 'All'}
          </button>
        ))}
      </div>
      <p className="mb-4 text-sm text-white/60" role="status">
        {loading ? 'Loading games…' : `${items.length} games ready to play`}
      </p>
      {error && (
        <p role="alert" className="mb-4 text-red-300">
          {error}{' '}
          <button className="underline" onClick={() => void load(active)}>
            Retry
          </button>
        </p>
      )}
      {!loading && !error && items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl text-white/80">
            No games found in this category.
          </p>
        </div>
      ) : (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          aria-busy={loading}
        >
          {items.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
      {hasMore && (
        <div className="mt-8 text-center">
          <button
            onClick={() => void load(active, true)}
            disabled={loading}
            className="rounded-lg bg-purple-600 px-6 py-3 text-white disabled:opacity-50"
          >
            {loading ? 'Loading…' : 'Load more games'}
          </button>
        </div>
      )}
    </>
  )
}
