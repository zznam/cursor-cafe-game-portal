import * as Phaser from 'phaser'

const PIPE_VELOCITY = -200
const FLAP_VELOCITY = -350
const GRAVITY = 900
const PIPE_SPAWN_INTERVAL = 1500
const INITIAL_GAP = 180
const MIN_GAP = 120
const STAR_COUNT = 80
const TRAIL_LENGTH = 8

interface Star {
  x: number
  y: number
  speed: number
  size: number
}

class FlappyScene extends Phaser.Scene {
  private bird?: Phaser.Physics.Arcade.Sprite
  private pipes?: Phaser.Physics.Arcade.Group
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys
  private score = 0
  private scoreText?: Phaser.GameObjects.Text
  private gameOver = false
  private started = false
  private instructionText?: Phaser.GameObjects.Text
  private pipeTimer?: Phaser.Time.TimerEvent
  private trailGraphics?: Phaser.GameObjects.Graphics
  private trailPositions: { x: number; y: number }[] = []
  private stars: Star[] = []
  private starGraphics?: Phaser.GameObjects.Graphics
  private passedPipes: Set<string> = new Set()
  private pipeIdCounter = 0
  private ground?: Phaser.Physics.Arcade.Image

  constructor() {
    super({ key: 'FlappyScene' })
  }

