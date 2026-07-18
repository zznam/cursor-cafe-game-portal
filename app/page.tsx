import {getGames} from "@/lib/api";
import {GameCard} from "@/components/game-card";
import {RecentlyPlayed} from "@/components/recently-played";
import {Button} from "@/components/ui/button";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {
  Sparkles,
  TrendingUp,
  Star,
  Coffee,
  Gamepad2,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";
import {GAME_CATEGORIES} from "@/types/game";

export const revalidate = 60;

export default async function HomePage() {
  let featuredGames: Awaited<ReturnType<typeof getGames>> = [];
  let popularGames: Awaited<ReturnType<typeof getGames>> = [];

  try {
    [featuredGames, popularGames] = await Promise.all([
      getGames({featured: true, limit: 6}),
      getGames({limit: 8}),
    ]);
  } catch (error) {
    console.error("Failed to load games:", error);
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <section className="text-center mb-16 relative">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl" />
          <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-pink-500/10 rounded-full blur-3xl" />
        </div>

        <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
          <Coffee className="w-4 h-4 text-amber-400" />
          <span className="text-sm text-white/70 font-medium">
            Welcome to the Café
          </span>
          <Sparkles className="w-4 h-4 text-yellow-300" />
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-linear-to-r from-amber-200 via-purple-300 to-pink-300 bg-clip-text text-transparent leading-tight">
          Your Cozy Corner for
          <br />
          Amazing Games
        </h1>
        <p className="text-lg md:text-xl text-white/70 mb-8 max-w-2xl mx-auto leading-relaxed">
          Grab a virtual coffee and dive into 27+ handcrafted browser games.
          Compete on leaderboards, rate your favorites, and discover something
          new every day.
        </p>

        <div className="flex flex-wrap gap-4 justify-center mb-10">
          <Link href="/games">
            <Button
              size="lg"
              className="gap-2 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40 hover:scale-105"
            >
              <Gamepad2 className="w-5 h-5" />
              Play Now
            </Button>
          </Link>
          <Link href="/contribute">
            <Button
              size="lg"
              variant="outline"
              className="bg-white/5 text-white border-white/20 hover:bg-white/10 backdrop-blur-sm transition-all hover:scale-105"
            >
              Contribute a Game
            </Button>
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
          <div className="flex items-center gap-2 text-white/60">
            <Gamepad2 className="w-5 h-5 text-purple-400" />
            <span className="text-sm font-medium">
              <strong className="text-white">27+</strong> Games
            </span>
          </div>
          <div className="flex items-center gap-2 text-white/60">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-medium">
              <strong className="text-white">Live</strong> Leaderboards
            </span>
          </div>
          <div className="flex items-center gap-2 text-white/60">
            <Star className="w-5 h-5 text-yellow-400" />
            <span className="text-sm font-medium">
              <strong className="text-white">5-Star</strong> Ratings
            </span>
          </div>
          <div className="flex items-center gap-2 text-white/60">
            <Users className="w-5 h-5 text-pink-400" />
            <span className="text-sm font-medium">
              <strong className="text-white">Open</strong> Community
            </span>
          </div>
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
  );
}
