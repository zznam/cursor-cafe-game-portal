import * as Phaser from 'phaser'

class MinesweeperScene extends Phaser.Scene {
  private grid: number[][] = []
  private revealed: boolean[][] = []
  private flagged: boolean[][] = []
  private cols = 16
  private rows = 12
  private mines = 30
  private cellSize = 40
  private offsetX = 80
  private offsetY = 60
  private gameOver = false
  private firstClick = true
  private mineCount?: Phaser.GameObjects.Text
  private cellGraphics?: Phaser.GameObjects.Graphics
  private textObjects: Phaser.GameObjects.Text[][] = []

  constructor() {
    super({ key: 'MinesweeperScene' })
  }

  create() {
    this.grid = []
    this.revealed = []
    this.flagged = []
    this.gameOver = false
    this.firstClick = true
    this.textObjects = []

    for (let r = 0; r < this.rows; r++) {
      this.grid[r] = []
      this.revealed[r] = []
      this.flagged[r] = []
      this.textObjects[r] = []
      for (let c = 0; c < this.cols; c++) {
        this.grid[r][c] = 0
        this.revealed[r][c] = false
        this.flagged[r][c] = false
      }
    }

    this.cellGraphics = this.add.graphics()

    this.mineCount = this.add.text(400, 20, `Mines: ${this.mines}`, {
      fontSize: '22px', color: '#ff0', fontFamily: 'monospace',
    }).setOrigin(0.5)

    this.drawGrid()

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.gameOver) {
        this.scene.restart()
        return
      }
      const col = Math.floor((pointer.x - this.offsetX) / this.cellSize)
      const row = Math.floor((pointer.y - this.offsetY) / this.cellSize)
      if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return

      if (pointer.rightButtonDown()) {
        this.toggleFlag(row, col)
      } else {
        if (this.firstClick) {
          this.placeMines(row, col)
          this.firstClick = false
        }
        if (!this.flagged[row][col]) this.revealCell(row, col)
      }
    })

    this.input.mouse?.disableContextMenu()
  }

  placeMines(safeR: number, safeC: number) {
    let placed = 0
    while (placed < this.mines) {
      const r = Phaser.Math.Between(0, this.rows - 1)
      const c = Phaser.Math.Between(0, this.cols - 1)
      if (this.grid[r][c] === -1) continue
      if (Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1) continue
      this.grid[r][c] = -1
      placed++
    }
    // count neighbors
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.grid[r][c] === -1) continue
        let count = 0
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr, nc = c + dc
            if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols && this.grid[nr][nc] === -1) count++
          }
        }
        this.grid[r][c] = count
      }
    }
  }

  toggleFlag(r: number, c: number) {
    if (this.revealed[r][c]) return
    this.flagged[r][c] = !this.flagged[r][c]
    const remaining = this.mines - this.flagged.flat().filter(Boolean).length
    this.mineCount?.setText(`Mines: ${remaining}`)
    this.drawGrid()
  }

  revealCell(r: number, c: number) {
    if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) return
    if (this.revealed[r][c] || this.flagged[r][c]) return

    this.revealed[r][c] = true

    if (this.grid[r][c] === -1) {
      this.gameOver = true
      // reveal all mines
      for (let rr = 0; rr < this.rows; rr++)
        for (let cc = 0; cc < this.cols; cc++)
          if (this.grid[rr][cc] === -1) this.revealed[rr][cc] = true
      this.drawGrid()
      this.add.text(400, 300, 'BOOM! Game Over', { fontSize: '40px', color: '#ff0000', fontStyle: 'bold' }).setOrigin(0.5)
      this.add.text(400, 350, 'Click to Restart', { fontSize: '20px', color: '#aaa' }).setOrigin(0.5)
      return
    }

    if (this.grid[r][c] === 0) {
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++)
          this.revealCell(r + dr, c + dc)
    }

    this.drawGrid()
    this.checkWin()
  }

  checkWin() {
    let unrevealed = 0
    for (let r = 0; r < this.rows; r++)
      for (let c = 0; c < this.cols; c++)
        if (!this.revealed[r][c]) unrevealed++
    if (unrevealed === this.mines) {
      this.gameOver = true
      this.add.text(400, 300, 'You Win!', { fontSize: '48px', color: '#00ff88', fontStyle: 'bold' }).setOrigin(0.5)
      this.add.text(400, 350, 'Click to Restart', { fontSize: '20px', color: '#aaa' }).setOrigin(0.5)
    }
  }

  drawGrid() {
    this.cellGraphics?.clear()
    const colors = [0, 0x0000ff, 0x008800, 0xff0000, 0x000088, 0x880000, 0x008888, 0x000000, 0x888888]

    // clear old texts
    this.textObjects.flat().forEach(t => t?.destroy())
    this.textObjects = []
    for (let r = 0; r < this.rows; r++) {
      this.textObjects[r] = []
    }

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const x = this.offsetX + c * this.cellSize
        const y = this.offsetY + r * this.cellSize

        if (this.revealed[r][c]) {
          this.cellGraphics?.fillStyle(0x222244, 1)
          this.cellGraphics?.fillRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2)
          if (this.grid[r][c] === -1) {
            this.cellGraphics?.fillStyle(0xff0000, 1)
            this.cellGraphics?.fillCircle(x + this.cellSize / 2, y + this.cellSize / 2, 10)
          } else if (this.grid[r][c] > 0) {
            const t = this.add.text(x + this.cellSize / 2, y + this.cellSize / 2, `${this.grid[r][c]}`, {
              fontSize: '18px', color: '#' + colors[this.grid[r][c]].toString(16).padStart(6, '0'), fontFamily: 'monospace', fontStyle: 'bold',
            }).setOrigin(0.5)
            this.textObjects[r][c] = t
          }
        } else {
          this.cellGraphics?.fillStyle(0x334466, 1)
          this.cellGraphics?.fillRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2)
          this.cellGraphics?.fillStyle(0x445588, 1)
          this.cellGraphics?.fillRect(x + 2, y + 2, this.cellSize - 4, 2)
          this.cellGraphics?.fillRect(x + 2, y + 2, 2, this.cellSize - 4)

          if (this.flagged[r][c]) {
            const t = this.add.text(x + this.cellSize / 2, y + this.cellSize / 2, '🚩', {
              fontSize: '20px',
            }).setOrigin(0.5)
            this.textObjects[r][c] = t
          }
        }
      }
    }
  }
}

export default {
  metadata: {
    slug: 'minesweeper-quantum',
    title: 'Minesweeper Quantum',
    description: 'Classic minesweeper with a twist. Left-click to reveal, right-click to flag. Clear the field!',
    thumbnailUrl: '/games/minesweeper-quantum/thumbnail.png',
    category: 'Puzzle',
    tags: ['strategy', 'logic'],
    developerName: 'Game Portal Team',
    packageName: 'minesweeper-quantum',
    version: '1.0.0',
  },
  createGame: (containerId: string) => {
    return new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerId,
      width: 800,
      height: 600,
      backgroundColor: '#0a0a1e',
      scene: [MinesweeperScene],
    })
  },
}
