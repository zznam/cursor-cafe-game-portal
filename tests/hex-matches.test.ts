import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createHexBoard, findHexMatches, findHexMove, hexNeighbors, type HexBoard } from '../lib/games/hex-matches'
import { seededRandom } from '../lib/daily'

function boardWith(cells: [number, number][]) {
  const board: HexBoard = Array.from({ length: 7 }, () => Array(9).fill(null))
  for (const [row, column] of cells) board[row][column] = 2
  return board
}

test('hex matches follow all three axes from even and odd rows', () => {
  for (const cells of [
    [[0, 0], [0, 1], [0, 2], [0, 3]],
    [[0, 2], [1, 1], [2, 1]],
    [[0, 2], [1, 2], [2, 3]],
    [[1, 2], [2, 2], [3, 1]],
    [[1, 2], [2, 3], [3, 3]],
  ] as [number, number][][]) {
    assert.deepEqual(new Set(findHexMatches(boardWith(cells)).map(String)), new Set(cells.map(String)))
  }
  assert.equal(findHexMatches(boardWith([[0, 0], [1, 0], [2, 0]])).length, 0, 'a vertical zigzag is not a hex line')
})

test('crossing matches count each tile once and empty cells do not match', () => {
  const cells: [number, number][] = [[2, 1], [2, 2], [2, 3], [1, 1], [3, 2]]
  assert.equal(findHexMatches(boardWith(cells)).length, 5)
  assert.deepEqual(findHexMatches(boardWith([])), [])
})

test('hex boards have no free matches, always have a legal move, and move search preserves them', () => {
  for (const random of [() => 0, () => 0.999999, ...Array.from({ length: 100 }, (_, seed) => seededRandom(seed))]) {
    const board = createHexBoard(random)
    assert.equal(findHexMatches(board).length, 0)
    const before = structuredClone(board)
    const move = findHexMove(board)
    assert.ok(move)
    assert.deepEqual(board, before)
    const [[r, c], [r2, c2]] = move
    assert.ok(hexNeighbors(r, c).some(([nr, nc]) => nr === r2 && nc === c2))
    ;[board[r][c], board[r2][c2]] = [board[r2][c2], board[r][c]]
    assert.ok(findHexMatches(board).length >= 3)
  }
})
