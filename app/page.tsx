import { getGames } from '@/lib/api'
import { GameCard } from '@/components/game-card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sparkles, TrendingUp, Star } from 'lucide-react'
import Link from 'next/link'
import { GAME_CATEGORIES } from '@/types/game'

export const revalidate = 60

export default async function HomePage() {
  let featuredGames = []
  let popularGames = []
  let newGames = []

  try {
    featuredGames = await getGames({ featured: true, limit: 6 })
    popularGames = await getGames({ limit: 8 })
    newGames = await getGames({ limit: 8 })
  } catch (error) {
    console.error('Failed to load games:', error)
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <section className="text-center mb-16">
        <div className="inline-block mb-4">
          <Sparkles className="w-16 h-16 text-yellow-300 animate-pulse" />
        </div>
        <h1 className="text-6xl font-bold text-white mb-4">
          Welcome to Game Portal
        </h1>
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Discover and play amazing Phaser games created by talented developers from around the world
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/games">
            <Button size="lg" className="gap-2">
              <Sparkles className="w-5 h-5" />
              Browse All Games
            </Button>
          </Link>
          <Link href="/contribute">
            <Button size="lg" variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
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

      <section>
        <h2 className="text-3xl font-bold text-white mb-6">New Releases</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {newGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </section>
    </div>
  )
}
