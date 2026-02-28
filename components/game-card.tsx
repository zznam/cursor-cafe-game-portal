'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { GameMetadata } from '@/types/game'
import { Star, Play, Heart, Sword, Zap, Puzzle, Target, MapPin, Rocket, Car, Trophy, Gamepad2 } from 'lucide-react'
import { isFavorite, toggleFavorite } from '@/lib/game-loader'
import { useState, useEffect } from 'react'

interface GameCardProps {
  game: GameMetadata
}

const CATEGORY_GRADIENTS: Record<string, string> = {
  Action: 'from-red-600/80 via-orange-600/60 to-yellow-600/40',
  Arcade: 'from-violet-600/80 via-purple-600/60 to-fuchsia-600/40',
  Puzzle: 'from-cyan-600/80 via-teal-600/60 to-emerald-600/40',
  Strategy: 'from-blue-600/80 via-indigo-600/60 to-violet-600/40',
  Adventure: 'from-emerald-600/80 via-green-600/60 to-lime-600/40',
  Platformer: 'from-sky-600/80 via-blue-600/60 to-indigo-600/40',
  Shooter: 'from-rose-600/80 via-red-600/60 to-orange-600/40',
  Racing: 'from-amber-600/80 via-yellow-600/60 to-lime-600/40',
  Sports: 'from-green-600/80 via-emerald-600/60 to-teal-600/40',
  Other: 'from-purple-600/80 via-pink-600/60 to-rose-600/40',
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Action: <Sword className="w-10 h-10" />,
  Arcade: <Zap className="w-10 h-10" />,
  Puzzle: <Puzzle className="w-10 h-10" />,
  Strategy: <Target className="w-10 h-10" />,
  Adventure: <MapPin className="w-10 h-10" />,
  Platformer: <Rocket className="w-10 h-10" />,
  Shooter: <Target className="w-10 h-10" />,
  Racing: <Car className="w-10 h-10" />,
  Sports: <Trophy className="w-10 h-10" />,
  Other: <Gamepad2 className="w-10 h-10" />,
}

export function GameCard({ game }: GameCardProps) {
  const [favorite, setFavorite] = useState(false)

  useEffect(() => {
    setFavorite(isFavorite(game.id))
  }, [game.id])

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const newState = toggleFavorite(game.id)
    setFavorite(newState)
  }

  const gradient = CATEGORY_GRADIENTS[game.category] || CATEGORY_GRADIENTS.Other
  const icon = CATEGORY_ICONS[game.category] || CATEGORY_ICONS.Other

  return (
    <Link href={`/games/${game.slug}`} className="block group">
      <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 hover:border-white/20 hover:scale-[1.02]">
        <div className={`relative aspect-video overflow-hidden bg-linear-to-br ${gradient}`}>
          <div className="absolute inset-0 flex items-center justify-center text-white/30">
            {icon}
          </div>

          <Image
            src={game.thumbnailUrl}
            alt={game.title}
            fill
            unoptimized
            className="object-cover relative z-10"
          />

          <div className="absolute inset-0 z-20 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 rounded-lg text-white font-medium text-sm shadow-lg shadow-purple-500/30">
              <Play className="w-4 h-4" />
              Play Now
            </div>
          </div>

          <button
            onClick={handleFavoriteClick}
            className="absolute top-2 right-2 z-30 p-2 bg-black/40 rounded-full hover:bg-black/60 transition-colors"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                favorite ? 'fill-red-500 text-red-500' : 'text-white/80'
              }`}
            />
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-bold text-white line-clamp-1">{game.title}</h3>
            <Badge className="bg-white/10 text-white/80 border-white/10 text-xs shrink-0">
              {game.category}
            </Badge>
          </div>
          <p className="text-sm text-white/60 line-clamp-2 mb-3">
            {game.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1 text-yellow-400">
                <Star className="w-3.5 h-3.5 fill-yellow-400" />
                <span className="font-medium text-white/90">
                  {game.averageRating > 0 ? game.averageRating.toFixed(1) : 'New'}
                </span>
              </div>
              <div className="flex items-center gap-1 text-white/50">
                <Play className="w-3.5 h-3.5" />
                <span>{game.playCount.toLocaleString()}</span>
              </div>
            </div>
            <p className="text-xs text-white/40">
              by {game.developerName}
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}
