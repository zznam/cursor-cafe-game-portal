import * as Phaser from 'phaser'

class MazeRunner3DScene extends Phaser.Scene {
  private maze: number[][] = []
  private mazeW = 21
  private mazeH = 15
  private playerX = 1.5
  private playerY = 1.5
  private playerAngle = 0
  private exitX = 0
  private exitY = 0
  private gfx?: Phaser.GameObjects.Graphics
  private miniGfx?: Phaser.GameObjects.Graphics
  private timeLeft = 60
  private timerText?: Phaser.GameObjects.Text
  private gameOver = false
  private moveSpeed = 0.04
  private rotSpeed = 0.04

  constructor() {
    super({ key: 'MazeRunner3DScene' })
  }

  create() {
    this.timeLeft = 60
    this.gameOver = false
    this.playerX = 1.5
    this.playerY = 1.5
    this.playerAngle = 0

    this.generateMaze()

    this.gfx = this.add.graphics()
    this.miniGfx = this.add.graphics()

    this.timerText = this.add.text(400, 16, `Time: ${this.timeLeft}`, {
      fontSize: '22px', color: '#ff0', fontFamily: 'monospace',
    }).setOrigin(0.5)

    this.time.addEvent({
      delay: 1000,
      callback: () => {
        if (this.gameOver) return
        this.timeLeft--
        this.timerText?.setText(`Time: ${this.timeLeft}`)
        if (this.timeLeft <= 0) this.endGame(false)
      },
      loop: true,
    })
  }

  generateMaze() {
    this.maze = Array.from({ length: this.mazeH }, () => Array(this.mazeW).fill(1))

    const stack: [number, number][] = []
    const start: [number, number] = [1, 1]
    this.maze[1][1] = 0
    stack.push(start)

    while (stack.length > 0) {
      const [cy, cx] = stack[stack.length - 1]
      const dirs = [[0, 2], [0, -2], [2, 0], [-2, 0]]
        .filter(([dy, dx]) => {
          const ny = cy + dy, nx = cx + dx
          return ny > 0 && ny < this.mazeH - 1 && nx > 0 && nx < this.mazeW - 1 && this.maze[ny][nx] === 1
        })

      if (dirs.length === 0) {
        stack.pop()
      } else {
        const [dy, dx] = dirs[Math.floor(Math.random() * dirs.length)]
        this.maze[cy + dy / 2][cx + dx / 2] = 0
        this.maze[cy + dy][cx + dx] = 0
        stack.push([cy + dy, cx + dx])
      }
    }

    // find exit (farthest open cell from start)
    this.exitX = this.mazeW - 2
    this.exitY = this.mazeH - 2
    this.maze[this.exitY][this.exitX] = 0
    // ensure path
    if (this.maze[this.exitY - 1][this.exitX] === 1 && this.maze[this.exitY][this.exitX - 1] === 1) {
      this.maze[this.exitY - 1][this.exitX] = 0
    }
  }

  castRay(angle: number): number {
    const dx = Math.cos(angle) * 0.02
    const dy = Math.sin(angle) * 0.02
    let x = this.playerX, y = this.playerY

    for (let i = 0; i < 500; i++) {
      x += dx
      y += dy
      const mx = Math.floor(x), my = Math.floor(y)
      if (mx < 0 || mx >= this.mazeW || my < 0 || my >= this.mazeH) return i * 0.02
      if (this.maze[my][mx] === 1) return i * 0.02
    }
    return 10
  }

