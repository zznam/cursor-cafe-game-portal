import * as Phaser from 'phaser'

class RetroHoopsScene extends Phaser.Scene {
  private ball?: Phaser.Physics.Arcade.Image
  private hoop?: Phaser.GameObjects.Arc
  private hoopDir = 1
  private score = 0
  private timeLeft = 45
  private scoreText?: Phaser.GameObjects.Text
  private timerText?: Phaser.GameObjects.Text
  private infoText?: Phaser.GameObjects.Text
  private gameOver = false
  private shooting = false
  private powerBar?: Phaser.GameObjects.Rectangle
  private powerBg?: Phaser.GameObjects.Rectangle
  private power = 0
  private charging = false

  constructor() {
    super({ key: 'RetroHoopsScene' })
  }

  create() {
    this.score = 0
    this.timeLeft = 45
    this.gameOver = false
    this.shooting = false
    this.power = 0
    this.charging = false

    this.createTextures()

    // backboard
    this.add.rectangle(650, 180, 10, 80, 0xff6600)
    // rim
    this.hoop = this.add.circle(600, 220, 25, 0xff6600, 0)
    this.hoop.setStrokeStyle(4, 0xff6600)

    // net lines
    const netGfx = this.add.graphics()
    netGfx.lineStyle(1, 0xffffff, 0.3)
    for (let i = 0; i < 5; i++) {
      netGfx.moveTo(580 + i * 10, 225)
      netGfx.lineTo(585 + i * 7, 270)
    }
    netGfx.strokePath()

    this.ball = this.physics.add.image(200, 450, 'bball')
      ; (this.ball.body as Phaser.Physics.Arcade.Body).setAllowGravity(false)
      ; (this.ball.body as Phaser.Physics.Arcade.Body).setBounceY(0.5)

    this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '22px', color: '#ff0', fontFamily: 'monospace' })
    this.timerText = this.add.text(16, 44, 'Time: 45', { fontSize: '22px', color: '#f44', fontFamily: 'monospace' })
    this.infoText = this.add.text(400, 560, 'Hold & release to shoot. Power + aim!', { fontSize: '14px', color: '#888', fontFamily: 'monospace' }).setOrigin(0.5)

    this.powerBg = this.add.rectangle(200, 500, 100, 12, 0x333333)
    this.powerBar = this.add.rectangle(152, 500, 0, 10, 0x00ff00)

    this.input.on('pointerdown', () => {
      if (this.gameOver) { this.scene.restart(); return }
      if (!this.shooting) { this.charging = true; this.power = 0 }
    })
    this.input.on('pointerup', () => {
      if (this.charging && !this.shooting) {
        this.charging = false
        this.shoot()
      }
    })

    this.time.addEvent({
      delay: 1000,
      callback: () => {
        if (this.gameOver) return
        this.timeLeft--
        this.timerText?.setText(`Time: ${this.timeLeft}`)
        if (this.timeLeft <= 0) this.endGame()
      },
      loop: true,
    })
  }

  private createTextures() {
    if (this.textures.exists('bball')) return
    const bg = this.make.graphics({ x: 0, y: 0 })
    bg.fillStyle(0xff6600, 1)
    bg.fillCircle(12, 12, 12)
    bg.lineStyle(1, 0x000000, 0.3)
    bg.strokeCircle(12, 12, 12)
    bg.moveTo(12, 0); bg.lineTo(12, 24)
    bg.moveTo(0, 12); bg.lineTo(24, 12)
    bg.strokePath()
    bg.generateTexture('bball', 24, 24)
    bg.destroy()
  }

  shoot() {
    if (!this.ball || this.shooting) return
    this.shooting = true

    const vx = 200 + this.power * 2
    const vy = -(350 + this.power * 1.5)

    const bb = this.ball.body as Phaser.Physics.Arcade.Body
    bb.setAllowGravity(true)
    bb.setVelocity(vx, vy)
    bb.setBounce(0.4, 0.4)

    this.time.delayedCall(2000, () => {
      // check if scored
      if (this.ball && this.hoop) {
        const dx = Math.abs(this.ball.x - this.hoop.x)
        const dy = this.ball.y - this.hoop.y
        if (dx < 30 && dy > -10 && dy < 50) {
          this.score += 3
          this.scoreText?.setText(`Score: ${this.score}`)
          this.infoText?.setText('Swish! +3').setColor('#00ff88')
        } else {
          this.infoText?.setText('Miss!').setColor('#ff4444')
        }
      }
      this.resetBall()
    })
  }

  resetBall() {
    if (!this.ball) return
    this.ball.setPosition(200, 450)
    const bb = this.ball.body as Phaser.Physics.Arcade.Body
    bb.setVelocity(0, 0)
    bb.setAllowGravity(false)
    this.shooting = false
    this.power = 0
    this.powerBar?.setDisplaySize(0, 10)
  }

  endGame() {
    this.gameOver = true
    this.physics.pause()
    this.add.text(400, 260, "Time's Up!", { fontSize: '48px', color: '#ff4444', fontStyle: 'bold' }).setOrigin(0.5)
    this.add.text(400, 320, `Score: ${this.score}`, { fontSize: '32px', color: '#fff' }).setOrigin(0.5)
    this.add.text(400, 370, 'Click to Restart', { fontSize: '20px', color: '#aaa' }).setOrigin(0.5)
  }

  update() {
    if (this.gameOver) return

    // move hoop
    if (this.hoop) {
      this.hoop.x += this.hoopDir * 0.8
      if (this.hoop.x > 700) this.hoopDir = -1
      if (this.hoop.x < 500) this.hoopDir = 1
    }

    // charge power
    if (this.charging) {
      this.power = Math.min(this.power + 2, 100)
      const barColor = this.power > 80 ? 0xff0000 : this.power > 50 ? 0xffff00 : 0x00ff00
      this.powerBar?.setDisplaySize(this.power, 10).setFillStyle(barColor)
    }
  }
}

export default {
  metadata: {
    slug: 'retro-hoops',
    title: 'Retro Hoops',
    description: 'Shoot basketballs into a moving hoop! Hold to charge, release to shoot.',
    thumbnailUrl: '/games/retro-hoops/thumbnail.png',
    category: 'Sports',
    tags: ['physics', 'basketball'],
    developerName: 'Game Portal Team',
    packageName: 'retro-hoops',
    version: '1.0.0',
  },
  createGame: (containerId: string) => {
    return new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerId,
      width: 800,
      height: 600,
      backgroundColor: '#1a0a2e',
      physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 400 }, debug: false } },
      scene: [RetroHoopsScene],
    })
  },
}
