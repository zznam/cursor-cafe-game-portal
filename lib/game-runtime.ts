import type { DailyChallenge, GameResult } from './daily'

export const INPUT_CANCEL_EVENT = 'cafe-input-cancel'

export interface GameRuntime {
  input?: ReturnType<typeof createInputBridge>
  daily?: DailyChallenge
  onReady?: () => void
  onInteraction?: () => void
  onResult?: (result: GameResult) => void
  soundEnabled?: () => boolean
}

const codes: Record<string, number> = {
  ArrowLeft: 37,
  ArrowUp: 38,
  ArrowRight: 39,
  ArrowDown: 40,
  Space: 32,
  Enter: 13,
  Backspace: 8,
  Delete: 46,
}
/** Scoped DOM input bridge: old Phaser scenes receive their existing key events. */
export function createInputBridge(
  target: HTMLElement,
  onInteraction: () => void,
) {
  const held = new Set<string>()
  function send(key: string, down: boolean) {
    const keyCode = codes[key] ?? key.toUpperCase().charCodeAt(0)
    target.dispatchEvent(
      new KeyboardEvent(down ? 'keydown' : 'keyup', {
        key: key === 'Space' ? ' ' : key,
        code:
          key.length === 1
            ? /\d/.test(key)
              ? `Digit${key}`
              : `Key${key.toUpperCase()}`
            : key,
        keyCode,
        which: keyCode,
        bubbles: true,
        cancelable: true,
      }),
    )
  }
  return {
    press(key: string) {
      if (!held.has(key)) {
        held.add(key)
        onInteraction()
        send(key, true)
      }
    },
    release(key: string) {
      if (held.delete(key)) send(key, false)
    },
    releaseAll() {
      for (const key of held) send(key, false)
      held.clear()
    },
  }
}
