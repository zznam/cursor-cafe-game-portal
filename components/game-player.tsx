'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { GameLoader } from '@/lib/game-loader'
import { Analytics } from '@/lib/analytics'
import { addRecentlyPlayed } from '@/lib/recently-played'

interface GamePlayerProps {
  packageName: string
  gameId: string
  gameSlug: string
  title?: string
  controls?: string[]
}

export function GamePlayer({
  packageName,
  gameId,
  gameSlug,
  title,
  controls,
}: GamePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [started, setStarted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [copied, setCopied] = useState(false)

  const startGame = useCallback(async () => {
    if (!containerRef.current) return

    try {
      setLoading(true)
      setError(null)
      setStarted(true)

      addRecentlyPlayed(gameSlug, title || packageName)

      const gameModule = await GameLoader.loadGame(packageName)

      if (!containerRef.current) return

      const containerId = `game-container-${gameId}`
      containerRef.current.id = containerId

      gameRef.current = gameModule.createGame(containerId)

      requestAnimationFrame(() => {
        const canvas = containerRef.current?.querySelector('canvas')
        if (canvas) {
          canvas.style.maxWidth = '100%'
          canvas.style.maxHeight = '100%'
          canvas.style.objectFit = 'contain'
          canvas.style.display = 'block'
        }
      })

      await Analytics.incrementPlayCount(gameSlug)
      await Analytics.trackPlay(gameId)

      setLoading(false)
    } catch (err) {
      console.error('Failed to load game:', err)
      setError(err instanceof Error ? err.message : 'Failed to load game')
      setLoading(false)
    }
  }, [packageName, gameId, gameSlug])

  useEffect(() => {
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true)
        gameRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  const toggleFullscreen = useCallback(() => {
    const wrapper = containerRef.current?.parentElement
    if (!wrapper) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      wrapper.requestFullscreen()
    }
  }, [])

  const shareGame = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [])

  if (error) {
    return (
      <div className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-2">Failed to load game</p>
          <p className="text-sm text-gray-400">{error}</p>
          <button
            onClick={() => {
              setError(null)
              setStarted(false)
            }}
            className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden">
      {/* Pre-game overlay */}
      {!started && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gray-900/95 p-8">
          {title && (
            <h2 className="text-3xl font-bold text-white mb-6">{title}</h2>
          )}
          {controls && controls.length > 0 && (
            <div className="mb-8 text-center">
              <p className="text-sm uppercase tracking-wider text-gray-400 mb-3">
                Controls
              </p>
              <div className="space-y-2">
                {controls.map((c, i) => (
                  <p key={i} className="text-gray-200 text-lg">
                    {c}
                  </p>
                ))}
              </div>
            </div>
          )}
          <button
            onClick={startGame}
            className="px-10 py-4 bg-purple-600 hover:bg-purple-500 text-white text-xl font-bold rounded-xl transition-all hover:scale-105 shadow-lg shadow-purple-600/30"
          >
            ▶ Play
          </button>
        </div>
      )}

      {/* Loading spinner */}
      {started && loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-white">Loading game...</p>
          </div>
        </div>
      )}

      {/* Toolbar */}
      {started && !loading && (
        <div className="absolute top-2 right-2 z-10 flex gap-2">
          <button
            onClick={shareGame}
            className="p-2 bg-gray-800/70 hover:bg-gray-700/80 text-white rounded-lg transition-colors text-sm"
            title="Copy link"
          >
            {copied ? '✓ Copied' : '🔗 Share'}
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-gray-800/70 hover:bg-gray-700/80 text-white rounded-lg transition-colors text-sm"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? '⊡ Exit' : '⛶ Fullscreen'}
          </button>
        </div>
      )}

      {/* Game container */}
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      />
    </div>
  )
}
