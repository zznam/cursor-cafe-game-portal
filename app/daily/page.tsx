import Link from 'next/link'
import { dailyChallenge } from '@/lib/daily'
import { getGameBySlug } from '@/lib/server/catalog'
import { GamePlayer } from '@/components/game-player'
import { GAME_CONTROLS } from '@/lib/game-controls'
import { DailyIntro } from '@/components/daily-intro'
export const dynamic = 'force-dynamic'
export default async function DailyPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const { date } = await searchParams
  let challenge
  try {
    challenge = dailyChallenge(date)
  } catch {
    return (
      <div className="container mx-auto px-4 py-16 max-w-lg text-center">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
          <h1 className="text-2xl font-bold text-white mb-3">Choose a valid challenge date</h1>
          <p className="text-white/60 mb-5">The date provided does not have a challenge record.</p>
          <Link href="/daily" className="inline-block px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors">
            Play today’s daily
          </Link>
        </div>
      </div>
    )
  }
  const game = await getGameBySlug(challenge.slug)
  if (!game)
    return (
      <div className="container mx-auto px-4 py-16 max-w-lg text-center">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
          <h1 className="text-2xl font-bold text-white mb-3">The daily is brewing</h1>
          <p className="text-white/70 mb-5">Today’s game is not available yet. Please check back soon.</p>
          <Link href="/games" className="inline-block px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium transition-colors">
            Browse games
          </Link>
        </div>
      </div>
    )
  return (
    <div className="max-w-3xl mx-auto px-3 py-8 space-y-6">
      <section className="cafe-panel">
        <p className="uppercase tracking-widest text-xs font-semibold text-amber-900/80 mb-2">
          A little ritual, every day
        </p>
        <h1 className="text-4xl font-bold mb-1 text-stone-900">Daily brew</h1>
        <h2 className="text-xl font-semibold mb-4 text-amber-950">{game.title}</h2>
        <DailyIntro key={challenge.date} challenge={challenge} />
      </section>
      <GamePlayer
        key={challenge.date}
        packageName={game.packageName}
        gameId={game.id}
        gameSlug={game.slug}
        title={game.title}
        category={game.category}
        daily={challenge}
        controls={GAME_CONTROLS[game.slug]?.controls}
      />
      <p className="text-sm text-white/70">
        Results stay in this browser.{' '}
        <Link href="/passport" className="underline">
          Visit your passport
        </Link>{' '}
        or{' '}
        <Link href={`/games/${game.slug}`} className="underline">
          try a fresh normal round
        </Link>
        .
      </p>
    </div>
  )
}
