import * as Phaser from 'phaser'

class HexagonMatchScene extends Phaser.Scene {
  private grid: (number | null)[][] = []
  private hexes: (Phaser.GameObjects.Polygon | null)[][] = []
  private cols = 9
  private rows = 7
  private hexR = 30
  private selected: { r: number; c: number } | null = null
  private score = 0
  private scoreText?: Phaser.GameObjects.Text
  private colors = [0xff4466, 0x44ff66, 0x4488ff, 0xffaa00, 0xaa44ff, 0x44ffff]
  private offsetX = 80
  private offsetY = 80
  private animating = false

  constructor() {
    super({ key: 'HexagonMatchScene' })
  }

  create() {
    this.score = 0
    this.selected = null
    this.animating = false
    this.grid = []
    this.hexes = []

    this.add.text(400, 25, 'Hexagon Match 3', { fontSize: '28px', color: '#fff', fontFamily: 'monospace' }).setOrigin(0.5)
    this.scoreText = this.add.text(700, 25, 'Score: 0', { fontSize: '20px', color: '#0ff', fontFamily: 'monospace' }).setOrigin(0.5)

    for (let r = 0; r < this.rows; r++) {
      this.grid[r] = []
      this.hexes[r] = []
      for (let c = 0; c < this.cols; c++) {
        this.grid[r][c] = Phaser.Math.Between(0, this.colors.length - 1)
        this.hexes[r][c] = null
      }
    }

    // remove initial matches
    let hasMatch = true
    while (hasMatch) {
      hasMatch = false
      const matches = this.findMatches()
      if (matches.length > 0) {
        hasMatch = true
        for (const [r, c] of matches) {
          this.grid[r][c] = Phaser.Math.Between(0, this.colors.length - 1)
        }
      }
    }

    this.drawBoard()

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.animating) return
      const { r, c } = this.pixelToHex(pointer.x, pointer.y)
      if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) return

      if (!this.selected) {
        this.selected = { r, c }
        this.drawBoard()
      } else {
        if (this.areNeighbors(this.selected.r, this.selected.c, r, c)) {
          this.swap(this.selected.r, this.selected.c, r, c)
          const matches = this.findMatches()
          if (matches.length > 0) {
            this.processMatches()
          } else {
            this.swap(this.selected.r, this.selected.c, r, c)
          }
          this.selected = null
          this.drawBoard()
        } else {
          this.selected = { r, c }
          this.drawBoard()
        }
      }
    })
  }

  hexToPixel(r: number, c: number) {
    const w = this.hexR * Math.sqrt(3)
    const h = this.hexR * 2
    const x = this.offsetX + c * w + (r % 2 === 1 ? w / 2 : 0)
    const y = this.offsetY + r * h * 0.75
    return { x, y }
  }

  pixelToHex(px: number, py: number): { r: number; c: number } {
    let closest = { r: -1, c: -1 }
    let minDist = Infinity
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const { x, y } = this.hexToPixel(r, c)
        const d = Math.sqrt((px - x) ** 2 + (py - y) ** 2)
        if (d < minDist && d < this.hexR) { minDist = d; closest = { r, c } }
      }
    }
    return closest
  }

  areNeighbors(r1: number, c1: number, r2: number, c2: number): boolean {
    const even = r1 % 2 === 0
    const neighbors = even
      ? [[-1, -1], [-1, 0], [0, -1], [0, 1], [1, -1], [1, 0]]
      : [[-1, 0], [-1, 1], [0, -1], [0, 1], [1, 0], [1, 1]]
    return neighbors.some(([dr, dc]) => r1 + dr === r2 && c1 + dc === c2)
  }

  swap(r1: number, c1: number, r2: number, c2: number) {
    const tmp = this.grid[r1][c1]
    this.grid[r1][c1] = this.grid[r2][c2]
    this.grid[r2][c2] = tmp
  }

  findMatches(): [number, number][] {
    const matched = new Set<string>()
    // check rows
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols - 2; c++) {
        if (this.grid[r][c] !== null && this.grid[r][c] === this.grid[r][c + 1] && this.grid[r][c] === this.grid[r][c + 2]) {
          matched.add(`${r},${c}`)
          matched.add(`${r},${c + 1}`)
          matched.add(`${r},${c + 2}`)
        }
      }
    }
    // check diagonal (top-left to bottom-right for even/odd rows)
    return Array.from(matched).map(s => {
      const [r, c] = s.split(',').map(Number)
      return [r, c] as [number, number]
    })
  }

  processMatches() {
    const matches = this.findMatches()
    if (matches.length === 0) return

    this.animating = true
    this.score += matches.length * 10
    this.scoreText?.setText(`Score: ${this.score}`)

    for (const [r, c] of matches) {
      this.grid[r][c] = null
    }

    // gravity: fill down
    for (let c = 0; c < this.cols; c++) {
      for (let r = this.rows - 1; r >= 0; r--) {
        if (this.grid[r][c] === null) {
          for (let rr = r - 1; rr >= 0; rr--) {
            if (this.grid[rr][c] !== null) {
              this.grid[r][c] = this.grid[rr][c]
              this.grid[rr][c] = null
              break
            }
          }
        }
      }
      // fill top with new
      for (let r = 0; r < this.rows; r++) {
        if (this.grid[r][c] === null) {
          this.grid[r][c] = Phaser.Math.Between(0, this.colors.length - 1)
        }
      }
    }

    this.drawBoard()

    this.time.delayedCall(300, () => {
      const more = this.findMatches()
      if (more.length > 0) {
        this.processMatches()
      } else {
        this.animating = false
      }
    })
  }

  drawBoard() {
    // clear old hexes
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        this.hexes[r][c]?.destroy()
        this.hexes[r][c] = null
      }
    }

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const { x, y } = this.hexToPixel(r, c)
        const color = this.grid[r][c] !== null ? this.colors[this.grid[r][c]!] : 0x333333
        const points: number[] = []
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i - Math.PI / 6
          points.push(Math.cos(angle) * (this.hexR - 2))
          points.push(Math.sin(angle) * (this.hexR - 2))
        }
        const hex = this.add.polygon(x, y, points, color, 0.9)
        if (this.selected && this.selected.r === r && this.selected.c === c) {
          hex.setStrokeStyle(3, 0xffffff)
        }
        this.hexes[r][c] = hex
      }
    }
  }
}

export default {
  metadata: {
    slug: 'hexagon-match-3',
    title: 'Hexagon Match 3',
    description: 'A visually pleasing Match-3 game played on a hexagonal grid. Swap to match colors!',
    thumbnailUrl: '/games/hexagon-match-3/thumbnail.png',
    category: 'Puzzle',
    tags: ['casual', 'matching'],
    developerName: 'Game Portal Team',
    packageName: 'hexagon-match-3',
    version: '1.0.0',
  },
  createGame: (containerId: string) => {
    return new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerId,
      width: 800,
      height: 600,
      backgroundColor: '#0d0d2b',
      scene: [HexagonMatchScene],
    })
  },
}
