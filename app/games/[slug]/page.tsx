import { getGameBySlug } from '@/lib/api'
import { GamePlayer } from '@/components/game-player'
import { Leaderboard } from '@/components/leaderboard'
import { RatingSystem } from '@/components/rating-system'
import { CommentsSection } from '@/components/comments-section'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star, Play, ExternalLink } from 'lucide-react'
import { notFound } from 'next/navigation'
import Image from 'next/image'

export const revalidate = 60

export default async function GamePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const game = await getGameBySlug(slug)

  if (!game) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {game.bannerUrl && (
        <div className="relative w-full h-64 rounded-lg overflow-hidden mb-8">
          <Image
            src={game.bannerUrl}
            alt={game.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">{game.title}</h1>
                <p className="text-white/80">by {game.developerName}</p>
              </div>
              <Badge className="text-lg px-4 py-2">{game.category}</Badge>
            </div>

            <div className="flex items-center gap-6 mb-4">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="text-white font-medium">
                  {game.averageRating > 0 ? game.averageRating.toFixed(1) : 'New'}
                </span>
                <span className="text-white/60 text-sm">
                  ({game.totalRatings} ratings)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Play className="w-5 h-5 text-white" />
                <span className="text-white font-medium">
                  {game.playCount.toLocaleString()} plays
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {game.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>

            <p className="text-white/90 mb-4">{game.description}</p>

            {game.developerUrl && (
              <Button variant="outline" className="gap-2 bg-white/10 text-white border-white/20 hover:bg-white/20">
                <ExternalLink className="w-4 h-4" />
                Developer Website
              </Button>
            )}
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
            <GamePlayer
              packageName={game.packageName}
              gameId={game.id}
              gameSlug={game.slug}
            />
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 overflow-hidden">
            <CommentsSection gameId={game.id} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 overflow-hidden">
            <Leaderboard gameId={game.id} />
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 overflow-hidden">
            <RatingSystem gameId={game.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
