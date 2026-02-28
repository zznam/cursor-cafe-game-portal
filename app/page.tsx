import { getGames } from '@/lib/api'
import { GameCard } from '@/components/game-card'
import { RecentlyPlayed } from '@/components/recently-played'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sparkles, TrendingUp, Star } from 'lucide-react'
import Link from 'next/link'
import { GAME_CATEGORIES } from '@/types/game'

export const revalidate = 60

export default async function HomePage() {
  let featuredGames: Awaited<ReturnType<typeof getGames>> = []
  let popularGames: Awaited<ReturnType<typeof getGames>> = []

  try {
    ;[featuredGames, popularGames] = await Promise.all([
      getGames({ featured: true, limit: 6 }),
      getGames({ limit: 8 }),
    ])
  } catch (error) {
    console.error('Failed to load games:', error)
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <section className="text-center mb-16">
        <div className="inline-block mb-4 animate-pulse">
          <Sparkles className="w-16 h-16 text-yellow-300" />
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-linear-to-r from-purple-300 via-pink-300 to-yellow-300 bg-clip-text text-transparent">
          Welcome to Game Portal
        </h1>
        <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
          Discover and play amazing Phaser games created by talented developers
          from around the world
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/games">
            <Button size="lg" className="gap-2">
              <Sparkles className="w-5 h-5" />
              Browse All Games
            </Button>
          </Link>
          <Link href="/contribute">
            <Button
              size="lg"
              variant="outline"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              Contribute a Game
            </Button>
          </Link>
        </div>
      </section>

      {featuredGames.length > 0 && (
        <section className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <Star className="w-6 h-6 text-yellow-300" />
            <h2 className="text-3xl font-bold text-white">Featured Games</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </section>
      )}

      <RecentlyPlayed />

      <section className="mb-16">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-6 h-6 text-green-300" />
          <h2 className="text-3xl font-bold text-white">Popular Games</h2>
        </div>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-white/10 mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            {GAME_CATEGORIES.slice(0, 5).map((category) => (
              <TabsTrigger key={category} value={category.toLowerCase()}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </TabsContent>
          {GAME_CATEGORIES.slice(0, 5).map((category) => (
            <TabsContent key={category} value={category.toLowerCase()}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {popularGames
                  .filter((game) => game.category === category)
                  .map((game) => (
                    <GameCard key={game.id} game={game} />
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </section>
    </div>
  )
}
