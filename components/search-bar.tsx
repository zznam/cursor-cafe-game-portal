'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Gamepad2, Sword, Puzzle, Rocket, Car, Trophy, Target, MapPin, Zap } from 'lucide-react'
import { GameMetadata } from '@/types/game'
import { getGames } from '@/lib/api'

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Action: <Sword className="w-4 h-4" />,
  Arcade: <Zap className="w-4 h-4" />,
  Puzzle: <Puzzle className="w-4 h-4" />,
  Strategy: <Target className="w-4 h-4" />,
  Adventure: <MapPin className="w-4 h-4" />,
  Platformer: <Rocket className="w-4 h-4" />,
  Shooter: <Target className="w-4 h-4" />,
  Racing: <Car className="w-4 h-4" />,
  Sports: <Trophy className="w-4 h-4" />,
  Other: <Gamepad2 className="w-4 h-4" />,
}

export function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GameMetadata[]>([])
  const [allGames, setAllGames] = useState<GameMetadata[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    let mounted = true
    async function fetchGames() {
      setLoading(true)
      try {
        const games = await getGames({ limit: 100 })
        if (mounted) setAllGames(games)
      } catch {
        // games list unavailable — search will show no results
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchGames()
    return () => { mounted = false }
  }, [])

  const filterGames = useCallback((q: string) => {
    if (!q.trim()) return []
    const lower = q.toLowerCase()
    return allGames.filter(
      (game) =>
        game.title.toLowerCase().includes(lower) ||
        game.description.toLowerCase().includes(lower) ||
        game.tags.some((tag) => tag.toLowerCase().includes(lower)) ||
        game.category.toLowerCase().includes(lower)
    ).slice(0, 8)
  }, [allGames])

  useEffect(() => {
    setResults(filterGames(query))
    setSelectedIndex(-1)
  }, [query, filterGames])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function navigateToGame(slug: string) {
    setIsOpen(false)
    setQuery('')
    router.push(`/games/${slug}`)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen || results.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1))
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault()
      navigateToGame(results[selectedIndex].slug)
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      inputRef.current?.blur()
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search games..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full sm:w-64 h-9 pl-9 pr-8 rounded-lg bg-white/10 border border-white/10 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500/50 transition-colors"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('')
              inputRef.current?.focus()
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-white/40 hover:text-white/70 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {isOpen && query.trim() && (
        <div className="absolute top-full mt-2 w-full sm:w-80 right-0 rounded-xl bg-gray-900/95 backdrop-blur-xl border border-white/10 shadow-2xl shadow-purple-500/10 overflow-hidden z-50">
          {loading ? (
            <div className="px-4 py-6 text-center text-sm text-white/50">
              Loading games...
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-white/50">
              No games found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <div className="py-1">
              {results.map((game, index) => (
                <button
                  key={game.id}
                  onClick={() => navigateToGame(game.slug)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    index === selectedIndex
                      ? 'bg-purple-500/20'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center text-purple-300">
                    {CATEGORY_ICONS[game.category] || <Gamepad2 className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {game.title}
                    </p>
                    <p className="text-xs text-white/50 truncate">
                      {game.category} &middot; by {game.developerName}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
