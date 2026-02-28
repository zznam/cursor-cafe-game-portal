import * as Phaser from 'phaser'

class DungeonCrawlerScene extends Phaser.Scene {
  private grid: number[][] = []
  private cols = 20
  private rows = 15
  private cellSize = 40
  private playerPos = { r: 0, c: 0 }
  private pickaxeHP = 100
  private gems = 0
  private depth = 0
  private scoreText?: Phaser.GameObjects.Text
  private pickText?: Phaser.GameObjects.Text
  private depthText?: Phaser.GameObjects.Text
  private gfx?: Phaser.GameObjects.Graphics
  private gameOver = false
  // 0=empty, 1=dirt, 2=stone, 3=gem, 4=lava

  constructor() {
    super({ key: 'DungeonCrawlerScene' })
  }

  create() {
    this.gems = 0
    this.pickaxeHP = 100
    this.depth = 0
    this.gameOver = false
    this.playerPos = { r: 0, c: 10 }

    this.generateLevel()

    this.gfx = this.add.graphics()

    this.scoreText = this.add.text(16, 8, 'Gems: 0', { fontSize: '18px', color: '#0ff', fontFamily: 'monospace' })
    this.pickText = this.add.text(200, 8, 'Pickaxe: 100%', { fontSize: '18px', color: '#ff0', fontFamily: 'monospace' })
    this.depthText = this.add.text(450, 8, 'Depth: 0', { fontSize: '18px', color: '#f80', fontFamily: 'monospace' })

    this.add.text(650, 8, 'Arrow keys to dig', { fontSize: '12px', color: '#666', fontFamily: 'monospace' })

    this.drawGrid()

    this.input.keyboard?.on('keydown-LEFT', () => this.move(0, -1))
    this.input.keyboard?.on('keydown-RIGHT', () => this.move(0, 1))
    this.input.keyboard?.on('keydown-UP', () => this.move(-1, 0))
    this.input.keyboard?.on('keydown-DOWN', () => this.move(1, 0))
  }

  generateLevel() {
    this.grid = []
    for (let r = 0; r < this.rows; r++) {
      this.grid[r] = []
      for (let c = 0; c < this.cols; c++) {
        if (r === 0) {
          this.grid[r][c] = 0
        } else {
          const rand = Math.random()
          if (rand < 0.05 + this.depth * 0.01) this.grid[r][c] = 4 // lava
          else if (rand < 0.12) this.grid[r][c] = 3 // gem
          else if (rand < 0.3) this.grid[r][c] = 2 // stone
          else this.grid[r][c] = 1 // dirt
        }
      }
    }
    this.grid[this.playerPos.r][this.playerPos.c] = 0
  }

  move(dr: number, dc: number) {
    if (this.gameOver) { this.scene.restart(); return }

    const nr = this.playerPos.r + dr
    const nc = this.playerPos.c + dc

    if (nc < 0 || nc >= this.cols) return

    // going down past bottom: new level
    if (nr >= this.rows) {
      this.depth++
      this.depthText?.setText(`Depth: ${this.depth}`)
      this.playerPos = { r: 0, c: nc }
      this.generateLevel()
      this.drawGrid()
      return
    }
    if (nr < 0) return

    const cell = this.grid[nr][nc]
    if (cell === 4) { // lava
      this.endGame()
      return
    }
    if (cell === 2) { // stone
      this.pickaxeHP -= 15
    } else if (cell === 1) { // dirt
      this.pickaxeHP -= 3
    }
    if (cell === 3) { // gem
      this.gems += 10
      this.scoreText?.setText(`Gems: ${this.gems}`)
    }

    this.pickText?.setText(`Pickaxe: ${Math.max(this.pickaxeHP, 0)}%`)
    if (this.pickaxeHP <= 0) {
      this.endGame()
      return
    }

    this.grid[nr][nc] = 0
    this.playerPos = { r: nr, c: nc }
    this.drawGrid()
  }

  drawGrid() {
    this.gfx?.clear()
    const colors: Record<number, number> = { 0: 0x111122, 1: 0x664422, 2: 0x666666, 3: 0x00ffcc, 4: 0xff4400 }

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const x = c * this.cellSize
        const y = 30 + r * this.cellSize
        this.gfx?.fillStyle(colors[this.grid[r][c]] || 0x000000, 1)
        this.gfx?.fillRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2)

        if (this.grid[r][c] === 3) {
          this.gfx?.fillStyle(0xffffff, 0.5)
          this.gfx?.fillCircle(x + this.cellSize / 2, y + this.cellSize / 2, 6)
        }
      }
    }

    // player
    const px = this.playerPos.c * this.cellSize
    const py = 30 + this.playerPos.r * this.cellSize
    this.gfx?.fillStyle(0x00ff88, 1)
    this.gfx?.fillRect(px + 6, py + 4, this.cellSize - 12, this.cellSize - 8)
    this.gfx?.fillStyle(0xffffff, 1)
    this.gfx?.fillCircle(px + 14, py + 14, 3)
    this.gfx?.fillCircle(px + 26, py + 14, 3)
  }

  endGame() {
    this.gameOver = true
    this.add.text(400, 280, 'Game Over!', { fontSize: '48px', color: '#ff4444', fontStyle: 'bold' }).setOrigin(0.5)
    this.add.text(400, 330, `Gems: ${this.gems} | Depth: ${this.depth}`, { fontSize: '24px', color: '#fff' }).setOrigin(0.5)
    this.add.text(400, 380, 'Press any arrow to Restart', { fontSize: '18px', color: '#aaa' }).setOrigin(0.5)
  }
}

export default {
  metadata: {
    slug: 'dungeon-crawler-miner',
    title: 'Dungeon Crawler Miner',
    description: 'Dig down into a grid-based mine. Manage your pickaxe and collect gems. Avoid lava!',
    thumbnailUrl: '/games/dungeon-crawler-miner/thumbnail.png',
    category: 'Adventure',
    tags: ['rpg', 'mining'],
    developerName: 'Game Portal Team',
    packageName: 'dungeon-crawler-miner',
    version: '1.0.0',
  },
  createGame: (containerId: string) => {
    return new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerId,
      width: 800,
      height: 630,
      backgroundColor: '#0a0a1e',
      scene: [DungeonCrawlerScene],
    })
  },
}
