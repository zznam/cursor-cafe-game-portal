'use client'

import { useEffect, useRef, useState } from 'react'
import { submitScore } from '@/lib/api'
import { Trophy, X, Loader2 } from 'lucide-react'

const USERNAME_KEY = 'last_username'

interface ScoreSubmitDialogProps {
  gameId: string
  score: number
  onClose: () => void
  onSubmit: () => void
}

export function ScoreSubmitDialog({
  gameId,
  score,
  onClose,
  onSubmit,
}: ScoreSubmitDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [username, setUsername] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem(USERNAME_KEY)
    if (saved) setUsername(saved)
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmed = username.trim()
    if (!trimmed) {
      setErrorMsg('Please enter a username')
      inputRef.current?.focus()
      return
    }

    setStatus('submitting')
    setErrorMsg('')

    try {
      localStorage.setItem(USERNAME_KEY, trimmed)
      await submitScore(gameId, score, trimmed)
      setStatus('success')
      setTimeout(() => {
        onSubmit()
      }, 1200)
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Failed to submit score')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-gray-900/95 backdrop-blur-md border border-white/15 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-white/50 hover:text-white transition-colors rounded-lg hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-yellow-500/20 mb-3">
            <Trophy className="w-7 h-7 text-yellow-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Submit Your Score</h2>
        </div>

        <div className="text-center mb-6">
          <p className="text-sm text-white/50 uppercase tracking-wider mb-1">
            Score
          </p>
          <p className="text-5xl font-bold bg-linear-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
            {score.toLocaleString()}
          </p>
        </div>

        {status === 'success' ? (
          <div className="text-center py-4">
            <p className="text-green-400 font-medium text-lg">
              Score submitted!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-white/70 mb-1.5"
              >
                Username
              </label>
              <input
                ref={inputRef}
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your name"
                maxLength={30}
                className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/15 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow"
                disabled={status === 'submitting'}
              />
            </div>

            {errorMsg && (
              <p className="text-red-400 text-sm">{errorMsg}</p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-lg border border-white/15 text-white/70 hover:bg-white/10 transition-colors disabled:opacity-50"
                disabled={status === 'submitting'}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                disabled={status === 'submitting'}
              >
                {status === 'submitting' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Score'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
