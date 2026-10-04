'use client'
import type { Game } from 'phaser'
import { useCallback, useEffect, useRef, useState } from 'react'
import { GameLoader } from '@/lib/game-loader'
import { Analytics } from '@/lib/analytics'
import { addRecentlyPlayed } from '@/lib/recently-played'
import { createInputBridge, INPUT_CANCEL_EVENT } from '@/lib/game-runtime'
import {
  CAFE_GAMES,
  resultShare,
  type DailyChallenge,
  type GameResult,
} from '@/lib/daily'
import { saveActivity, usePassport } from '@/hooks/use-passport'
import {
  TouchControls,
  capabilitiesFor,
  type InputBridge,
} from './touch-controls'
import { ShareResult } from './share-result'

const SCROLL_KEYS = new Set([
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  ' ',
  'PageUp',
  'PageDown',
  'Home',
  'End',
])
interface GamePlayerProps {
  packageName: string
  gameId: string
  gameSlug: string
  title?: string
  category?: string
  controls?: string[]
  daily?: DailyChallenge
}
export function GamePlayer({
  packageName,
  gameId,
  gameSlug,
  title,
  category = 'Other',
  controls,
  daily,
}: GamePlayerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null),
    containerRef = useRef<HTMLDivElement>(null),
    gameRef = useRef<Game | null>(null)
  const bridge = useRef<InputBridge | null>(null),
    generation = useRef(0),
    interaction = useRef<() => void>(() => {})
  const soundRef = useRef(false),
    ready = useRef(false),
    pauseRef = useRef(false)
  const [loading, setLoading] = useState(false),
    [started, setStarted] = useState(false),
    [error, setError] = useState('')
  const [paused, setPaused] = useState(false),
    [sound, setSound] = useState(false),
    [isFullscreen, setIsFullscreen] = useState(false)
  const [activeDaily, setActiveDaily] = useState(daily)
  const [result, setResult] = useState<GameResult | null>(null),
    [zoom, setZoom] = useState(1),
    [pan, setPan] = useState(false),
    [flag, setFlag] = useState(false)
  const progress = usePassport()
  const cafe = (CAFE_GAMES as readonly string[]).includes(gameSlug),
    config = capabilitiesFor(gameSlug)
  const cancelPending = useCallback(() => {
    generation.current++
  }, [])
  const release = useCallback(() => {
    bridge.current?.releaseAll()
    for (const scene of gameRef.current?.scene.getScenes(false) ?? []) {
      scene.input.keyboard?.resetKeys()
      scene.input.emit(INPUT_CANCEL_EVENT)
      scene.input.resetPointers()
    }
  }, [])
  const changePause = useCallback(
    (value: boolean) => {
      release()
      pauseRef.current = value
      setPaused(value)
      for (const scene of gameRef.current?.scene.getScenes(false) ?? []) {
        if (value && scene.sys.isActive()) scene.scene.pause()
        else if (!value && scene.sys.isPaused()) scene.scene.resume()
      }
      if (!value) containerRef.current?.focus({ preventScroll: true })
    },
    [release],
  )
  const startGame = useCallback(async () => {
    if (!containerRef.current) return
    const current = ++generation.current
    release()
    gameRef.current?.destroy(true)
    gameRef.current = null
    ready.current = false
    pauseRef.current = false
    setStarted(true)
    setLoading(true)
    setError('')
    setPaused(false)
    setResult(null)
    setFlag(false)
    const run = crypto.randomUUID()
    let began = false,
      finished = false
    const record = {
      version: 1 as const,
      run,
      slug: gameSlug,
      title: title || packageName,
      category,
      daily: daily ? { date: daily.date, practice: daily.practice } : undefined,
    }
    const begin = () => {
      if (
        began ||
        !ready.current ||
        pauseRef.current ||
        generation.current !== current
      )
        return
      began = true
      if (record.daily && daily) {
        record.daily.practice ||=
          daily.date < new Date().toISOString().slice(0, 10)
        setActiveDaily({ ...daily, practice: record.daily.practice })
      }
      saveActivity({
        ...record,
        id: `${run}:start`,
        kind: 'start',
        at: new Date().toISOString(),
      })
      addRecentlyPlayed(gameSlug, title || packageName)
      void Analytics.trackPlay(gameId)
    }
    interaction.current = begin
    try {
      const gameModule = await GameLoader.loadGame(packageName)
      if (!containerRef.current || generation.current !== current) return
      const container = containerRef.current
      container.id = `game-container-${gameId}`
      bridge.current = createInputBridge(container, cafe ? () => {} : begin)
      const game = gameModule.createGame(container.id, {
        daily,
        input: bridge.current,
        soundEnabled: () => soundRef.current,
        onReady: () => {
          ready.current = true
          setLoading(false)
        },
        onInteraction: begin,
        onResult: (value) => {
          if (finished || generation.current !== current) return
          begin()
          finished = true
          saveActivity({
            ...record,
            id: `${run}:result`,
            kind: 'result',
            at: new Date().toISOString(),
            result: value,
          })
          setResult(value)
          void Analytics.trackComplete(gameId, { score: value.score })
        },
      })
      gameRef.current = game
      const connect = () => {
        const keyboard = game.input.keyboard
        if (keyboard) {
          keyboard.stopListeners()
          keyboard.target = container
          keyboard.startListeners()
        }
      }
      if (game.isBooted) connect()
      else game.events.once('boot', connect)
      const loaded = () => {
        if (generation.current === current) {
          ready.current = true
          setLoading(false)
          container.focus({ preventScroll: true })
        }
      }
      if (game.isRunning) loaded()
      else game.events.once('ready', loaded)
    } catch (cause) {
      if (generation.current === current) {
        setError(cause instanceof Error ? cause.message : 'Unable to load game')
        setStarted(false)
        setLoading(false)
      }
    }
  }, [release, gameSlug, title, packageName, category, daily, gameId, cafe])
  useEffect(() => {
    const hidden = () => {
      if (document.hidden && ready.current) changePause(true)
    }
    const blur = () => release()
    const fullscreen = () => {
      setIsFullscreen(document.fullscreenElement === wrapperRef.current)
      containerRef.current?.focus({ preventScroll: true })
    }
    const bounds = () => gameRef.current?.scale.updateBounds()
    const resize = new ResizeObserver(() => gameRef.current?.scale.refresh())
    if (containerRef.current) resize.observe(containerRef.current)
    document.addEventListener('scroll', bounds, {
      capture: true,
      passive: true,
    })
    document.addEventListener('visibilitychange', hidden)
    window.addEventListener('blur', blur)
    document.addEventListener('fullscreenchange', fullscreen)
    return () => {
      cancelPending()
      ready.current = false
      release()
      gameRef.current?.destroy(true)
      gameRef.current = null
      resize.disconnect()
      document.removeEventListener('scroll', bounds, true)
      document.removeEventListener('visibilitychange', hidden)
      window.removeEventListener('blur', blur)
      document.removeEventListener('fullscreenchange', fullscreen)
    }
  }, [changePause, release, cancelPending])
  async function fullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else if (wrapperRef.current?.requestFullscreen)
        await wrapperRef.current.requestFullscreen()
      else
        setError(
          'Fullscreen is unavailable in this browser. You can still play here.',
        )
    } catch {
      setError('Fullscreen is unavailable. You can still play here.')
    }
  }
  const dayRecord = activeDaily
    ? (activeDaily.practice ? progress.practiceDays : progress.days)[
        activeDaily.date
      ]
    : undefined
  const attempts = dayRecord?.attempts ?? 1
  return (
    <div
      ref={wrapperRef}
      className="game-shell rounded-xl bg-gray-900 border border-white/10 overflow-hidden"
    >
      {started && !loading && (
        <div className="flex flex-wrap gap-2 p-3 order-1">
          <button className="cafe-control" onClick={() => changePause(!paused)}>
            {paused ? 'Resume' : 'Pause'}
          </button>
          <button className="cafe-control" onClick={() => void startGame()}>
            Restart
          </button>
          {cafe && (
            <button
              className="cafe-control"
              aria-pressed={sound}
              onClick={() => {
                soundRef.current = !sound
                setSound(!sound)
              }}
            >
              {sound ? 'Sound on' : 'Sound off'}
            </button>
          )}
          <button className="cafe-control" onClick={() => void fullscreen()}>
            {isFullscreen ? '⊡ Exit' : '⛶ Fullscreen'}
          </button>
          <ShareResult
            text={typeof window === 'undefined' ? '' : window.location.href}
            label="🔗 Share"
          />
          {(config?.dense || cafe) && (
            <>
              <button
                className="cafe-control"
                onClick={() => setZoom(zoom === 1 ? 2 : zoom === 2 ? 3 : 1)}
              >
                Zoom {zoom}×
              </button>
              {zoom > 1 && (
                <button
                  className="cafe-control"
                  aria-pressed={pan}
                  onClick={() => {
                    release()
                    setPan(!pan)
                  }}
                >
                  {pan ? 'Pan mode · tap to play' : 'Play mode · tap to pan'}
                </button>
              )}
            </>
          )}
          {gameSlug === 'minesweeper-quantum' && (
            <button
              className="cafe-control"
              aria-pressed={flag}
              onClick={() => {
                setFlag(!flag)
                gameRef.current?.registry.set('touchFlag', !flag)
              }}
            >
              {flag ? 'Flag mode' : 'Reveal mode'}
            </button>
          )}
        </div>
      )}
      {started && (
        <div className="order-3 px-3 pb-3">
          <TouchControls
            slug={gameSlug}
            bridge={bridge}
            disabled={loading || paused || !!result}
          />
        </div>
      )}
      <div
        className="order-2 game-viewport"
        style={{
          aspectRatio: `${config?.width ?? 800}/${config?.height ?? 600}`,
        }}
      >
        <div
          className="game-scroll"
          style={{
            overflow: zoom > 1 ? 'auto' : 'clip',
            overscrollBehavior: zoom > 1 ? 'contain' : 'auto',
            touchAction: pan ? 'pan-x pan-y' : 'auto',
          }}
        >
          <div
            className="relative"
            style={{
              width: `${zoom * 100}%`,
              height: zoom === 1 ? '100%' : undefined,
              aspectRatio: `${config?.width ?? 800}/${config?.height ?? 600}`,
            }}
          >
            <p id={`game-keyboard-help-${gameId}`} className="sr-only">
              Click or focus the game to use its keyboard controls. Press Tab to
              leave the game.
            </p>
            <div
              ref={containerRef}
              role="group"
              aria-label={`${title || packageName} game`}
              aria-describedby={`game-keyboard-help-${gameId}`}
              tabIndex={started && !loading ? 0 : -1}
              className="game-canvas focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-300"
              onPointerDownCapture={() => gameRef.current?.scale.updateBounds()}
              onPointerCancelCapture={release}
              onTouchCancelCapture={release}
              onPointerDown={() => {
                if (ready.current && !paused) {
                  containerRef.current?.focus({ preventScroll: true })
                  if (!cafe) interaction.current()
                }
              }}
              onBlur={release}
              onKeyDownCapture={(event) => {
                if (
                  event.key === 'Tab' ||
                  event.altKey ||
                  event.ctrlKey ||
                  event.metaKey
                )
                  event.stopPropagation()
              }}
              onKeyDown={(event) => {
                if (
                  event.altKey ||
                  event.ctrlKey ||
                  event.metaKey ||
                  event.key === 'Tab'
                )
                  return
                if (
                  !cafe &&
                  config?.keys.some(
                    (key) =>
                      (key === 'Space' ? ' ' : key).toLowerCase() ===
                      event.key.toLowerCase(),
                  )
                )
                  interaction.current()
                if (SCROLL_KEYS.has(event.key)) event.preventDefault()
              }}
            />
            {pan && zoom > 1 && (
              <div
                className="absolute inset-0 z-10"
                role="group"
                aria-label="Drag to pan the board"
              />
            )}
          </div>
        </div>
        {(!started || loading || paused) && (
          <div className="game-overlay">
            {!started ? (
              <>
                <h2 className="text-2xl font-bold mb-3">{title}</h2>
                <div className="text-sm mb-4 space-y-1">
                  {(controls?.length
                    ? controls
                    : [
                        cafe
                          ? 'Tap to play. Keyboard and mouse also supported.'
                          : config?.keys.length
                            ? 'Use the on-screen controls or your keyboard.'
                            : 'Tap, drag, or release to play.',
                      ]
                  ).map((c) => (
                    <p key={c}>{c}</p>
                  ))}
                </div>
                <p className="sr-only">Controls</p>
                <button
                  className="cafe-control primary"
                  onClick={() => void startGame()}
                >
                  ▶ Play
                </button>
              </>
            ) : loading ? (
              <p role="status">Loading game…</p>
            ) : (
              <>
                <p className="text-xl">Paused</p>
                <button
                  className="cafe-control"
                  onClick={() => changePause(false)}
                >
                  Resume game
                </button>
              </>
            )}
          </div>
        )}
      </div>
      {error && (
        <p role="alert" className="order-4 p-3 text-red-300">
          {error}{' '}
          <button className="underline" onClick={() => void startGame()}>
            Try Again
          </button>
        </p>
      )}
      {result && (
        <div
          className="order-4 p-5 bg-amber-100 text-stone-900 space-y-3"
          role="status"
        >
          <h3 className="text-xl font-bold">{result.label}</h3>
          {daily && (
            <p>
              {activeDaily?.practice ? 'Practice · ' : ''}
              Best: {dayRecord?.best?.label ?? result.label} · {attempts}{' '}
              attempts
            </p>
          )}
          <button
            className="cafe-control primary"
            onClick={() => void startGame()}
          >
            {gameSlug === 'coffee-connections' && !daily
              ? 'Next puzzle'
              : 'Play again'}
          </button>
          {daily && (
            <ShareResult
              text={resultShare(
                title || packageName,
                activeDaily ?? daily,
                dayRecord?.best ?? result,
                attempts,
                typeof window === 'undefined' ? '' : window.location.origin,
              )}
            />
          )}
        </div>
      )}
      {progress.unavailable && (
        <p className="order-5 p-3 text-sm text-amber-200" role="status">
          Saving is unavailable. You can keep playing, but progress may be lost
          when you close this page.
        </p>
      )}
    </div>
  )
}
