import { getGameBySlug } from '@/lib/api'
import { GamePlayer } from '@/components/game-player'
import { Leaderboard } from '@/components/leaderboard'
import { RatingSystem } from '@/components/rating-system'
import { CommentsSection } from '@/components/comments-section'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GAME_CONTROLS } from '@/lib/game-controls'
import { ArrowLeft, Share2, Link2, Star, Play, ExternalLink } from 'lucide-react'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

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

  const controlsData = GAME_CONTROLS[game.slug]
  const controlsTitle = controlsData?.title ?? game.title
  const controlsList = controlsData?.controls ?? []

  const shareUrl = `https://game-portal.example.com/games/${game.slug}`
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${game.title} on Game Portal!`)}&url=${encodeURIComponent(shareUrl)}`

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/games"
        className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Games
      </Link>

      {game.bannerUrl && (
        <div className="relative w-full h-48 md:h-64 rounded-xl overflow-hidden mb-8">
          <Image
            src={game.bannerUrl}
            alt={game.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
                  {game.title}
                </h1>
                <p className="text-white/70">by {game.developerName}</p>
              </div>
              <Badge className="text-sm px-3 py-1.5 shrink-0 self-start">
                {game.category}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-4 md:gap-6 mb-4">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="text-white font-medium">
                  {game.averageRating > 0
                    ? game.averageRating.toFixed(1)
                    : 'New'}
                </span>
                <span className="text-white/50 text-sm">
                  ({game.totalRatings} ratings)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Play className="w-5 h-5 text-white/80" />
                <span className="text-white font-medium">
                  {game.playCount.toLocaleString()} plays
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {game.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-white/10 text-white/80 border-white/10"
                >
                  {tag}
                </Badge>
              ))}
            </div>

            <p className="text-white/85 leading-relaxed mb-5">
              {game.description}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              {game.developerUrl && (
                <a href={game.developerUrl} target="_blank" rel="noopener noreferrer">
                  <Button
                    variant="outline"
                    className="gap-2 bg-white/5 text-white border-white/20 hover:bg-white/15"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Developer Website
                  </Button>
                </a>
              )}

              <Button
                variant="outline"
                className="gap-2 bg-white/5 text-white border-white/20 hover:bg-white/15"
                asChild
              >
                <a
                  href={twitterShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Share2 className="w-4 h-4" />
                  Share on X
                </a>
              </Button>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 md:p-6 border border-white/20">
            <GamePlayer
              packageName={game.packageName}
              gameId={game.id}
              gameSlug={game.slug}
              title={controlsTitle}
              controls={controlsList}
            />
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
            <CommentsSection gameId={game.id} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
            <Leaderboard gameId={game.id} />
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
            <RatingSystem gameId={game.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