  renderView() {
    this.gfx?.clear()

    // sky
    this.gfx?.fillStyle(0x111133, 1)
    this.gfx?.fillRect(0, 0, 600, 300)
    // floor
    this.gfx?.fillStyle(0x222244, 1)
    this.gfx?.fillRect(0, 300, 600, 300)

    const numRays = 300
    const fov = Math.PI / 3

    for (let i = 0; i < numRays; i++) {
      const rayAngle = this.playerAngle - fov / 2 + (i / numRays) * fov
      const dist = this.castRay(rayAngle)
      const corrDist = dist * Math.cos(rayAngle - this.playerAngle)
      const wallH = Math.min(600, 300 / (corrDist + 0.001))

      const brightness = Math.max(0, Math.min(255, Math.floor(255 - corrDist * 40)))
      const color = Phaser.Display.Color.GetColor(brightness * 0.3, brightness * 0.5, brightness)

      this.gfx?.fillStyle(color, 1)
      this.gfx?.fillRect(i * 2, 300 - wallH / 2, 2, wallH)
    }

    // exit marker
    const edx = this.exitX + 0.5 - this.playerX
    const edy = this.exitY + 0.5 - this.playerY
    const eDist = Math.sqrt(edx * edx + edy * edy)
    if (eDist < 1) this.endGame(true)
  }

  renderMinimap() {
    this.miniGfx?.clear()
    const s = 6
    const ox = 620, oy = 20

    for (let y = 0; y < this.mazeH; y++) {
      for (let x = 0; x < this.mazeW; x++) {
        this.miniGfx?.fillStyle(this.maze[y][x] === 1 ? 0x334466 : 0x111122, 1)
        this.miniGfx?.fillRect(ox + x * s, oy + y * s, s - 1, s - 1)
      }
    }
    // exit
    this.miniGfx?.fillStyle(0x00ff00, 1)
    this.miniGfx?.fillRect(ox + this.exitX * s, oy + this.exitY * s, s - 1, s - 1)

    // player
    this.miniGfx?.fillStyle(0xff0000, 1)
    this.miniGfx?.fillCircle(ox + this.playerX * s, oy + this.playerY * s, 3)
  }

  endGame(won: boolean) {
    if (this.gameOver) return
    this.gameOver = true
    const msg = won ? 'You Escaped!' : "Time's Up!"
    const color = won ? '#00ff88' : '#ff4444'
    this.add.text(300, 280, msg, { fontSize: '48px', color, fontStyle: 'bold' }).setOrigin(0.5)
    this.add.text(300, 340, 'Click to Restart', { fontSize: '20px', color: '#aaa' }).setOrigin(0.5)
    this.input.once('pointerdown', () => this.scene.restart())
  }

  update() {
    if (this.gameOver) return

    const cursors = this.input.keyboard?.createCursorKeys()
    if (cursors?.left.isDown) this.playerAngle -= this.rotSpeed
    if (cursors?.right.isDown) this.playerAngle += this.rotSpeed

    if (cursors?.up.isDown) {
      const nx = this.playerX + Math.cos(this.playerAngle) * this.moveSpeed
      const ny = this.playerY + Math.sin(this.playerAngle) * this.moveSpeed
      if (this.maze[Math.floor(ny)][Math.floor(nx)] === 0) {
        this.playerX = nx
        this.playerY = ny
      }
    }
    if (cursors?.down.isDown) {
      const nx = this.playerX - Math.cos(this.playerAngle) * this.moveSpeed
      const ny = this.playerY - Math.sin(this.playerAngle) * this.moveSpeed
      if (this.maze[Math.floor(ny)][Math.floor(nx)] === 0) {
        this.playerX = nx
        this.playerY = ny
      }
    }

    this.renderView()
    this.renderMinimap()
  }
}

export default {
  metadata: {
    slug: 'maze-runner-3d',
    title: 'Maze Runner 3D',
    description: 'Navigate a first-person pseudo-3D maze using raycasting. Find the exit before time runs out!',
    thumbnailUrl: '/games/maze-runner-3d/thumbnail.png',
    category: 'Adventure',
    tags: ['3d', 'maze'],
    developerName: 'Game Portal Team',
    packageName: 'maze-runner-3d',
    version: '1.0.0',
  },
  createGame: (containerId: string) => {
    return new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerId,
      width: 800,
      height: 600,
      backgroundColor: '#000000',
      scene: [MazeRunner3DScene],
    })
  },
}
