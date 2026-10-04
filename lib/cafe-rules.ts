import { seededRandom, type GameResult } from './daily'

// Connections use N/E/S/W bits. Generate a guaranteed left-to-right path first.
export const rotatePipe = (mask: number) => ((mask << 1) & 15) | (mask >> 3)
export function createPipes(seed: number, size = 5) {
  const random = seededRandom(seed)
  const solution = Array<number>(size * size).fill(0)
  let row = Math.floor(random() * size)
  const start = row
  solution[row * size] |= 8
  for (let col = 0; col < size; col++) {
    const next = Math.floor(random() * size)
    while (row !== next) {
      const direction = row < next ? 1 : -1
      solution[row * size + col] |= direction === 1 ? 4 : 1
      row += direction
      solution[row * size + col] |= direction === 1 ? 1 : 4
    }
    solution[row * size + col] |= 2
    if (col < size - 1) solution[row * size + col + 1] |= 8
  }
  const tiles = solution.map((mask) => {
    let value = mask || [3, 5, 9][Math.floor(random() * 3)]
    for (let r = Math.floor(random() * 4); r > 0; r--) value = rotatePipe(value)
    return value
  })
  if (pipesConnected(tiles, size, start, row))
    tiles[start * size] = rotatePipe(tiles[start * size])
  return { tiles, solution, start, end: row, size }
}
export function pipesConnected(
  tiles: number[],
  size: number,
  start: number,
  end: number,
) {
  if (!(tiles[start * size] & 8)) return false
  const visited = new Set<number>(),
    queue = [start * size]
  while (queue.length) {
    const index = queue.shift()!
    if (visited.has(index)) continue
    visited.add(index)
    if (index === end * size + size - 1 && tiles[index] & 2) return true
    const r = Math.floor(index / size),
      c = index % size
    for (const [dr, dc, from, to] of [
      [-1, 0, 1, 4],
      [0, 1, 2, 8],
      [1, 0, 4, 1],
      [0, -1, 8, 2],
    ]) {
      const nr = r + dr,
        nc = c + dc,
        other = nr * size + nc
      if (
        nr >= 0 &&
        nr < size &&
        nc >= 0 &&
        nc < size &&
        tiles[index] & from &&
        tiles[other] & to
      )
        queue.push(other)
    }
  }
  return false
}
export type Piece = readonly (readonly [number, number])[]
export const PIECES: readonly Piece[] = [
  [[0, 0]],
  [
    [0, 0],
    [1, 0],
  ],
  [
    [0, 0],
    [1, 0],
    [2, 0],
  ],
  [
    [0, 0],
    [0, 1],
    [1, 1],
  ],
  [
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1],
  ],
  [
    [0, 0],
    [0, 1],
    [0, 2],
  ],
  [
    [0, 0],
    [1, 0],
    [2, 0],
    [1, 1],
  ],
]
export function pieceAt(seed: number, index: number): Piece {
  return PIECES[
    Math.floor(
      seededRandom((seed + Math.imul(index, 7919)) >>> 0)() * PIECES.length,
    )
  ]
}
export function canPlace(board: number[], piece: Piece, x: number, y: number) {
  return piece.every(
    ([dx, dy]) =>
      x + dx >= 0 &&
      x + dx < 8 &&
      y + dy >= 0 &&
      y + dy < 8 &&
      !board[(y + dy) * 8 + x + dx],
  )
}
export function placePiece(
  board: number[],
  piece: Piece,
  x: number,
  y: number,
) {
  if (!canPlace(board, piece, x, y)) return null
  const next = [...board]
  for (const [dx, dy] of piece) next[(y + dy) * 8 + x + dx] = 1
  const clear = new Set<number>()
  for (let i = 0; i < 8; i++) {
    if (Array.from({ length: 8 }, (_, j) => next[i * 8 + j]).every(Boolean))
      for (let j = 0; j < 8; j++) clear.add(i * 8 + j)
    if (Array.from({ length: 8 }, (_, j) => next[j * 8 + i]).every(Boolean))
      for (let j = 0; j < 8; j++) clear.add(j * 8 + i)
  }
  for (const index of clear) next[index] = 0
  return { board: next, score: piece.length * 10 + clear.size * 20 }
}
export function hasPlacement(board: number[], piece: Piece) {
  return board.some((_, index) =>
    canPlace(board, piece, index % 8, Math.floor(index / 8)),
  )
}
export function stackOverlap(center: number, previous: number, width: number) {
  const remaining = Math.max(0, width - Math.abs(center - previous))
  return { width: remaining, center: (center + previous) / 2 }
}
export function orbitObstacle(seed: number, index: number) {
  const random = seededRandom((seed + Math.imul(index, 104729)) >>> 0)
  return {
    angle: random() * Math.PI * 2,
    spawn: 1.5 + index * 1.3,
    speed: 80 + random() * 30,
  }
}

/** The daily deadline wins over a collision on the final fixed simulation step. */
export function orbitRunResult(
  elapsed: number,
  collided: boolean,
  daily: boolean,
): GameResult | null {
  if (daily && elapsed >= 90 - 1e-9)
    return { score: 90000, label: '90.0 seconds · course complete!' }
  if (collided)
    return {
      score: Math.floor(elapsed * 1000),
      label: `${elapsed.toFixed(1)} seconds survived`,
    }
  return null
}
