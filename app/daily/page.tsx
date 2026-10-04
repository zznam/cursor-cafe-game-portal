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
      <div className="container mx-auto p-8">
        <h1 className="text-3xl mb-4">Choose a valid challenge date</h1>
        <Link href="/daily" className="underline">
          Play today’s daily
        </Link>
      </div>
    )
  }
  const game = await getGameBySlug(challenge.slug)
  if (!game)
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-3xl mb-4">The daily is brewing</h1>
        <p>Today’s game is not available yet. Please check back soon.</p>
        <Link href="/games" className="underline">
          Browse games
        </Link>
      </div>
    )
  return (
    <div className="max-w-3xl mx-auto px-3 py-8 space-y-6">
      <section className="cafe-panel">
        <p className="uppercase tracking-widest text-sm mb-3">
          A little ritual, every day
        </p>
        <h1 className="text-4xl font-bold mb-2">Daily brew</h1>
        <h2 className="text-xl mb-4">{game.title}</h2>
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
