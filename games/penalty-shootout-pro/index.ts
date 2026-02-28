import * as Phaser from 'phaser'

class PenaltyShootoutScene extends Phaser.Scene {
  private ball?: Phaser.Physics.Arcade.Image
  private keeper?: Phaser.GameObjects.Rectangle
  private goalPosts?: Phaser.GameObjects.Graphics
  private score = 0
  private round = 0
  private totalRounds = 10
  private goals = 0
  private saves = 0
  private scoreText?: Phaser.GameObjects.Text
  private roundText?: Phaser.GameObjects.Text
  private infoText?: Phaser.GameObjects.Text
  private gameOver = false
  private shooting = false
  private dragStart = { x: 0, y: 0 }
  private aimLine?: Phaser.GameObjects.Graphics

  constructor() {
    super({ key: 'PenaltyShootoutScene' })
  }

  create() {
    this.score = 0
    this.round = 0
    this.goals = 0
    this.saves = 0
    this.gameOver = false
    this.shooting = false

    this.createTextures()

    // pitch
    this.add.rectangle(400, 500, 800, 200, 0x228833)
    // goal area
    this.goalPosts = this.add.graphics()
    this.goalPosts.lineStyle(6, 0xffffff)
    this.goalPosts.strokeRect(200, 100, 400, 250)
    // net
    this.goalPosts.lineStyle(1, 0xffffff, 0.15)
    for (let x = 200; x <= 600; x += 20) {
      this.goalPosts.moveTo(x, 100)
      this.goalPosts.lineTo(x, 350)
    }
    for (let y = 100; y <= 350; y += 20) {
      this.goalPosts.moveTo(200, y)
      this.goalPosts.lineTo(600, y)
    }
    this.goalPosts.strokePath()

    // keeper
    this.keeper = this.add.rectangle(400, 320, 50, 60, 0xffcc00)

    this.ball = this.physics.add.image(400, 460, 'soccerball')
      ; (this.ball.body as Phaser.Physics.Arcade.Body).setAllowGravity(false)

    this.aimLine = this.add.graphics()

    this.scoreText = this.add.text(16, 16, 'Goals: 0 / Saves: 0', { fontSize: '20px', color: '#fff', fontFamily: 'monospace' })
    this.roundText = this.add.text(16, 42, 'Round: 1/10', { fontSize: '18px', color: '#ff0', fontFamily: 'monospace' })
    this.infoText = this.add.text(400, 560, 'Swipe from ball toward goal to shoot!', { fontSize: '14px', color: '#ccc', fontFamily: 'monospace' }).setOrigin(0.5)

    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (this.gameOver) { this.scene.restart(); return }
      if (this.shooting) return
      const d = Phaser.Math.Distance.Between(p.x, p.y, this.ball!.x, this.ball!.y)
      if (d < 50) this.dragStart = { x: p.x, y: p.y }
    })
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (!p.isDown || this.shooting) return
      this.aimLine?.clear()
      this.aimLine?.lineStyle(2, 0xffffff, 0.4)
      this.aimLine?.moveTo(this.ball!.x, this.ball!.y)
      this.aimLine?.lineTo(this.ball!.x + (this.dragStart.x - p.x), this.ball!.y + (this.dragStart.y - p.y))
      this.aimLine?.strokePath()
    })
    this.input.on('pointerup', (p: Phaser.Input.Pointer) => {
      if (this.shooting) return
      this.aimLine?.clear()
      const dx = this.dragStart.x - p.x
      const dy = this.dragStart.y - p.y
      const power = Math.sqrt(dx * dx + dy * dy)
      if (power > 30) this.shoot(dx, dy, Math.min(power, 300))
    })

    this.nextRound()
  }

  private createTextures() {
    if (this.textures.exists('soccerball')) return
    const bg = this.make.graphics({ x: 0, y: 0 })
    bg.fillStyle(0xffffff, 1)
    bg.fillCircle(12, 12, 12)
    bg.fillStyle(0x000000, 1)
    bg.fillCircle(12, 6, 4)
    bg.fillCircle(6, 16, 4)
    bg.fillCircle(18, 16, 4)
    bg.generateTexture('soccerball', 24, 24)
    bg.destroy()
  }

  nextRound() {
    this.round++
    this.roundText?.setText(`Round: ${this.round}/${this.totalRounds}`)
    this.shooting = false
    this.ball?.setPosition(400, 460)
      ; (this.ball?.body as Phaser.Physics.Arcade.Body)?.setVelocity(0, 0)

    // keeper moves to random position
    const targetX = Phaser.Math.Between(250, 550)
    this.tweens.add({
      targets: this.keeper,
      x: targetX,
      duration: 800,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    })
  }

  shoot(dx: number, dy: number, power: number) {
    this.shooting = true
    const angle = Math.atan2(dy, dx)
      ; (this.ball?.body as Phaser.Physics.Arcade.Body).setVelocity(
        Math.cos(angle) * power * 2,
        Math.sin(angle) * power * 2
      )

    // keeper dives
    this.tweens.killTweensOf(this.keeper)
    const diveDir = Math.random() > 0.5 ? 1 : -1
    this.tweens.add({
      targets: this.keeper,
      x: (this.keeper?.x || 400) + diveDir * Phaser.Math.Between(60, 150),
      duration: 400,
    })

    this.time.delayedCall(800, () => {
      if (!this.ball || !this.keeper) return

      const ballInGoal = this.ball.x > 210 && this.ball.x < 590 && this.ball.y < 350 && this.ball.y > 100
      const keeperBlock = Math.abs(this.ball.x - this.keeper.x) < 40 && Math.abs(this.ball.y - this.keeper.y) < 40

      if (ballInGoal && !keeperBlock) {
        this.goals++
        this.infoText?.setText('⚽ GOAL!!!').setColor('#00ff88')
      } else if (keeperBlock) {
        this.saves++
        this.infoText?.setText('Saved!').setColor('#ff8800')
      } else {
        this.infoText?.setText('Miss!').setColor('#ff4444')
      }

      this.scoreText?.setText(`Goals: ${this.goals} / Saves: ${this.saves}`)

      if (this.round >= this.totalRounds) {
        this.endGame()
      } else {
        this.time.delayedCall(1000, () => this.nextRound())
      }
    })
  }

  endGame() {
    this.gameOver = true
    const msg = this.goals > this.saves ? 'You Win!' : this.goals === this.saves ? 'Draw!' : 'Keeper Wins!'
    const color = this.goals > this.saves ? '#00ff88' : '#ff4444'
    this.add.text(400, 200, msg, { fontSize: '48px', color, fontStyle: 'bold' }).setOrigin(0.5)
    this.add.text(400, 260, `Goals: ${this.goals}/${this.totalRounds}`, { fontSize: '28px', color: '#fff' }).setOrigin(0.5)
    this.add.text(400, 310, 'Click to Restart', { fontSize: '18px', color: '#aaa' }).setOrigin(0.5)
  }

  update() {}
}

export default {
  metadata: {
    slug: 'penalty-shootout-pro',
    title: 'Penalty Shootout Pro',
    description: 'Swipe to strike a soccer ball past a dynamically moving AI goalkeeper! 10 rounds.',
    thumbnailUrl: '/games/penalty-shootout-pro/thumbnail.png',
    category: 'Sports',
    tags: ['soccer', 'sports'],
    developerName: 'Game Portal Team',
    packageName: 'penalty-shootout-pro',
    version: '1.0.0',
  },
  createGame: (containerId: string) => {
    return new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerId,
      width: 800,
      height: 600,
      backgroundColor: '#1a3322',
      physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 0 }, debug: false } },
      scene: [PenaltyShootoutScene],
    })
  },
}
