import * as Phaser from 'phaser'

const GRID_SIZE = 4
const CELL_SIZE = 120
const CELL_GAP = 10
const GRID_TOTAL = GRID_SIZE * CELL_SIZE + (GRID_SIZE + 1) * CELL_GAP
const GRID_OFFSET_X = (800 - GRID_TOTAL) / 2
const GRID_OFFSET_Y = (600 - GRID_TOTAL) / 2 + 30

const TILE_COLORS: Record<number, number> = {
  2: 0xeee4da,
  4: 0xede0c8,
  8: 0xf2b179,
  16: 0xf59563,
  32: 0xf67c5f,
  64: 0xf65e3b,
  128: 0xedcf72,
  256: 0xedcc61,
  512: 0xedc850,
  1024: 0xedc53f,
  2048: 0xedc22e,
}

function tileTextColor(value: number): string {
  return value <= 4 ? '#776e65' : '#ffffff'
}

function tileFontSize(value: number): number {
  if (value < 100) return 48
  if (value < 1000) return 40
  return 32
}

interface TileSprite {
  bg: Phaser.GameObjects.Graphics
  text: Phaser.GameObjects.Text
  container: Phaser.GameObjects.Container
}

class Game2048Scene extends Phaser.Scene {
  private grid: number[][] = []
  private tiles: (TileSprite | null)[][] = []
  private score = 0
  private scoreText?: Phaser.GameObjects.Text
  private isAnimating = false
  private hasWon = false
  private isGameOver = false
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys

  constructor() {
    super({ key: 'Game2048Scene' })
  }

