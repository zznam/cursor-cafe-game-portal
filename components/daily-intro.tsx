'use client'
import { useEffect, useState, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import type { DailyChallenge } from '@/lib/daily'
import { usePassport } from '@/hooks/use-passport'
import { dailyStreak } from '@/lib/passport'
const subscribe = () => () => {}
export function DailyIntro({ challenge }: { challenge: DailyChallenge }) {
  const router = useRouter(),
    progress = usePassport()
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
  const [expired, setExpired] = useState(false)
  useEffect(() => {
    const timer = setInterval(
      () => setExpired(Date.now() >= Date.parse(challenge.nextReset)),
      1000,
    )
    return () => clearInterval(timer)
  }, [challenge.nextReset])
  const day = (challenge.practice ? progress.practiceDays : progress.days)[
    challenge.date
  ]
  const streak = dailyStreak(
    progress.finishedDates,
    new Date().toISOString().slice(0, 10),
  )
  const doneToday = progress.finishedDates.includes(challenge.date)
  return (
    <div className="space-y-3">
      <p className="font-semibold text-stone-800">
        {challenge.date} ·{' '}
        {challenge.practice
          ? 'Past challenge · practice'
          : 'Today’s shared challenge'}{' '}
        · Unlimited retries
      </p>
      <p className="text-sm text-stone-700 leading-relaxed">
        {
          {
            'coffee-connections':
              'Today’s shared puzzle: complete the connection in as few rotations as possible.',
            'pastry-blocks':
              'A fixed sequence of 30 pastries. Your highest score wins; no available placement ends the round early.',
            'cup-stack':
              'Stack up to 30 layers. Height wins first, then remaining width breaks ties.',
            'sugar-orbit':
              'Survive the shared 90-second course for as long as possible.',
          }[challenge.slug]
        }
      </p>
      <div className="flex flex-wrap gap-2.5 pt-1">
        <p className="text-sm font-medium px-3 py-1.5 rounded-lg bg-amber-900/10 text-stone-900 border border-amber-900/15">
          {day?.best
            ? `Your best: ${day.best.label}`
            : 'Finish a round to save your first result.'}
          {day && ` · ${day.attempts} attempts`}
        </p>
        {hydrated && !challenge.practice && (
          <p className="text-sm font-medium px-3 py-1.5 rounded-lg bg-orange-500/15 text-orange-950 border border-orange-700/20">
            {streak.current > 0
              ? `🔥 ${streak.current}-day streak${doneToday ? '' : ' · finish today to keep it'}`
              : '🔥 Finish today to start a streak'}
          </p>
        )}
        <p className="text-sm px-3 py-1.5 rounded-lg bg-amber-900/5 text-stone-700 border border-amber-900/10">
          Next daily:{' '}
          {hydrated
            ? new Date(challenge.nextReset).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
              })
            : '00:00 UTC'}{' '}
          (your local time).
        </p>
      </div>
      {expired && (
        <p>
          A new challenge is ready. Your current run stays with its original
          date.{' '}
          <button
            className="underline font-bold"
            onClick={() => {
              router.replace('/daily')
              router.refresh()
            }}
          >
            Open the new daily
          </button>
        </p>
      )}
    </div>
  )
}
