'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { GameCard } from '@/components/game-card'
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
        className="mb-6 space-y-4"
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
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label>
            Search
            <input
              name="search"
              defaultValue={filters.search ?? ''}
              maxLength={80}
              className="discovery-field mt-1"
              placeholder="Find your next favorite"
            />
          </label>
          <label>
            Mood
            <select
              aria-label="Mood"
              name="mood"
              defaultValue={filters.mood ?? ''}
              className="discovery-field mt-1"
            >
              <option value="">Any mood</option>
              {['Relaxed', 'Focused', 'Energetic'].map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </label>
          <label>
            Session length
            <select
              aria-label="Session length"
              name="duration"
              defaultValue={filters.duration ?? ''}
              className="discovery-field mt-1"
            >
              <option value="">Any length</option>
              <option value="quick">Up to 3 minutes</option>
              <option value="short">4–5 minutes</option>
              <option value="long">Over 5 minutes</option>
            </select>
          </label>
          <label>
            Input support
            <select
              aria-label="Input support"
              name="touch"
              defaultValue={
                filters.touch === undefined ? '' : String(filters.touch)
              }
              className="discovery-field mt-1"
            >
              <option value="">Any input</option>
              <option value="true">Touch friendly</option>
              <option value="false">Keyboard / mouse only</option>
            </select>
          </label>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            className="cafe-control primary"
            type="submit"
            disabled={navigating}
          >
            Find games
          </button>
          <button
            type="button"
            className="cafe-control"
            disabled={navigating}
            onClick={() => navigate('/games')}
          >
            Reset filters
          </button>
          <button
            type="button"
            disabled={loading || navigating}
            className="cafe-control"
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
            className={`px-4 min-h-11 py-2 rounded-full ${(filters.category ?? '') === category ? 'bg-white text-purple-600' : 'bg-white/10 text-white'}`}
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
        <p role="alert" className="mb-4 text-red-300">
          {error}{' '}
          <button className="underline" onClick={() => void more()}>
            Retry
          </button>
        </p>
      )}
      {!items.length ? (
        <div className="text-center py-16">
          <p>No games match these filters.</p>
          <button
            className="cafe-control mt-4"
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
        <div className="mt-8 text-center">
          <button
            disabled={loading || navigating}
            className="cafe-control"
            onClick={() => void more()}
          >
            {loading ? 'Loading…' : 'Load more games'}
          </button>
        </div>
      )}
    </>
  )
}
