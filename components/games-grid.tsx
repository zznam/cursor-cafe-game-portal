'use client'

import { useState, useMemo } from 'react'
import { GameCard } from '@/components/game-card'
import { GameMetadata } from '@/types/game'

interface GamesGridProps {
  games: GameMetadata[]
  categories: string[]
}

export function GamesGrid({ games, categories }: GamesGridProps) {
  const [active, setActive] = useState<string | null>(null)

  const filtered = useMemo(
    () => (active ? games.filter((g) => g.category === active) : games),
    [games, active]
  )

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setActive(null)}
          className={`px-4 py-2 rounded-full transition-colors cursor-pointer ${
            !active
              ? 'bg-white text-purple-600 font-medium'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`px-4 py-2 rounded-full transition-colors cursor-pointer ${
              active === cat
                ? 'bg-white text-purple-600 font-medium'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl text-white/80">
            No games found in this category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </>
  )
}
