'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { GameCard } from '@/components/game-card'
import { Gamepad2 } from 'lucide-react'
import { getGames } from '@/lib/api'
import type { GameMetadata } from '@/types/game'
import type { CatalogFilters } from '@/lib/server/catalog'
const PAGE_SIZE = 24
export function GamesGrid({
  games,
  categories,
  filters,
  total,
}: {
  games: GameMetadata[]
  categories: string[]
  filters: CatalogFilters
  total: number
}) {
  const router = useRouter()
  const [navigating, startTransition] = useTransition()
  const navigate = (url: string) => startTransition(() => router.push(url))
  const [items, setItems] = useState(games),
    [loading, setLoading] = useState(false),
    [error, setError] = useState('')
  function query(overrides: Record<string, string> = {}) {
    const value = new URLSearchParams()
    for (const [key, item] of Object.entries(filters))
      if (!['limit', 'offset'].includes(key) && item !== undefined)
        value.set(key, String(item))
    for (const [key, item] of Object.entries(overrides)) {
      if (item) value.set(key, item)
      else value.delete(key)
    }
    return value
  }
  async function more() {
    setLoading(true)
    setError('')
    try {
      const next = await getGames({
        ...filters,
        limit: PAGE_SIZE,
        offset: items.length,
      })
      setItems((previous) => [
        ...previous,
        ...next.filter((item) => !previous.some((old) => old.id === item.id)),
      ])
    } catch {
      setError('Could not load games. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  async function surprise() {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/games/random?${query()}`)
      if (!response.ok) throw new Error('Could not choose a game.')
      const game: GameMetadata | null = await response.json()
      if (game) router.push(`/games/${game.slug}`)
      else setError('No matching games. Try clearing a filter.')
    } catch {
      setError('Could not choose a game. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  return (
    <>
      <form
        className="mb-8 p-5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm space-y-4 shadow-lg shadow-black/20"
        onSubmit={(event) => {
          event.preventDefault()
          const data = new FormData(event.currentTarget),
            next = query()
          for (const [key, value] of data.entries()) {
            if (String(value).trim()) next.set(key, String(value).trim())
            else next.delete(key)
          }
          navigate(`/games?${next}`)
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider">
            Search
            <input
              name="search"
              defaultValue={filters.search ?? ''}
              maxLength={80}
              className="discovery-field mt-1.5"
              placeholder="Find your next favorite"
            />
          </label>
          <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider">
            Mood
            <select
              aria-label="Mood"
              name="mood"
              defaultValue={filters.mood ?? ''}
              className="discovery-field mt-1.5"
            >
              <option value="">Any mood</option>
              {['Relaxed', 'Focused', 'Energetic'].map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider">
            Session length
            <select
              aria-label="Session length"
              name="duration"
              defaultValue={filters.duration ?? ''}
              className="discovery-field mt-1.5"
            >
              <option value="">Any length</option>
              <option value="quick">Up to 3 minutes</option>
              <option value="short">4–5 minutes</option>
              <option value="long">Over 5 minutes</option>
            </select>
          </label>
          <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider">
            Input support
            <select
              aria-label="Input support"
              name="touch"
              defaultValue={
                filters.touch === undefined ? '' : String(filters.touch)
              }
              className="discovery-field mt-1.5"
            >
              <option value="">Any input</option>
              <option value="true">Touch friendly</option>
              <option value="false">Keyboard / mouse only</option>
            </select>
          </label>
          <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider">
            Sort by
            <select
              aria-label="Sort by"
              name="sort"
              defaultValue={filters.sort ?? ''}
              className="discovery-field mt-1.5"
              onChange={(event) => event.currentTarget.form?.requestSubmit()}
            >
              <option value="">Most played</option>
              <option value="rating">Top rated</option>
              <option value="newest">Newest</option>
              <option value="title">A–Z</option>
            </select>
          </label>
        </div>
        <div className="flex flex-wrap gap-3 pt-1">
          <button
            className="cafe-control primary transition-transform hover:scale-[1.02]"
            type="submit"
            disabled={navigating}
          >
            Find games
          </button>
          <button
            type="button"
            className="cafe-control transition-transform hover:scale-[1.02]"
            disabled={navigating}
            onClick={() => navigate('/games')}
          >
            Reset filters
          </button>
          <button
            type="button"
            disabled={loading || navigating}
            className="cafe-control transition-transform hover:scale-[1.02]"
            onClick={() => void surprise()}
          >
            Surprise me
          </button>
        </div>
      </form>
      <div className="flex flex-wrap gap-2 mb-6" aria-label="Game categories">
        {['', ...categories].map((category) => (
          <button
            key={category}
            aria-pressed={(filters.category ?? '') === category}
            disabled={navigating}
            onClick={() => navigate(`/games?${query({ category })}`)}
            className={`px-4 min-h-11 py-2 rounded-full font-medium text-sm transition-all duration-200 ${(filters.category ?? '') === category ? 'bg-white text-purple-700 shadow-md shadow-purple-500/20 font-semibold scale-105' : 'bg-white/10 text-white/80 hover:bg-white/15 hover:text-white'}`}
          >
            {category || 'All'}
          </button>
        ))}
      </div>
      <p className="mb-4 text-sm text-white/70" role="status">
        {loading || navigating
          ? 'Loading games…'
          : `${items.length} of ${total} games ready to play`}
      </p>
      {error && (
        <p role="alert" className="mb-4 text-red-300 bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
          {error}{' '}
          <button className="underline font-medium hover:text-red-200" onClick={() => void more()}>
            Retry
          </button>
        </p>
      )}
      {!items.length ? (
        <div className="text-center py-16 px-4 bg-white/5 border border-white/10 rounded-2xl max-w-md mx-auto my-8">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4 text-white/60">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <p className="text-lg font-medium text-white mb-1">No games match these filters.</p>
          <p className="text-sm text-white/50 mb-5">Try relaxing your search terms or picking another category.</p>
          <button
            className="cafe-control"
            disabled={navigating}
            onClick={() => navigate('/games')}
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          aria-busy={loading || navigating}
        >
          {items.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
      {items.length < total && (
        <div className="mt-10 text-center">
          <button
            disabled={loading || navigating}
            className="cafe-control px-6 py-2.5 transition-transform hover:scale-[1.02]"
            onClick={() => void more()}
          >
            {loading ? 'Loading…' : 'Load more games'}
          </button>
        </div>
      )}
    </>
  )
}
