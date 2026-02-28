'use client'

import { useEffect, useRef, useState } from 'react'
import { GameLoader } from '@/lib/game-loader'
import { Analytics } from '@/lib/analytics'
import Phaser from 'phaser'

interface GamePlayerProps {
  packageName: string
  gameId: string
  gameSlug: string
}

export function GamePlayer({ packageName, gameId, gameSlug }: GamePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Phaser.Game | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function loadAndStartGame() {
      if (!containerRef.current) return

      try {
        setLoading(true)
        setError(null)

        const gameModule = await GameLoader.loadGame(packageName)
        
        if (!mounted) return

        const containerId = `game-container-${gameId}`
        containerRef.current.id = containerId

        gameRef.current = gameModule.createGame(containerId)

        await Analytics.incrementPlayCount(gameSlug)
        await Analytics.trackPlay(gameId)

        setLoading(false)
      } catch (err) {
        console.error('Failed to load game:', err)
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load game')
          setLoading(false)
        }
      }
    }

    loadAndStartGame()

    return () => {
      mounted = false
      if (gameRef.current) {
        gameRef.current.destroy(true)
        gameRef.current = null
      }
    }
  }, [packageName, gameId, gameSlug])

  if (error) {
    return (
      <div className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-2">Failed to load game</p>
          <p className="text-sm text-gray-400">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-white">Loading game...</p>
          </div>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  )
}
