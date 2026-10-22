export type HexBoard = (number | null)[][]

/** Odd rows are shifted half a cell to the right. */
export function hexNeighbors(row: number, column: number): [number, number][] {
  const left = row % 2 === 0 ? column - 1 : column
  return [
    [row, column - 1], [row, column + 1],
    [row - 1, left], [row - 1, left + 1],
    [row + 1, left], [row + 1, left + 1],
  ]
}

/** Scan each of the three hex axes once; crossing matches count cells once. */
export function findHexMatches(board: HexBoard): [number, number][] {
  const matches = new Map<string, [number, number]>()
  const next = (row: number, column: number, axis: number): [number, number] =>
    axis === 0 ? [row, column + 1]
      : [row + 1, column + (axis === 1 ? (row % 2 === 0 ? -1 : 0) : row % 2)]
  for (let row = 0; row < board.length; row++) {
    for (let column = 0; column < board[row].length; column++) {
      const color = board[row][column]
      if (color === null) continue
      for (let axis = 0; axis < 3; axis++) {
        const run: [number, number][] = [[row, column]]
        let [r, c] = next(row, column, axis)
        while (board[r]?.[c] === color) {
          run.push([r, c])
          ;[r, c] = next(r, c, axis)
        }
        if (run.length >= 3) for (const cell of run) matches.set(cell.join(','), cell)
      }
    }
  }
  return [...matches.values()]
}

/** Return a legal scoring swap, without changing the board. */
export function findHexMove(board: HexBoard): [[number, number], [number, number]] | undefined {
  for (let row = 0; row < board.length; row++) {
    for (let column = 0; column < board[row].length; column++) {
      for (const [r, c] of hexNeighbors(row, column)) {
        if (board[r]?.[c] == null || board[r][c] === board[row][column]) continue
        ;[board[row][column], board[r][c]] = [board[r][c], board[row][column]]
        const match = findHexMatches(board).length > 0
        ;[board[row][column], board[r][c]] = [board[r][c], board[row][column]]
        if (match) return [[row, column], [r, c]]
      }
    }
  }
}

/** Generate a match-free 7x9 board with a scoring move, in bounded time. */
export function createHexBoard(random = Math.random): HexBoard {
  for (let attempt = 0; attempt < 5; attempt++) {
    const board: HexBoard = Array.from({ length: 7 }, () => Array(9).fill(null))
    // A final deterministic motif guarantees a move even with constant RNG.
    if (attempt === 4) {
      board[0][0] = 0
      board[0][1] = 1
      board[0][2] = 0
      board[1][1] = 0
    }
    for (let row = 0; row < 7; row++) {
      for (let column = 0; column < 9; column++) {
        if (board[row][column] !== null) continue
        const available: number[] = []
        for (let color = 0; color < 6; color++) {
          board[row][column] = color
          if (!findHexMatches(board).length) available.push(color)
        }
        board[row][column] = available[Math.min(available.length - 1, Math.floor(random() * available.length))]
      }
    }
    if (findHexMove(board)) return board
  }
  throw new Error('Unable to create a playable hex board')
}
