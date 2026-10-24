/**
 * Shared score reporting for the classic (non-café) Phaser games.
 *
 * A game calls `reportScore(this, { score })` once when a round ends. The game
 * player listens for `SCORE_EVENT` on the Phaser game's event emitter, saves a
 * personal best to the passport, and offers leaderboard submission.
 */
export const SCORE_EVENT = 'cafe:score'
export const ROUND_START_EVENT = 'cafe:round-start'
const waitingForRestart = new WeakSet<SceneLike>()

/** Games whose best result is the lowest number (strokes, seconds, rotations). */
export const LOWER_IS_BETTER: ReadonlySet<string> = new Set([
  'coffee-connections',
  'mini-golf-course',
  'minesweeper-quantum',
  'sudoku-zen',
])

/** Games with no single-player score worth ranking (two-player only). */
const NO_LEADERBOARD: ReadonlySet<string> = new Set(['neon-pong-pvp'])

export interface ScoreReport {
  score: number
  /** Short human label such as "Score 1,240" or "Solved in 3:12". */
  label?: string
  /** Tie-breaker; higher is better. */
  secondary?: number
}

interface SceneLike {
  game: { events: { emit: (event: string, ...args: unknown[]) => unknown } }
  events?: { once: (event: string, listener: () => void) => unknown }
}

export function reportScore(scene: SceneLike, report: ScoreReport) {
  if (scene.events && !waitingForRestart.has(scene)) {
    waitingForRestart.add(scene)
    scene.events.once('start', () => {
      waitingForRestart.delete(scene)
      scene.game.events.emit(ROUND_START_EVENT)
    })
  }
  const score = Number.isFinite(report.score)
    ? Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Math.round(report.score)))
    : 0
  const secondary = report.secondary === undefined ? undefined
    : Number.isFinite(report.secondary) ? Math.max(0, report.secondary) : 0
  scene.game.events.emit(SCORE_EVENT, {
    ...report,
    score,
    ...(secondary === undefined ? {} : { secondary }),
    label: (report.label ?? `Score ${score.toLocaleString('en-US')}`).slice(0, 120),
  })
}

/** Leaderboards rank highest-first, so only higher-is-better games submit. */
export function supportsLeaderboard(slug: string) {
  return !LOWER_IS_BETTER.has(slug) && !NO_LEADERBOARD.has(slug)
}

export function formatDuration(totalSeconds: number) {
  const seconds = Math.max(0, Math.round(totalSeconds))
  const minutes = Math.floor(seconds / 60)
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`
}
