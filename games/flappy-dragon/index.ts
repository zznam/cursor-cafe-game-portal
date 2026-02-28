import * as Phaser from 'phaser'

class FlappyDragonScene extends Phaser.Scene {
  private dragon?: Phaser.Physics.Arcade.Image
  private pipes?: Phaser.Physics.Arcade.Group
  private score = 0
  private scoreText?: Phaser.GameObjects.Text
  private gameOver = false
  private pipeTimer?: Phaser.Time.TimerEvent
  private passed = new Set<string>()

  constructor() {
    super({ key: 'FlappyDragonScene' })
  }

  create() {
    this.score = 0
    this.gameOver = false
    this.passed = new Set()

    this.createTextures()

    this.dragon = this.physics.add.image(150, 300, 'dragon')
    const db = this.dragon.body as Phaser.Physics.Arcade.Body
    db.setGravityY(800)
    db.setCollideWorldBounds(true)

    this.pipes = this.physics.add.group()

    this.scoreText = this.add.text(400, 40, '0', {
      fontSize: '48px', color: '#fff', fontFamily: 'monospace',
    }).setOrigin(0.5)

    this.pipeTimer = this.time.addEvent({
      delay: 1800,
      callback: this.spawnPipes,
      callbackScope: this,
      loop: true,
    })

    this.physics.add.overlap(this.dragon, this.pipes, this.hitPipe as any, undefined, this)

    this.input.on('pointerdown', () => {
      if (this.gameOver) return
      db.setVelocityY(-300)
    })
    this.input.keyboard?.on('keydown-SPACE', () => {
      if (this.gameOver) return
      db.setVelocityY(-300)
    })

    this.physics.world.on('worldbounds', () => {
      this.endGame()
    })
    db.onWorldBounds = true
  }

  private createTextures() {
    if (this.textures.exists('dragon')) return

    const dg = this.make.graphics({ x: 0, y: 0 })
    dg.fillStyle(0x44cc44, 1)
    dg.fillCircle(16, 16, 14)
    dg.fillStyle(0x228822, 1)
    dg.fillTriangle(30, 12, 40, 6, 30, 18)
    dg.fillStyle(0xffff00, 1)
    dg.fillCircle(10, 12, 3)
    dg.generateTexture('dragon', 42, 32)
    dg.destroy()

    const pg = this.make.graphics({ x: 0, y: 0 })
    pg.fillStyle(0x33aa33, 1)
    pg.fillRect(0, 0, 60, 400)
    pg.fillStyle(0x44cc44, 1)
    pg.fillRect(0, 0, 60, 6)
    pg.generateTexture('pipe', 60, 400)
    pg.destroy()
  }

  spawnPipes() {
    if (this.gameOver) return
    const gap = 160
    const topH = Phaser.Math.Between(80, 360)
    const id = `pipe_${Date.now()}`

    const top = this.physics.add.image(850, topH - 200, 'pipe')
    top.setData('id', id)
    this.pipes?.add(top)
      ; (top.body as Phaser.Physics.Arcade.Body).setVelocityX(-200)
      ; (top.body as Phaser.Physics.Arcade.Body).setAllowGravity(false)
    top.setFlipY(true)

    const bot = this.physics.add.image(850, topH + gap + 200, 'pipe')
    bot.setData('id', id)
    this.pipes?.add(bot)
      ; (bot.body as Phaser.Physics.Arcade.Body).setVelocityX(-200)
      ; (bot.body as Phaser.Physics.Arcade.Body).setAllowGravity(false)
  }

  hitPipe() {
    this.endGame()
  }

  endGame() {
    if (this.gameOver) return
    this.gameOver = true
    this.pipeTimer?.remove()
    this.physics.pause()

    this.add.text(400, 240, 'Game Over!', { fontSize: '48px', color: '#ff4444', fontStyle: 'bold' }).setOrigin(0.5)
    this.add.text(400, 300, `Score: ${this.score}`, { fontSize: '32px', color: '#fff' }).setOrigin(0.5)
    this.add.text(400, 360, 'Click to Restart', { fontSize: '20px', color: '#aaa' }).setOrigin(0.5)
    this.input.once('pointerdown', () => this.scene.restart())
  }

  update() {
    if (this.gameOver) return

    this.pipes?.children.entries.forEach(p => {
      const pipe = p as Phaser.GameObjects.Image
      if (pipe.x < -80) pipe.destroy()
      if (pipe.x < 150 && !this.passed.has(pipe.getData('id'))) {
        this.passed.add(pipe.getData('id'))
        this.score++
        this.scoreText?.setText(`${Math.floor(this.score / 2)}`)
      }
    })

    if (this.dragon) {
      this.dragon.angle = Phaser.Math.Clamp(
        (this.dragon.body as Phaser.Physics.Arcade.Body).velocity.y * 0.1,
        -30, 30
      )
    }
  }
}

export default {
  metadata: {
    slug: 'flappy-dragon',
    title: 'Flappy Dragon',
    description: 'Navigate a flying dragon through volcanic pillars. Tap or press Space to flap!',
    thumbnailUrl: '/games/flappy-dragon/thumbnail.png',
    category: 'Platformer',
    tags: ['arcade', 'flying'],
    developerName: 'Game Portal Team',
    packageName: 'flappy-dragon',
    version: '1.0.0',
  },
  createGame: (containerId: string) => {
    return new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerId,
      width: 800,
      height: 600,
      backgroundColor: '#1a0a2e',
      physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 0 }, debug: false } },
      scene: [FlappyDragonScene],
    })
  },
}
