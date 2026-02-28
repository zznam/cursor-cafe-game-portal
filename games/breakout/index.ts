import * as Phaser from 'phaser'

class BreakoutScene extends Phaser.Scene {
  private paddle?: Phaser.GameObjects.Rectangle
  private ball?: Phaser.Physics.Arcade.Image
  private bricks?: Phaser.Physics.Arcade.StaticGroup
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys
  private score = 0
  private scoreText?: Phaser.GameObjects.Text
  private gameOver = false

  constructor() {
    super({ key: 'BreakoutScene' })
  }

  create() {
    this.score = 0
    this.gameOver = false

    const gfx = this.make.graphics({ x: 0, y: 0 })
    gfx.fillStyle(0xffffff, 1)
    gfx.fillCircle(8, 8, 8)
    gfx.generateTexture('ball', 16, 16)
    gfx.destroy()

    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      color: '#fff',
    })

    this.paddle = this.add.rectangle(400, 550, 120, 20, 0x6666ff)
    this.physics.add.existing(this.paddle, false)
    const paddleBody = this.paddle.body as Phaser.Physics.Arcade.Body
    paddleBody.setImmovable(true)
    paddleBody.setCollideWorldBounds(true)

    this.ball = this.physics.add.image(400, 500, 'ball')
    this.ball.setCollideWorldBounds(true)
    this.ball.setBounce(1, 1)
    this.ball.setVelocity(200, -200)

    const ballBody = this.ball.body as Phaser.Physics.Arcade.Body
    ballBody.onWorldBounds = true

    this.bricks = this.physics.add.staticGroup()

    const colors = [0xff0000, 0xff6600, 0xffff00, 0x00ff00, 0x0099ff]
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 10; col++) {
        const brick = this.add.rectangle(
          80 + col * 72,
          100 + row * 32,
          64,
          24,
          colors[row],
        )
        this.bricks.add(brick)
      }
    }

    this.physics.add.collider(this.ball, this.paddle, undefined, undefined, this)

    this.physics.add.collider(
      this.ball,
      this.bricks,
      this.hitBrick as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this,
    )

    this.cursors = this.input.keyboard?.createCursorKeys()

    this.physics.world.on('worldbounds', (_body: Phaser.Physics.Arcade.Body, _up: boolean, _down: boolean) => {
      if (_down && _body.gameObject === this.ball) {
        this.triggerGameOver()
      }
    })
  }

  private triggerGameOver() {
    if (this.gameOver) return
    this.gameOver = true
    this.ball?.setVelocity(0, 0)
    this.ball?.setVisible(false)
    this.physics.pause()

    this.add
      .text(400, 260, 'Game Over', {
        fontSize: '48px',
        color: '#ff4444',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    this.add
      .text(400, 320, `Score: ${this.score}`, {
        fontSize: '32px',
        color: '#ffffff',
      })
      .setOrigin(0.5)

    this.add
      .text(400, 380, 'Click to Restart', {
        fontSize: '24px',
        color: '#aaaaaa',
      })
      .setOrigin(0.5)

    this.input.once('pointerdown', () => {
      this.scene.restart()
    })
  }

  hitBrick(
    _ball: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    brick: Phaser.Types.Physics.Arcade.GameObjectWithBody,
  ) {
    brick.destroy()
    this.score += 10
    this.scoreText?.setText(`Score: ${this.score}`)

    if (this.bricks?.countActive() === 0) {
      this.ball?.setVelocity(0, 0)
      this.physics.pause()

      this.add
        .text(400, 260, 'You Win!', {
          fontSize: '48px',
          color: '#00ff88',
          fontStyle: 'bold',
        })
        .setOrigin(0.5)

      this.add
        .text(400, 320, `Score: ${this.score}`, {
          fontSize: '32px',
          color: '#ffffff',
        })
        .setOrigin(0.5)

      this.add
        .text(400, 380, 'Click to Restart', {
          fontSize: '24px',
          color: '#aaaaaa',
        })
        .setOrigin(0.5)

      this.input.once('pointerdown', () => {
        this.scene.restart()
      })
    }
  }

  update() {
    if (this.gameOver || !this.paddle || !this.cursors) return

    const paddleBody = this.paddle.body as Phaser.Physics.Arcade.Body

    if (this.cursors.left.isDown) {
      paddleBody.setVelocityX(-400)
    } else if (this.cursors.right.isDown) {
      paddleBody.setVelocityX(400)
    } else {
      paddleBody.setVelocityX(0)
    }
  }
}

export default {
  metadata: {
    slug: 'breakout',
    title: 'Breakout Classic',
    description:
      'Classic brick-breaking arcade game. Use arrow keys to move the paddle and break all the bricks!',
    thumbnailUrl: '/games/breakout/thumbnail.png',
    category: 'Arcade',
    tags: ['classic', 'arcade', 'retro'],
    developerName: 'Game Portal Team',
    packageName: 'breakout',
    version: '1.0.0',
  },
  createGame: (containerId: string) => {
    return new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerId,
      width: 800,
      height: 600,
      backgroundColor: '#1a1a2e',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
      scene: [BreakoutScene],
    })
  },
}
