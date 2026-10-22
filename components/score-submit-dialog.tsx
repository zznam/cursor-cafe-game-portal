'use client'

import { useRef, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { submitScore } from '@/lib/api'
import { Analytics } from '@/lib/analytics'
import { Trophy, X, Loader2 } from 'lucide-react'

const USERNAME_KEY = 'last_username'

interface ScoreSubmitDialogProps {
  gameId: string
  score: number
  onClose: () => void
  onSubmit: () => void
  onRestoreFocus: () => void
}

export function ScoreSubmitDialog({ gameId, score, onClose, onSubmit, onRestoreFocus }: ScoreSubmitDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const pending = useRef(false)
  const [username, setUsername] = useState(() => {
    try { return localStorage.getItem(USERNAME_KEY) || '' } catch { return '' }
  })
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (pending.current) return
    const trimmed = username.trim()
    if (!trimmed) {
      setErrorMsg('Please enter a username')
      inputRef.current?.focus()
      return
    }

    pending.current = true
    setStatus('submitting')
    setErrorMsg('')
    // Remembering a name is optional; blocked storage must not block a score.
    try { localStorage.setItem(USERNAME_KEY, trimmed) } catch { /* Keep playing. */ }
    try {
      await submitScore(gameId, score, trimmed)
      void Analytics.trackScoreSubmit(gameId, score)
      onSubmit()
    } catch (error) {
      setStatus('error')
      setErrorMsg(error instanceof Error ? error.message : 'Failed to submit score')
    } finally {
      pending.current = false
    }
  }

  return (
    <Dialog.Root open onOpenChange={(open) => { if (!open && !pending.current) onClose() }}>
      <Dialog.Portal container={typeof document === 'undefined' ? undefined : document.fullscreenElement}>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md max-h-[90dvh] overflow-y-auto -translate-x-1/2 -translate-y-1/2 bg-gray-900 border border-white/15 rounded-2xl p-6 shadow-2xl"
          onOpenAutoFocus={(event) => {
            event.preventDefault()
            inputRef.current?.focus()
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault()
            onRestoreFocus()
          }}
          onEscapeKeyDown={(event) => { if (pending.current) event.preventDefault() }}
          onInteractOutside={(event) => { if (pending.current) event.preventDefault() }}
        >
          <Dialog.Close asChild>
            <button
              aria-label="Close score dialog"
              disabled={status === 'submitting'}
              className="absolute top-4 right-4 p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </Dialog.Close>
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-yellow-500/20 mb-3">
              <Trophy className="w-7 h-7 text-yellow-400" />
            </div>
            <Dialog.Title className="text-2xl font-bold text-white">Submit Your Score</Dialog.Title>
            <Dialog.Description className="text-sm text-white/70 mt-2">
              Choose the name shown with your score on the public leaderboard.
            </Dialog.Description>
          </div>
          <div className="text-center mb-6">
            <p className="text-sm text-white/70 uppercase tracking-wider mb-1">Score</p>
            <p className="text-5xl font-bold text-yellow-300">{score.toLocaleString()}</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4" aria-busy={status === 'submitting'}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-white/70 mb-1.5">Username</label>
              <input
                ref={inputRef}
                id="username"
                type="text"
                autoComplete="nickname"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter your name"
                maxLength={30}
                aria-describedby={errorMsg ? 'score-submit-error' : undefined}
                className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/15 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
                disabled={status === 'submitting'}
              />
            </div>
            {errorMsg && <p id="score-submit-error" role="alert" className="text-red-300 text-sm">{errorMsg}</p>}
            <div className="flex gap-3">
              <Dialog.Close asChild>
                <button type="button" disabled={status === 'submitting'} className="flex-1 px-4 py-2.5 rounded-lg border border-white/15 text-white/70 hover:bg-white/10 disabled:opacity-50">Cancel</button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="flex-1 px-4 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {status === 'submitting' ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting…</> : 'Submit Score'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
