'use client'

import { useState, useCallback } from 'react'
import { submitScore as apiSubmitScore } from '@/lib/api'
import { Analytics } from '@/lib/analytics'

export function useGameApi(gameId: string) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submitScore = useCallback(async (
    score: number,
    username: string,
    metadata?: Record<string, any>
  ) => {
    setSubmitting(true)
    setError(null)

    try {
      await apiSubmitScore(gameId, score, username, metadata)
      await Analytics.trackScoreSubmit(gameId, score, metadata)
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit score'
      setError(message)
      return false
    } finally {
      setSubmitting(false)
    }
  }, [gameId])

  const trackGameComplete = useCallback(async (metadata?: Record<string, any>) => {
    await Analytics.trackComplete(gameId, metadata)
  }, [gameId])

  const trackGameQuit = useCallback(async (metadata?: Record<string, any>) => {
    await Analytics.trackQuit(gameId, metadata)
  }, [gameId])

  return {
    submitScore,
    trackGameComplete,
    trackGameQuit,
    submitting,
    error
  }
}
