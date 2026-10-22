'use client'
import Link from 'next/link'
import { usePassport } from '@/hooks/use-passport'
import { BADGES, dailyStreak } from '@/lib/passport'
import type { GameMetadata } from '@/types/game'
export function Passport({ games }: { games: GameMetadata[] }) {
  const progress = usePassport()
  const streak = dailyStreak(
    progress.finishedDates,
    new Date().toISOString().slice(0, 10),
  )
  const titles = Object.fromEntries(games.map((g) => [g.slug, g.title]))
  const [topSlug, topPlays] =
    Object.entries(progress.plays).sort((a, b) => b[1] - a[1])[0] ?? []
  const bests = Object.entries(progress.bests)
    .map(([slug, best]) => ({ slug, best, title: titles[slug] ?? progress.stamps[slug]?.title ?? slug }))
    .sort((a, b) => a.title.localeCompare(b.title))
  const stats = [
    { label: 'Rounds started', value: progress.totalPlays.toLocaleString() },
    { label: 'Games tried', value: `${Object.keys(progress.stamps).length} / ${games.length}` },
    {
      label: 'Daily streak',
      value: `${streak.current} day${streak.current === 1 ? '' : 's'}`,
      hint: `Longest: ${streak.longest}`,
    },
    {
      label: 'Most played',
      value: topSlug ? (titles[topSlug] ?? progress.stamps[topSlug]?.title ?? topSlug) : '—',
      hint: topPlays ? `${topPlays} round${topPlays === 1 ? '' : 's'}` : undefined,
    },
  ]
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
    <div className="space-y-10">
      <section className="cafe-panel">
        <p className="uppercase tracking-widest text-xs font-semibold text-amber-900/80 mb-2">
          Your table at the café
        </p>
        <h1 className="text-4xl font-bold mb-2 text-stone-900">Game passport</h1>
        <p className="font-medium text-stone-800">
          {Object.keys(progress.stamps).length} stamps collected ·{' '}
          {progress.badges.length} of {BADGES.length} badges
        </p>
        <p className="text-sm text-stone-600 mt-2">
          Saved on this browser only. Clearing browser data removes your
          passport. All games are always unlocked.
        </p>
        {progress.unavailable && (
          <p role="status" className="mt-3 font-semibold text-amber-900 bg-amber-500/20 p-2.5 rounded-lg border border-amber-500/30">
            Saving is unavailable. Progress may be lost when this page closes.
          </p>
        )}
      </section>
      <section aria-label="Your stats" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-white/10 bg-white/5 p-4 min-w-0"
          >
            <p className="text-xs uppercase tracking-wider font-semibold text-white/50">
              {stat.label}
            </p>
            <p className="text-2xl font-bold text-white mt-1 truncate" title={stat.value}>
              {stat.value}
            </p>
            {stat.hint && <p className="text-sm text-amber-200/80">{stat.hint}</p>}
          </div>
        ))}
      </section>
      {bests.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">Personal bests</h2>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {bests.map(({ slug, best, title }) => (
              <li key={slug}>
                <Link
                  href={`/games/${slug}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-amber-300/30 bg-amber-500/10 px-4 py-3 hover:border-amber-300 transition-colors"
                >
                  <span className="font-semibold text-white truncate">{title}</span>
                  <span className="text-sm text-amber-200 font-medium shrink-0">{best.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      <section>
        <h2 className="text-2xl font-bold text-white mb-4">Milestone badges</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {BADGES.map(([id, title, description]) => (
            <div
              key={id}
              className={`rounded-xl border p-4 transition-all ${progress.badges.includes(id) ? 'bg-amber-100 border-amber-300 text-stone-900 shadow-md shadow-amber-500/10' : 'bg-white/5 border-white/10 text-white/70 hover:border-white/20'}`}
            >
              <span className={`text-xs uppercase tracking-wide font-semibold ${progress.badges.includes(id) ? 'text-amber-800' : 'text-white/40'}`}>
                {progress.badges.includes(id) ? 'Earned' : 'To discover'}
              </span>
              <h3 className="font-bold mt-1 text-base">{title}</h3>
              <p className={`text-sm mt-1 leading-relaxed ${progress.badges.includes(id) ? 'text-stone-700' : 'text-white/50'}`}>{description}</p>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-2xl font-bold text-white mb-4">Game stamps</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.map((game) => (
            <Link
              key={game.slug}
              href={`/games/${game.slug}`}
              className={`group rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${progress.stamps[game.slug] ? 'border-amber-300/60 bg-amber-500/10 hover:border-amber-300 hover:shadow-amber-500/10' : 'border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10'}`}
            >
              <span className={`text-xs font-semibold uppercase tracking-wider ${progress.stamps[game.slug] ? 'text-amber-300' : 'text-white/50 group-hover:text-white/80'}`}>
                {progress.stamps[game.slug] ? '✓ Stamped' : 'Try this game'}
              </span>
              <h3 className="font-bold mt-1 text-white group-hover:text-purple-300 transition-colors">{game.title}</h3>
              {progress.bests[game.slug] && (
                <p className="text-sm text-amber-200/80 mt-1 font-medium">
                  Best: {progress.bests[game.slug].label}
                </p>
              )}
            </Link>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-2xl font-bold text-white mb-4">Daily history</h2>
        {!history.length ? (
          <p className="text-white/70">
            Your first brew is waiting.{' '}
            <Link href="/daily" className="underline text-amber-300 hover:text-amber-200 font-medium">
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
                className="group block rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 p-4 transition-all"
              >
                <p className="font-semibold text-white group-hover:text-purple-300 transition-colors">
                  {date} · {day.title}
                  {practice ? ' · Practice' : ''}
                </p>
                <p className="text-sm text-white/60 mt-0.5">
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
