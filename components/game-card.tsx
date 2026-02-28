'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GameMetadata } from '@/types/game'
import { Star, Play, Heart } from 'lucide-react'
import { isFavorite, toggleFavorite } from '@/lib/game-loader'
import { useState, useEffect } from 'react'

interface GameCardProps {
  game: GameMetadata
}

export function GameCard({ game }: GameCardProps) {
  const [favorite, setFavorite] = useState(false)

  useEffect(() => {
    setFavorite(isFavorite(game.id))
  }, [game.id])

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    const newState = toggleFavorite(game.id)
    setFavorite(newState)
  }

  return (
    <Link href={`/games/${game.slug}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-xl hover:scale-[1.02] cursor-pointer">
        <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500">
          <Image
            src={game.thumbnailUrl}
            alt={game.title}
            fill
            className="object-cover transition-transform group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button size="lg" className="gap-2">
              <Play className="w-5 h-5" />
              Play Now
            </Button>
          </div>
          <button
            onClick={handleFavoriteClick}
            className="absolute top-2 right-2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
          >
            <Heart
              className={`w-5 h-5 ${favorite ? 'fill-red-500 text-red-500' : 'text-white'}`}
            />
          </button>
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-bold text-lg line-clamp-1">{game.title}</h3>
            <Badge variant="secondary">{game.category}</Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {game.description}
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">
                {game.averageRating > 0 ? game.averageRating.toFixed(1) : 'New'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Play className="w-4 h-4" />
              <span>{game.playCount.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="px-4 pb-4 pt-0">
          <p className="text-xs text-muted-foreground">
            by {game.developerName}
          </p>
        </CardFooter>
      </Card>
    </Link>
  )
}
