import * as Phaser from 'phaser'

class MiniGolfScene extends Phaser.Scene {
  private ball?: Phaser.Physics.Arcade.Image
  private hole?: Phaser.GameObjects.Arc
  private dragging = false
  private dragStart = { x: 0, y: 0 }
  private aimLine?: Phaser.GameObjects.Graphics
  private strokes = 0
  private holeNum = 1
  private totalHoles = 9
  private scoreText?: Phaser.GameObjects.Text
  private holeText?: Phaser.GameObjects.Text
  private walls?: Phaser.Physics.Arcade.StaticGroup
  private gameOver = false

  constructor() {
    super({ key: 'MiniGolfScene' })
  }

  create() {
    this.strokes = 0
    this.holeNum = 1
    this.gameOver = false

    this.createTextures()

    this.walls = this.physics.add.staticGroup()
    this.aimLine = this.add.graphics()

    this.scoreText = this.add.text(16, 16, 'Strokes: 0', { fontSize: '20px', color: '#0ff', fontFamily: 'monospace' })
    this.holeText = this.add.text(16, 42, 'Hole: 1/9', { fontSize: '20px', color: '#ff0', fontFamily: 'monospace' })
    this.add.text(400, 580, 'Drag from ball to aim, release to shoot', { fontSize: '14px', color: '#666', fontFamily: 'monospace' }).setOrigin(0.5)

    this.setupHole(this.holeNum)

    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (this.gameOver) { this.scene.restart(); return }
      if (!this.ball || this.isBallMoving()) return
      const d = Phaser.Math.Distance.Between(p.x, p.y, this.ball.x, this.ball.y)
      if (d < 40) {
        this.dragging = true
        this.dragStart = { x: p.x, y: p.y }
      }
    })
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (!this.dragging || !this.ball) return
      this.aimLine?.clear()
      this.aimLine?.lineStyle(2, 0xffffff, 0.5)
      this.aimLine?.moveTo(this.ball.x, this.ball.y)
      const dx = this.ball.x - (p.x - this.dragStart.x + this.ball.x - (this.ball.x - this.dragStart.x))
      const dy = this.ball.y - (p.y - this.dragStart.y + this.ball.y - (this.ball.y - this.dragStart.y))
      // show aim direction
      this.aimLine?.lineTo(this.ball.x + (this.dragStart.x - p.x) * 0.5, this.ball.y + (this.dragStart.y - p.y) * 0.5)
      this.aimLine?.strokePath()
    })
    this.input.on('pointerup', (p: Phaser.Input.Pointer) => {
      if (!this.dragging || !this.ball) return
      this.dragging = false
      this.aimLine?.clear()

      const dx = this.dragStart.x - p.x
      const dy = this.dragStart.y - p.y
      const power = Math.min(Math.sqrt(dx * dx + dy * dy), 300)

      if (power > 10) {
        const angle = Math.atan2(dy, dx)
          ; (this.ball.body as Phaser.Physics.Arcade.Body).setVelocity(
            Math.cos(angle) * power * 2,
            Math.sin(angle) * power * 2
          )
        this.strokes++
        this.scoreText?.setText(`Strokes: ${this.strokes}`)
      }
    })
  }

  private createTextures() {
    if (this.textures.exists('golfball')) return
    const bg = this.make.graphics({ x: 0, y: 0 })
    bg.fillStyle(0xffffff, 1)
    bg.fillCircle(8, 8, 8)
    bg.generateTexture('golfball', 16, 16)
    bg.destroy()
  }

  isBallMoving(): boolean {
    if (!this.ball) return false
    const b = this.ball.body as Phaser.Physics.Arcade.Body
    return Math.abs(b.velocity.x) > 5 || Math.abs(b.velocity.y) > 5
  }

  setupHole(n: number) {
    this.walls?.clear(true, true)
    this.ball?.destroy()
    this.hole?.destroy()

    // borders
    const bw = 10
    this.addWall(400, bw / 2, 800, bw)      // top
    this.addWall(400, 560 - bw / 2, 800, bw) // bottom
    this.addWall(bw / 2, 280, bw, 560)       // left
    this.addWall(800 - bw / 2, 280, bw, 560) // right

    // different layouts per hole
    const layouts: { walls: number[][]; ball: number[]; hole: number[] }[] = [
      { walls: [], ball: [150, 450], hole: [650, 150] },
      { walls: [[400, 300, 200, 10]], ball: [150, 450], hole: [650, 150] },
      { walls: [[300, 200, 10, 200], [500, 400, 10, 200]], ball: [100, 300], hole: [700, 300] },
      { walls: [[250, 280, 200, 10], [550, 280, 200, 10]], ball: [150, 450], hole: [400, 100] },
      { walls: [[400, 150, 10, 200], [400, 450, 10, 200], [250, 300, 100, 10]], ball: [100, 300], hole: [700, 300] },
      { walls: [[200, 200, 10, 250], [600, 350, 10, 250], [400, 200, 200, 10]], ball: [100, 450], hole: [700, 100] },
      { walls: [[300, 300, 200, 10], [500, 200, 200, 10], [300, 400, 10, 120]], ball: [100, 100], hole: [700, 500] },
      { walls: [[200, 280, 10, 300], [400, 280, 10, 300], [600, 280, 10, 300]], ball: [100, 450], hole: [700, 100] },
      { walls: [[300, 200, 200, 10], [500, 400, 200, 10], [200, 350, 10, 150], [600, 250, 10, 150]], ball: [100, 450], hole: [700, 100] },
    ]

    const layout = layouts[(n - 1) % layouts.length]

    for (const w of layout.walls) {
      this.addWall(w[0], w[1], w[2], w[3])
    }

    this.hole = this.add.circle(layout.hole[0], layout.hole[1], 14, 0x000000)
    this.hole.setStrokeStyle(2, 0x00ff00)

    this.ball = this.physics.add.image(layout.ball[0], layout.ball[1], 'golfball')
    const bb = this.ball.body as Phaser.Physics.Arcade.Body
    bb.setCollideWorldBounds(true)
    bb.setBounce(0.6, 0.6)
    bb.setDrag(100, 100)
    bb.setMaxVelocity(600, 600)

    this.physics.add.collider(this.ball, this.walls)
  }

  addWall(x: number, y: number, w: number, h: number) {
    const wall = this.add.rectangle(x, y, w, h, 0x446688)
    this.walls?.add(wall)
  }

  update() {
    if (this.gameOver || !this.ball || !this.hole) return

    // friction
    const bb = this.ball.body as Phaser.Physics.Arcade.Body
    bb.velocity.x *= 0.985
    bb.velocity.y *= 0.985
    if (Math.abs(bb.velocity.x) < 2) bb.velocity.x = 0
    if (Math.abs(bb.velocity.y) < 2) bb.velocity.y = 0

    // check if ball in hole
    const d = Phaser.Math.Distance.Between(this.ball.x, this.ball.y, this.hole.x, this.hole.y)
    if (d < 14 && !this.isBallMoving()) {
      if (this.holeNum >= this.totalHoles) {
        this.gameOver = true
        this.add.text(400, 260, 'Course Complete!', { fontSize: '40px', color: '#00ff88', fontStyle: 'bold' }).setOrigin(0.5)
        this.add.text(400, 320, `Total Strokes: ${this.strokes}`, { fontSize: '28px', color: '#fff' }).setOrigin(0.5)
        this.add.text(400, 370, 'Click to Restart', { fontSize: '18px', color: '#aaa' }).setOrigin(0.5)
        this.input.once('pointerdown', () => this.scene.restart())
      } else {
        this.holeNum++
        this.holeText?.setText(`Hole: ${this.holeNum}/${this.totalHoles}`)
        this.setupHole(this.holeNum)
      }
    }
  }
}

export default {
  metadata: {
    slug: 'mini-golf-course',
    title: 'Mini Golf Course',
    description: 'A drag-and-release physics mini-golf game with 9 unique holes. Drag from the ball to aim!',
    thumbnailUrl: '/games/mini-golf-course/thumbnail.png',
    category: 'Sports',
    tags: ['physics', 'golf'],
    developerName: 'Game Portal Team',
    packageName: 'mini-golf-course',
    version: '1.0.0',
  },
  createGame: (containerId: string) => {
    return new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerId,
      width: 800,
      height: 560,
      backgroundColor: '#1a3322',
      physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 0 }, debug: false } },
      scene: [MiniGolfScene],
    })
  },
}
