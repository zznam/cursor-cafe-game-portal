import * as Phaser from 'phaser'

class DriftKingScene extends Phaser.Scene {
  private car?: Phaser.GameObjects.Rectangle
  private carAngle = -Math.PI / 2
  private carSpeed = 0
  private drifting = false
  private score = 0
  private lap = 0
  private scoreText?: Phaser.GameObjects.Text
  private lapText?: Phaser.GameObjects.Text
  private track: { x: number; y: number }[] = []
  private checkpoints: { x: number; y: number; passed: boolean }[] = []
  private gfx?: Phaser.GameObjects.Graphics
  private gameOver = false

  constructor() {
    super({ key: 'DriftKingScene' })
  }

  create() {
    this.carAngle = -Math.PI / 2
    this.carSpeed = 0
    this.drifting = false
    this.score = 0
    this.lap = 0
    this.gameOver = false

    // track points (loop)
    this.track = [
      { x: 400, y: 500 }, { x: 200, y: 450 }, { x: 100, y: 350 },
      { x: 100, y: 200 }, { x: 200, y: 100 }, { x: 350, y: 80 },
      { x: 500, y: 100 }, { x: 650, y: 150 }, { x: 720, y: 250 },
      { x: 700, y: 400 }, { x: 600, y: 480 }, { x: 400, y: 500 },
    ]

    this.checkpoints = this.track.map(p => ({ ...p, passed: false }))
    this.checkpoints[0].passed = true

    this.gfx = this.add.graphics()
    this.drawTrack()

    this.car = this.add.rectangle(400, 500, 20, 12, 0x00ffcc)

    this.scoreText = this.add.text(16, 16, 'Drift: 0', { fontSize: '20px', color: '#ff0', fontFamily: 'monospace' })
    this.lapText = this.add.text(16, 40, 'Lap: 0', { fontSize: '20px', color: '#0ff', fontFamily: 'monospace' })
    this.add.text(400, 570, 'Arrow keys: steer/accelerate. SPACE: drift', { fontSize: '13px', color: '#666', fontFamily: 'monospace' }).setOrigin(0.5)
  }

  drawTrack() {
    this.gfx?.clear()
    this.gfx?.lineStyle(50, 0x222244, 0.8)
    this.gfx?.beginPath()
    this.gfx?.moveTo(this.track[0].x, this.track[0].y)
    for (let i = 1; i < this.track.length; i++) {
      this.gfx?.lineTo(this.track[i].x, this.track[i].y)
    }
    this.gfx?.strokePath()

    // center line
    this.gfx?.lineStyle(2, 0x444488, 0.5)
    this.gfx?.beginPath()
    this.gfx?.moveTo(this.track[0].x, this.track[0].y)
    for (let i = 1; i < this.track.length; i++) {
      this.gfx?.lineTo(this.track[i].x, this.track[i].y)
    }
    this.gfx?.strokePath()

    // checkpoints
    for (const cp of this.checkpoints) {
      this.gfx?.fillStyle(cp.passed ? 0x00ff00 : 0xff8800, 0.4)
      this.gfx?.fillCircle(cp.x, cp.y, 8)
    }
  }

  update() {
    if (this.gameOver) return

    const cursors = this.input.keyboard?.createCursorKeys()
    const spaceKey = this.input.keyboard?.addKey('SPACE')

    this.drifting = spaceKey?.isDown ?? false

    if (cursors?.up.isDown) this.carSpeed = Math.min(this.carSpeed + 0.15, 5)
    else if (cursors?.down.isDown) this.carSpeed = Math.max(this.carSpeed - 0.2, -2)
    else this.carSpeed *= 0.98

    const turnRate = this.drifting ? 0.06 : 0.04
    if (cursors?.left.isDown) this.carAngle -= turnRate * (this.carSpeed > 0 ? 1 : -1)
    if (cursors?.right.isDown) this.carAngle += turnRate * (this.carSpeed > 0 ? 1 : -1)

    if (this.drifting && Math.abs(this.carSpeed) > 1) {
      this.score += Math.floor(Math.abs(this.carSpeed))
      this.scoreText?.setText(`Drift: ${this.score}`)
    }

    if (this.car) {
      this.car.x += Math.cos(this.carAngle) * this.carSpeed
      this.car.y += Math.sin(this.carAngle) * this.carSpeed
      this.car.rotation = this.carAngle

      this.car.setFillStyle(this.drifting ? 0xff00ff : 0x00ffcc)

      // wrap
      if (this.car.x < 0) this.car.x = 800
      if (this.car.x > 800) this.car.x = 0
      if (this.car.y < 0) this.car.y = 600
      if (this.car.y > 600) this.car.y = 0

      // checkpoint detection
      for (let i = 0; i < this.checkpoints.length; i++) {
        const cp = this.checkpoints[i]
        if (!cp.passed && Phaser.Math.Distance.Between(this.car.x, this.car.y, cp.x, cp.y) < 30) {
          // must pass in order
          const prevIdx = (i - 1 + this.checkpoints.length) % this.checkpoints.length
          if (i === 0 || this.checkpoints[prevIdx].passed) {
            cp.passed = true
            this.drawTrack()
          }
        }
      }

      // check lap complete
      if (this.checkpoints.every(cp => cp.passed)) {
        this.lap++
        this.lapText?.setText(`Lap: ${this.lap}`)
        this.checkpoints.forEach(cp => (cp.passed = false))
        this.checkpoints[0].passed = true
        this.drawTrack()
      }
    }
  }
}

export default {
  metadata: {
    slug: 'drift-king-2d',
    title: 'Drift King 2D',
    description: 'Top-down racing game focusing on drifting. Hold SPACE to drift around corners for points!',
    thumbnailUrl: '/games/drift-king-2d/thumbnail.png',
    category: 'Racing',
    tags: ['driving', 'drifting'],
    developerName: 'Game Portal Team',
    packageName: 'drift-king-2d',
    version: '1.0.0',
  },
  createGame: (containerId: string) => {
    return new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerId,
      width: 800,
      height: 600,
      backgroundColor: '#0a0a1e',
      scene: [DriftKingScene],
    })
  },
}