  create() {
    this.score = 0
    this.gameOver = false
    this.started = false
    this.trailPositions = []
    this.passedPipes = new Set()
    this.pipeIdCounter = 0

    this.generateTextures()

    this.stars = []
    for (let i = 0; i < STAR_COUNT; i++) {
      this.stars.push({
        x: Phaser.Math.Between(0, 800),
        y: Phaser.Math.Between(0, 600),
        speed: Phaser.Math.FloatBetween(0.3, 1.5),
        size: Phaser.Math.FloatBetween(0.5, 2),
      })
    }
    this.starGraphics = this.add.graphics()

    this.ground = this.physics.add.image(400, 595, 'ground')
    this.ground.setImmovable(true)
    const groundBody = this.ground.body as Phaser.Physics.Arcade.Body
    groundBody.setAllowGravity(false)

    this.trailGraphics = this.add.graphics()

    this.bird = this.physics.add.sprite(150, 300, 'bird')
    this.bird.setCircle(12, 0, 0)
    const birdBody = this.bird.body as Phaser.Physics.Arcade.Body
    birdBody.setAllowGravity(false)
    birdBody.setCollideWorldBounds(true)

    this.pipes = this.physics.add.group()

    this.physics.add.overlap(
      this.bird,
      this.pipes,
      this.hitPipe as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this,
    )

    this.physics.add.overlap(
      this.bird,
      this.ground,
      this.hitPipe as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this,
    )

    this.scoreText = this.add
      .text(400, 40, '0', {
        fontSize: '52px',
        color: '#ffffff',
        fontStyle: 'bold',
        fontFamily: 'monospace',
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(20)

    this.instructionText = this.add
      .text(400, 400, 'Tap or press Space to flap', {
        fontSize: '22px',
        color: '#aaddff',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5)
      .setDepth(20)

    this.tweens.add({
      targets: this.instructionText,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
    })

    this.cursors = this.input.keyboard?.createCursorKeys()
    this.input.keyboard?.addKey('SPACE')

    this.input.on('pointerdown', () => this.flap())
  }

  private generateTextures() {
    if (!this.textures.exists('bird')) {
      const gfx = this.make.graphics({ x: 0, y: 0 })
      gfx.fillStyle(0x00ddff, 0.3)
      gfx.fillCircle(12, 12, 14)
      gfx.fillStyle(0x00ffff, 0.6)
      gfx.fillCircle(12, 12, 10)
      gfx.fillStyle(0x88ffff, 1)
      gfx.fillCircle(12, 12, 6)
      gfx.generateTexture('bird', 24, 24)
      gfx.destroy()
    }

    if (!this.textures.exists('pipe')) {
      const gfx = this.make.graphics({ x: 0, y: 0 })
      gfx.fillStyle(0xff00aa, 0.8)
      gfx.fillRect(0, 0, 64, 16)
      gfx.fillStyle(0xff44cc, 0.6)
      gfx.fillRect(4, 4, 56, 8)
      gfx.generateTexture('pipe', 64, 16)
      gfx.destroy()
    }

    if (!this.textures.exists('ground')) {
      const gfx = this.make.graphics({ x: 0, y: 0 })
      gfx.fillStyle(0x332244, 1)
      gfx.fillRect(0, 0, 800, 10)
      gfx.lineStyle(2, 0xff00aa, 0.6)
      gfx.lineBetween(0, 0, 800, 0)
      gfx.generateTexture('ground', 800, 10)
      gfx.destroy()
    }
  }

  private flap() {
    if (this.gameOver) return

    if (!this.started) {
      this.started = true
      const birdBody = this.bird!.body as Phaser.Physics.Arcade.Body
      birdBody.setAllowGravity(true)
      this.instructionText?.destroy()

      this.pipeTimer = this.time.addEvent({
        delay: PIPE_SPAWN_INTERVAL,
        callback: this.spawnPipe,
        callbackScope: this,
        loop: true,
      })

      this.time.delayedCall(300, () => this.spawnPipe(), [], this)
    }

    const birdBody = this.bird!.body as Phaser.Physics.Arcade.Body
    birdBody.setVelocityY(FLAP_VELOCITY)
  }

  private spawnPipe() {
    if (this.gameOver) return

    const gap = Math.max(MIN_GAP, INITIAL_GAP - this.score * 2)
    const minY = 80
    const maxY = 520 - gap
    const gapY = Phaser.Math.Between(minY, maxY)

    const pipeId = `pipe_${this.pipeIdCounter++}`

    const pipeWidth = 64
    const topPipeHeight = gapY
    const bottomPipeHeight = 600 - gapY - gap

    const topPipe = this.createPipeSegment(820, topPipeHeight / 2, pipeWidth, topPipeHeight)
    topPipe.setData('pipeId', pipeId)
    topPipe.setData('scored', false)

    this.createPipeSegment(820, gapY + gap + bottomPipeHeight / 2, pipeWidth, bottomPipeHeight)
  }

  private createPipeSegment(
    x: number,
    y: number,
    width: number,
    height: number,
  ): Phaser.GameObjects.Rectangle {
    const pipe = this.add.rectangle(x, y, width, height)
    this.pipes!.add(pipe)
    this.physics.add.existing(pipe, false)

    const body = pipe.body as Phaser.Physics.Arcade.Body
    body.setVelocityX(PIPE_VELOCITY)
    body.setAllowGravity(false)
    body.setImmovable(true)

    const graphics = this.add.graphics()
    graphics.fillStyle(0xff00aa, 0.15)
    graphics.fillRect(-width / 2 - 6, -height / 2 - 4, width + 12, height + 8)
    graphics.fillStyle(0xff00aa, 0.4)
    graphics.fillRect(-width / 2 - 2, -height / 2 - 1, width + 4, height + 2)
    graphics.fillStyle(0xff44cc, 0.7)
    graphics.fillRect(-width / 2, -height / 2, width, height)

    graphics.lineStyle(2, 0xff88dd, 0.9)
    graphics.strokeRect(-width / 2, -height / 2, width, height)

    graphics.fillStyle(0xffaaee, 0.4)
    graphics.fillRect(-width / 2 + 4, -height / 2 + 2, 6, height - 4)

    graphics.setPosition(x, y)
    graphics.setData('linkedPipe', true)
    pipe.setData('graphics', graphics)

    return pipe
  }

  private hitPipe() {
    if (this.gameOver) return
    this.triggerGameOver()
  }

  private triggerGameOver() {
    if (this.gameOver) return
    this.gameOver = true

    this.pipeTimer?.destroy()
    this.physics.pause()

    this.add
      .text(400, 230, 'Game Over', {
        fontSize: '48px',
        color: '#ff4444',
        fontStyle: 'bold',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5)
      .setDepth(20)

    this.add
      .text(400, 290, `Score: ${this.score}`, {
        fontSize: '32px',
        color: '#ffffff',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5)
      .setDepth(20)

    this.add
      .text(400, 350, 'Click to Restart', {
        fontSize: '24px',
        color: '#aaaaaa',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5)
      .setDepth(20)

    this.input.removeAllListeners()
    this.input.once('pointerdown', () => {
      this.scene.restart()
    })
  }

  update() {
    this.drawStars()

    if (this.gameOver) return

    if (
      this.cursors?.up.isDown ||
      this.input.keyboard?.addKey('SPACE').isDown
    ) {
      if (
        this.cursors?.up.getDuration() !== undefined &&
        this.cursors.up.getDuration() < 50
      ) {
        this.flap()
      }
    }

    if (this.bird && this.bird.y < 0) {
      this.triggerGameOver()
      return
    }

    if (this.bird && this.started) {
      this.trailPositions.unshift({ x: this.bird.x, y: this.bird.y })
      if (this.trailPositions.length > TRAIL_LENGTH) {
        this.trailPositions.pop()
      }
    }

    this.drawTrail()

    if (this.bird) {
      const birdBody = this.bird.body as Phaser.Physics.Arcade.Body
      const rotation = Phaser.Math.Clamp(birdBody.velocity.y / 600, -0.5, 0.5)
      this.bird.setRotation(rotation)
    }

    this.pipes?.getChildren().forEach((child) => {
      const pipe = child as Phaser.GameObjects.Rectangle
      const body = pipe.body as Phaser.Physics.Arcade.Body
      const graphics = pipe.getData('graphics') as Phaser.GameObjects.Graphics | undefined

      if (graphics) {
        graphics.setPosition(pipe.x, pipe.y)
      }

      if (pipe.x < -80) {
        if (graphics) graphics.destroy()
        pipe.destroy()
        return
      }

      const pipeId = pipe.getData('pipeId') as string | undefined
      if (
        pipeId &&
        !pipe.getData('scored') &&
        this.bird &&
        pipe.x + 32 < this.bird.x
      ) {
        pipe.setData('scored', true)
        if (!this.passedPipes.has(pipeId)) {
          this.passedPipes.add(pipeId)
          this.score++
          this.scoreText?.setText(`${this.score}`)
        }
      }
    })
  }

  private drawStars() {
    if (!this.starGraphics) return
    this.starGraphics.clear()

    for (const star of this.stars) {
      if (this.started && !this.gameOver) {
        star.x -= star.speed
        if (star.x < 0) {
          star.x = 800
          star.y = Phaser.Math.Between(0, 600)
        }
      }

      const flicker = 0.4 + Math.random() * 0.6
      this.starGraphics.fillStyle(0xffffff, flicker * 0.6)
      this.starGraphics.fillCircle(star.x, star.y, star.size)
    }
  }

  private drawTrail() {
    if (!this.trailGraphics) return
    this.trailGraphics.clear()

    for (let i = 0; i < this.trailPositions.length; i++) {
      const pos = this.trailPositions[i]
      const alpha = (1 - i / TRAIL_LENGTH) * 0.4
      const size = (1 - i / TRAIL_LENGTH) * 10

      this.trailGraphics.fillStyle(0x00ddff, alpha)
      this.trailGraphics.fillCircle(pos.x, pos.y, size)
    }
  }
}

export default {
  metadata: {
    slug: 'flappy-bird',
    title: 'Neon Flap',
    description:
      'Flap through neon pipes! Tap or press space to fly. How far can you go?',
    thumbnailUrl: '/games/flappy-bird/thumbnail.png',
    category: 'Casual',
    tags: ['flappy', 'casual', 'one-button', 'endless'],
    developerName: 'Game Portal Team',
    packageName: 'flappy-bird',
    version: '1.0.0',
  },
  createGame: (containerId: string) => {
    return new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerId,
      width: 800,
      height: 600,
      backgroundColor: '#0a0a1e',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: GRAVITY },
          debug: false,
        },
      },
      scene: [FlappyScene],
    })
  },
}
