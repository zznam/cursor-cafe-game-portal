import * as Phaser from 'phaser'

class SudokuZenScene extends Phaser.Scene {
  private board: number[][] = []
  private solution: number[][] = []
  private fixed: boolean[][] = []
  private cells: Phaser.GameObjects.Text[][] = []
  private selectedR = -1
  private selectedC = -1
  private cellSize = 50
  private offsetX = 175
  private offsetY = 75
  private gfx?: Phaser.GameObjects.Graphics
  private statusText?: Phaser.GameObjects.Text

  constructor() {
    super({ key: 'SudokuZenScene' })
  }

  create() {
    this.selectedR = -1
    this.selectedC = -1
    this.cells = []

    this.add.text(400, 30, 'Sudoku Zen', { fontSize: '28px', color: '#88ccff', fontFamily: 'monospace' }).setOrigin(0.5)
    this.statusText = this.add.text(400, 570, 'Click a cell, then type 1-9', { fontSize: '16px', color: '#888', fontFamily: 'monospace' }).setOrigin(0.5)

    this.generatePuzzle()
    this.gfx = this.add.graphics()
    this.drawGrid()
    this.drawNumbers()

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const c = Math.floor((pointer.x - this.offsetX) / this.cellSize)
      const r = Math.floor((pointer.y - this.offsetY) / this.cellSize)
      if (r >= 0 && r < 9 && c >= 0 && c < 9 && !this.fixed[r][c]) {
        this.selectedR = r
        this.selectedC = c
      } else {
        this.selectedR = -1
        this.selectedC = -1
      }
      this.drawGrid()
      this.drawNumbers()
    })

    for (let n = 1; n <= 9; n++) {
      this.input.keyboard?.on(`keydown-${n === 0 ? 'ZERO' : ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE'][n - 1]}`, () => {
        this.placeNumber(n)
      })
      this.input.keyboard?.on(`keydown-NUMPAD_${n === 0 ? 'ZERO' : ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE'][n - 1]}`, () => {
        this.placeNumber(n)
      })
    }

    // also handle regular digit keys
    for (let i = 49; i <= 57; i++) {
      this.input.keyboard?.on(`keydown`, (e: KeyboardEvent) => {
        const num = parseInt(e.key)
        if (num >= 1 && num <= 9) this.placeNumber(num)
        if (e.key === 'Backspace' || e.key === 'Delete') {
          if (this.selectedR >= 0 && !this.fixed[this.selectedR][this.selectedC]) {
            this.board[this.selectedR][this.selectedC] = 0
            this.drawNumbers()
          }
        }
      })
      break // only bind once
    }
  }

  placeNumber(n: number) {
    if (this.selectedR < 0 || this.fixed[this.selectedR][this.selectedC]) return
    this.board[this.selectedR][this.selectedC] = n
    this.drawNumbers()
    this.checkWin()
  }

  generatePuzzle() {
    // simple valid sudoku generation
    this.solution = this.generateSolution()
    this.board = this.solution.map(r => [...r])
    this.fixed = Array.from({ length: 9 }, () => Array(9).fill(true))

    // remove cells to create puzzle
    const cellsToRemove = 40
    let removed = 0
    while (removed < cellsToRemove) {
      const r = Phaser.Math.Between(0, 8)
      const c = Phaser.Math.Between(0, 8)
      if (this.board[r][c] !== 0) {
        this.board[r][c] = 0
        this.fixed[r][c] = false
        removed++
      }
    }
  }

  generateSolution(): number[][] {
    const board: number[][] = Array.from({ length: 9 }, () => Array(9).fill(0))
    this.fillBoard(board)
    return board
  }

  fillBoard(board: number[][]): boolean {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === 0) {
          const nums = Phaser.Utils.Array.Shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])
          for (const n of nums) {
            if (this.isValid(board, r, c, n)) {
              board[r][c] = n
              if (this.fillBoard(board)) return true
              board[r][c] = 0
            }
          }
          return false
        }
      }
    }
    return true
  }

  isValid(board: number[][], r: number, c: number, n: number): boolean {
    for (let i = 0; i < 9; i++) {
      if (board[r][i] === n || board[i][c] === n) return false
    }
    const br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3
    for (let i = br; i < br + 3; i++)
      for (let j = bc; j < bc + 3; j++)
        if (board[i][j] === n) return false
    return true
  }

  drawGrid() {
    this.gfx?.clear()
    for (let r = 0; r <= 9; r++) {
      const thick = r % 3 === 0
      this.gfx?.lineStyle(thick ? 3 : 1, thick ? 0x4488cc : 0x334466)
      this.gfx?.moveTo(this.offsetX, this.offsetY + r * this.cellSize)
      this.gfx?.lineTo(this.offsetX + 9 * this.cellSize, this.offsetY + r * this.cellSize)
      this.gfx?.strokePath()
    }
    for (let c = 0; c <= 9; c++) {
      const thick = c % 3 === 0
      this.gfx?.lineStyle(thick ? 3 : 1, thick ? 0x4488cc : 0x334466)
      this.gfx?.moveTo(this.offsetX + c * this.cellSize, this.offsetY)
      this.gfx?.lineTo(this.offsetX + c * this.cellSize, this.offsetY + 9 * this.cellSize)
      this.gfx?.strokePath()
    }
    // highlight selected
    if (this.selectedR >= 0) {
      this.gfx?.fillStyle(0x2244aa, 0.3)
      this.gfx?.fillRect(
        this.offsetX + this.selectedC * this.cellSize + 1,
        this.offsetY + this.selectedR * this.cellSize + 1,
        this.cellSize - 2,
        this.cellSize - 2
      )
    }
  }

  drawNumbers() {
    this.cells.flat().forEach(t => t?.destroy())
    this.cells = []
    for (let r = 0; r < 9; r++) {
      this.cells[r] = []
      for (let c = 0; c < 9; c++) {
        if (this.board[r][c] !== 0) {
          const isCorrect = this.board[r][c] === this.solution[r][c]
          const color = this.fixed[r][c] ? '#ffffff' : isCorrect ? '#44ff88' : '#ff4444'
          const t = this.add.text(
            this.offsetX + c * this.cellSize + this.cellSize / 2,
            this.offsetY + r * this.cellSize + this.cellSize / 2,
            `${this.board[r][c]}`,
            { fontSize: '24px', color, fontFamily: 'monospace', fontStyle: this.fixed[r][c] ? 'bold' : 'normal' }
          ).setOrigin(0.5)
          this.cells[r][c] = t
        }
      }
    }
  }

  checkWin() {
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++)
        if (this.board[r][c] !== this.solution[r][c]) return
    this.statusText?.setText('🎉 Congratulations! Puzzle Complete!').setColor('#00ff88')
    this.add.text(400, 30, '✨ SOLVED ✨', { fontSize: '28px', color: '#00ff88', fontFamily: 'monospace' }).setOrigin(0.5)
  }
}

export default {
  metadata: {
    slug: 'sudoku-zen',
    title: 'Sudoku Zen',
    description: 'A relaxing Sudoku game with minimalist graphics. Click cells and type numbers to solve.',
    thumbnailUrl: '/games/sudoku-zen/thumbnail.png',
    category: 'Puzzle',
    tags: ['logic', 'relaxing'],
    developerName: 'Game Portal Team',
    packageName: 'sudoku-zen',
    version: '1.0.0',
  },
  createGame: (containerId: string) => {
    return new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerId,
      width: 800,
      height: 600,
      backgroundColor: '#0a0a1e',
      scene: [SudokuZenScene],
    })
  },
}
