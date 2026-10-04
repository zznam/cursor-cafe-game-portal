'use client'
import Link from 'next/link'
import { usePassport } from '@/hooks/use-passport'
import { BADGES } from '@/lib/passport'
import type { GameMetadata } from '@/types/game'
export function Passport({ games }: { games: GameMetadata[] }) {
  const progress = usePassport()
  const history = [
    ...Object.entries(progress.days).map(([date, day]) => ({
      date,
      day,
      practice: false,
    })),
    ...Object.entries(progress.practiceDays).map(([date, day]) => ({
      date,
      day,
      practice: true,
    })),
  ].sort(
    (a, b) =>
      b.date.localeCompare(a.date) || Number(a.practice) - Number(b.practice),
  )
  return (
    <div className="space-y-8">
      <section className="cafe-panel">
        <p className="uppercase tracking-widest text-sm mb-3">
          Your table at the café
        </p>
        <h1 className="text-4xl font-bold mb-3">Game passport</h1>
        <p>
          {Object.keys(progress.stamps).length} stamps collected ·{' '}
          {progress.badges.length} of 8 badges
        </p>
        <p className="text-sm mt-3">
          Saved on this browser only. Clearing browser data removes your
          passport. All games are always unlocked.
        </p>
        {progress.unavailable && (
          <p role="status" className="mt-3 font-semibold">
            Saving is unavailable. Progress may be lost when this page closes.
          </p>
        )}
      </section>
      <section>
        <h2 className="text-2xl mb-4">Milestone badges</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {BADGES.map(([id, title, description]) => (
            <div
              key={id}
              className={`rounded-xl border p-4 ${progress.badges.includes(id) ? 'bg-amber-100 border-amber-300 text-stone-900' : 'bg-white/5 border-white/15 text-white/70'}`}
            >
              <span className="text-xs uppercase tracking-wide">
                {progress.badges.includes(id) ? 'Earned' : 'To discover'}
              </span>
              <h3 className="font-bold mt-2">{title}</h3>
              <p className="text-sm">{description}</p>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-2xl mb-4">Game stamps</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {games.map((game) => (
            <Link
              key={game.slug}
              href={`/games/${game.slug}`}
              className={`rounded-xl border p-4 ${progress.stamps[game.slug] ? 'border-amber-300/70 bg-amber-100/10' : 'border-white/15 bg-white/5'}`}
            >
              <span className="text-sm text-amber-200">
                {progress.stamps[game.slug] ? '✓ Stamped' : 'Try this game'}
              </span>
              <h3 className="font-bold mt-1">{game.title}</h3>
              {progress.bests[game.slug] && (
                <p className="text-sm text-white/70">
                  Best: {progress.bests[game.slug].label}
                </p>
              )}
            </Link>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-2xl mb-4">Daily history</h2>
        {!history.length ? (
          <p className="text-white/70">
            Your first brew is waiting.{' '}
            <Link href="/daily" className="underline">
              Play the daily challenge
            </Link>
            .
          </p>
        ) : (
          <div className="space-y-3">
            {history.map(({ date, day, practice }) => (
              <Link
                href={`/daily?date=${date}`}
                key={`${date}-${practice}`}
                className="block rounded-xl border border-white/15 p-4"
              >
                <p className="font-semibold">
                  {date} · {day.title}
                  {practice ? ' · Practice' : ''}
                </p>
                <p className="text-sm text-white/70">
                  {day.best?.label ?? 'No finished result yet'} · {day.attempts}{' '}
                  attempts
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
