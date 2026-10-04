'use client'
import { useEffect, useState, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import type { DailyChallenge } from '@/lib/daily'
import { usePassport } from '@/hooks/use-passport'
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
  return (
    <div className="space-y-2">
      <p>
        {challenge.date} ·{' '}
        {challenge.practice
          ? 'Past challenge · practice'
          : 'Today’s shared challenge'}{' '}
        · Unlimited retries
      </p>
      <p className="text-sm">
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
      <p className="text-sm">
        {day?.best
          ? `Your best: ${day.best.label}`
          : 'Finish a round to save your first result.'}
        {day && ` · ${day.attempts} attempts`}
      </p>
      <p className="text-sm">
        Next daily:{' '}
        {hydrated
          ? new Date(challenge.nextReset).toLocaleString(undefined, {
              dateStyle: 'medium',
              timeStyle: 'short',
            })
          : '00:00 UTC'}{' '}
        (your local time).
      </p>
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