  create() {
    this.score = 0
    this.isAnimating = false
    this.hasWon = false
    this.isGameOver = false

    this.grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0))
    this.tiles = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null))

    this.drawBackground()

    this.scoreText = this.add.text(400, 25, 'Score: 0', {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5)

    this.add.text(400, 55, 'Use arrow keys to slide tiles', {
      fontSize: '14px',
      color: '#8888aa',
    }).setOrigin(0.5)

    this.spawnTile()
    this.spawnTile()

    this.cursors = this.input.keyboard?.createCursorKeys()

    this.input.keyboard?.on('keydown-UP', () => this.handleMove('up'))
    this.input.keyboard?.on('keydown-DOWN', () => this.handleMove('down'))
    this.input.keyboard?.on('keydown-LEFT', () => this.handleMove('left'))
    this.input.keyboard?.on('keydown-RIGHT', () => this.handleMove('right'))
  }

  private drawBackground() {
    const bg = this.add.graphics()
    bg.fillStyle(0x2a2a4a, 1)
    bg.fillRoundedRect(GRID_OFFSET_X - CELL_GAP, GRID_OFFSET_Y - CELL_GAP, GRID_TOTAL, GRID_TOTAL, 12)

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const { x, y } = this.cellPosition(r, c)
        bg.fillStyle(0x3a3a5a, 1)
        bg.fillRoundedRect(x - CELL_SIZE / 2, y - CELL_SIZE / 2, CELL_SIZE, CELL_SIZE, 8)
      }
    }
  }

  private cellPosition(row: number, col: number): { x: number; y: number } {
    const x = GRID_OFFSET_X + col * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2
    const y = GRID_OFFSET_Y + row * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2
    return { x, y }
  }

  private createTileSprite(row: number, col: number, value: number): TileSprite {
    const { x, y } = this.cellPosition(row, col)
    const color = TILE_COLORS[value] ?? 0xcc66ff

    const bg = this.add.graphics()
    bg.fillStyle(color, 1)
    bg.fillRoundedRect(-CELL_SIZE / 2, -CELL_SIZE / 2, CELL_SIZE, CELL_SIZE, 8)

    const text = this.add.text(0, 0, String(value), {
      fontSize: `${tileFontSize(value)}px`,
      color: tileTextColor(value),
      fontStyle: 'bold',
    }).setOrigin(0.5)

    const container = this.add.container(x, y, [bg, text])
    container.setSize(CELL_SIZE, CELL_SIZE)
    container.setScale(0)

    this.tweens.add({
      targets: container,
      scale: 1,
      duration: 150,
      ease: 'Back.easeOut',
    })

    return { bg, text, container }
  }

  private removeTileSprite(tile: TileSprite) {
    tile.container.destroy()
  }

  private updateTileVisual(tile: TileSprite, value: number) {
    const color = TILE_COLORS[value] ?? 0xcc66ff
    tile.bg.clear()
    tile.bg.fillStyle(color, 1)
    tile.bg.fillRoundedRect(-CELL_SIZE / 2, -CELL_SIZE / 2, CELL_SIZE, CELL_SIZE, 8)
    tile.text.setText(String(value))
    tile.text.setStyle({
      fontSize: `${tileFontSize(value)}px`,
      color: tileTextColor(value),
      fontStyle: 'bold',
    })
  }

  private spawnTile() {
    const empty: { r: number; c: number }[] = []
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (this.grid[r][c] === 0) empty.push({ r, c })
      }
    }
    if (empty.length === 0) return

    const spot = empty[Math.floor(Math.random() * empty.length)]
    const value = Math.random() < 0.9 ? 2 : 4
    this.grid[spot.r][spot.c] = value
    this.tiles[spot.r][spot.c] = this.createTileSprite(spot.r, spot.c, value)
  }

  private handleMove(direction: 'up' | 'down' | 'left' | 'right') {
    if (this.isAnimating || this.isGameOver) return

    const oldGrid = this.grid.map(row => [...row])
    let mergeScore = 0

    const slide = (line: number[]): { result: number[]; score: number } => {
      const filtered = line.filter(v => v !== 0)
      const merged: number[] = []
      let s = 0
      let i = 0
      while (i < filtered.length) {
        if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
          const val = filtered[i] * 2
          merged.push(val)
          s += val
          i += 2
        } else {
          merged.push(filtered[i])
          i++
        }
      }
      while (merged.length < GRID_SIZE) merged.push(0)
      return { result: merged, score: s }
    }

    const newGrid = this.grid.map(row => [...row])

    if (direction === 'left') {
      for (let r = 0; r < GRID_SIZE; r++) {
        const { result, score } = slide(newGrid[r])
        newGrid[r] = result
        mergeScore += score
      }
    } else if (direction === 'right') {
      for (let r = 0; r < GRID_SIZE; r++) {
        const { result, score } = slide([...newGrid[r]].reverse())
        newGrid[r] = result.reverse()
        mergeScore += score
      }
    } else if (direction === 'up') {
      for (let c = 0; c < GRID_SIZE; c++) {
        const col = newGrid.map(row => row[c])
        const { result, score } = slide(col)
        for (let r = 0; r < GRID_SIZE; r++) newGrid[r][c] = result[r]
        mergeScore += score
      }
    } else if (direction === 'down') {
      for (let c = 0; c < GRID_SIZE; c++) {
        const col = newGrid.map(row => row[c]).reverse()
        const { result, score } = slide(col)
        const reversed = result.reverse()
        for (let r = 0; r < GRID_SIZE; r++) newGrid[r][c] = reversed[r]
        mergeScore += score
      }
    }

    let changed = false
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (oldGrid[r][c] !== newGrid[r][c]) {
          changed = true
          break
        }
      }
      if (changed) break
    }

    if (!changed) return

    this.isAnimating = true
    this.score += mergeScore
    this.scoreText?.setText(`Score: ${this.score}`)

    const animations: Promise<void>[] = []

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const oldTile = this.tiles[r][c]
        if (oldTile) {
          this.removeTileSprite(oldTile)
          this.tiles[r][c] = null
        }
      }
    }

    this.grid = newGrid

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (newGrid[r][c] !== 0) {
          const { x, y } = this.cellPosition(r, c)
          const value = newGrid[r][c]
          const color = TILE_COLORS[value] ?? 0xcc66ff

          const bg = this.add.graphics()
          bg.fillStyle(color, 1)
          bg.fillRoundedRect(-CELL_SIZE / 2, -CELL_SIZE / 2, CELL_SIZE, CELL_SIZE, 8)

          const text = this.add.text(0, 0, String(value), {
            fontSize: `${tileFontSize(value)}px`,
            color: tileTextColor(value),
            fontStyle: 'bold',
          }).setOrigin(0.5)

          const container = this.add.container(x, y, [bg, text])
          container.setSize(CELL_SIZE, CELL_SIZE)

          const tile: TileSprite = { bg, text, container }
          this.tiles[r][c] = tile

          const wasMerged = oldGrid[r][c] !== newGrid[r][c] && newGrid[r][c] > 2 &&
            mergeScore > 0 && !this.tileExistedWithValue(oldGrid, r, c, newGrid[r][c])

          if (wasMerged) {
            animations.push(new Promise(resolve => {
              this.tweens.add({
                targets: container,
                scale: { from: 1.2, to: 1 },
                duration: 150,
                ease: 'Back.easeOut',
                onComplete: () => resolve(),
              })
            }))
          }
        }
      }
    }

    this.time.delayedCall(180, () => {
      this.spawnTile()
      this.isAnimating = false

      if (!this.hasWon && this.hasValue(2048)) {
        this.hasWon = true
        this.showWinMessage()
      }

      if (!this.canMove()) {
        this.showGameOver()
      }
    })
  }

  private tileExistedWithValue(grid: number[][], row: number, col: number, value: number): boolean {
    return grid[row][col] === value
  }

  private hasValue(target: number): boolean {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (this.grid[r][c] === target) return true
      }
    }
    return false
  }

  private canMove(): boolean {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (this.grid[r][c] === 0) return true
        if (c < GRID_SIZE - 1 && this.grid[r][c] === this.grid[r][c + 1]) return true
        if (r < GRID_SIZE - 1 && this.grid[r][c] === this.grid[r + 1][c]) return true
      }
    }
    return false
  }

  private showWinMessage() {
    const overlay = this.add.graphics()
    overlay.fillStyle(0x000000, 0.5)
    overlay.fillRect(0, 0, 800, 600)

    this.add.text(400, 250, 'You reached 2048!', {
      fontSize: '42px',
      color: '#ffd700',
      fontStyle: 'bold',
    }).setOrigin(0.5)

    this.add.text(400, 310, `Score: ${this.score}`, {
      fontSize: '28px',
      color: '#ffffff',
    }).setOrigin(0.5)

    const continueText = this.add.text(400, 370, 'Click to continue playing', {
      fontSize: '22px',
      color: '#aaaaaa',
    }).setOrigin(0.5)

    this.input.once('pointerdown', () => {
      overlay.destroy()
      continueText.destroy()
    })
  }

  private showGameOver() {
    this.isGameOver = true

    const overlay = this.add.graphics()
    overlay.fillStyle(0x000000, 0.6)
    overlay.fillRect(0, 0, 800, 600)

    this.add.text(400, 240, 'Game Over', {
      fontSize: '48px',
      color: '#ff4444',
      fontStyle: 'bold',
    }).setOrigin(0.5)

    this.add.text(400, 310, `Score: ${this.score}`, {
      fontSize: '32px',
      color: '#ffffff',
    }).setOrigin(0.5)

    this.add.text(400, 370, 'Click to Restart', {
      fontSize: '24px',
      color: '#aaaaaa',
    }).setOrigin(0.5)

    this.input.once('pointerdown', () => {
      this.scene.restart()
    })
  }
}

export default {
  metadata: {
    slug: '2048',
    title: '2048',
    description: 'Slide and merge tiles to reach 2048! Use arrow keys to combine matching numbers.',
    thumbnailUrl: '/games/2048/thumbnail.png',
    category: 'Puzzle',
    tags: ['puzzle', 'numbers', 'strategy', 'brain'],
    developerName: 'Game Portal Team',
    packageName: '2048',
    version: '1.0.0',
  },
  createGame: (containerId: string) => {
    return new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerId,
      width: 800,
      height: 600,
      backgroundColor: '#1a1a2e',
      scene: [Game2048Scene],
    })
  },
}
