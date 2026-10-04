'use client'
import type { createInputBridge } from '@/lib/game-runtime'
import capabilities from '@/lib/game-capabilities.json'

export type InputBridge = ReturnType<typeof createInputBridge>
export const capabilitiesFor = (slug: string) =>
  capabilities[slug as keyof typeof capabilities]
export function inputLabel(key: string, slug: string) {
  if (slug === 'neon-pong-pvp')
    return (
      {
        w: 'P1 up',
        s: 'P1 down',
        ArrowUp: 'P2 up',
        ArrowDown: 'P2 down',
      } as Record<string, string>
    )[key]
  if (slug === 'word-scramble-rush')
    return (
      (
        { ArrowRight: 'Skip', Backspace: 'Delete', Enter: 'Submit' } as Record<
          string,
          string
        >
      )[key] ?? key
    )
  if (key === 'Space')
    return ['space-shooter', 'asteroid-sweeper'].includes(slug)
      ? 'Shoot'
      : slug === 'drift-king-2d'
        ? 'Drift'
        : slug === 'gravity-flip-grappler'
          ? 'Flip'
          : ['cup-stack', 'sugar-orbit'].includes(slug)
            ? 'Tap / Space'
            : 'Jump / Flap'
  return (
    (
      {
        ArrowLeft: '← Left',
        ArrowRight: 'Right →',
        ArrowUp: '↑ Up',
        ArrowDown: '↓ Down',
        Backspace: 'Erase',
        x: 'Throw',
      } as Record<string, string>
    )[key] ?? key
  )
}
export function TouchControls({
  slug,
  bridge,
  disabled,
}: {
  slug: string
  bridge: React.RefObject<InputBridge | null>
  disabled: boolean
}) {
  const config = capabilitiesFor(slug)
  if (!config?.keys.length) return null
  return (
    <fieldset
      disabled={disabled}
      className={`touch-controls ${slug === 'neon-pong-pvp' ? 'pong-controls' : ''}`}
      aria-label="Touch controls"
    >
      <legend className="text-sm text-white/70 mb-2">
        {slug === 'neon-pong-pvp'
          ? 'Two players · hold your own controls together'
          : 'Touch controls'}
      </legend>
      {config.keys.map((key) => (
        <button
          key={key}
          type="button"
          className="cafe-control"
          aria-label={inputLabel(key, slug)}
          onPointerDown={(event) => {
            event.preventDefault()
            event.currentTarget.setPointerCapture(event.pointerId)
            bridge.current?.press(key)
          }}
          onPointerUp={() => bridge.current?.release(key)}
          onPointerCancel={() => bridge.current?.release(key)}
          onLostPointerCapture={() => bridge.current?.release(key)}
          onKeyDown={(event) => {
            if (event.key === ' ' || event.key === 'Enter') {
              event.preventDefault()
              bridge.current?.press(key)
            }
          }}
          onKeyUp={(event) => {
            if (event.key === ' ' || event.key === 'Enter')
              bridge.current?.release(key)
          }}
          onBlur={() => bridge.current?.release(key)}
        >
          {inputLabel(key, slug)}
        </button>
      ))}
    </fieldset>
  )
}
