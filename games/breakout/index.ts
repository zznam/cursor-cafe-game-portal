import * as Phaser from 'phaser'

class BreakoutScene extends Phaser.Scene {
  private paddle?: Phaser.GameObjects.Rectangle
  private ball?: Phaser.Physics.Arcade.Image
  private bricks?: Phaser.Physics.Arcade.StaticGroup
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys
  private score = 0
  private scoreText?: Phaser.GameObjects.Text

  constructor() {
    super({ key: 'BreakoutScene' })
  }

  preload() {
    this.load.setBaseURL('https://labs.phaser.io')
    this.load.image('ball', 'assets/sprites/ball.png')
  }

  create() {
    this.score = 0
    
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      color: '#fff'
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

    this.bricks = this.physics.add.staticGroup()
    
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 10; col++) {
        const colors = [0xff0000, 0xff6600, 0xffff00, 0x00ff00, 0x0000ff]
        const brick = this.add.rectangle(
          80 + col * 72,
          100 + row * 32,
          64,
          24,
          colors[row]
        )
        this.bricks.add(brick)
      }
    }

    this.physics.add.collider(
      this.ball,
      this.paddle,
      undefined,
      undefined,
      this
    )

    this.physics.add.collider(
      this.ball,
      this.bricks,
      this.hitBrick as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    )

    this.cursors = this.input.keyboard?.createCursorKeys()

    this.physics.world.on('worldbounds', (body: Phaser.Physics.Arcade.Body) => {
      if (body.gameObject === this.ball && body.blocked.down) {
        this.scene.restart()
      }
    })
  }

  hitBrick(
    ball: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    brick: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ) {
    brick.destroy()
    this.score += 10
    this.scoreText?.setText(`Score: ${this.score}`)

    if (this.bricks?.countActive() === 0) {
      this.add.text(400, 300, 'You Win!', {
        fontSize: '48px',
        color: '#fff'
      }).setOrigin(0.5)
      this.ball?.setVelocity(0, 0)
    }
  }

  update() {
    if (!this.paddle || !this.cursors) return

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
    description: 'Classic brick-breaking arcade game. Use arrow keys to move the paddle and break all the bricks!',
    thumbnailUrl: '/games/breakout/thumbnail.png',
    category: 'Arcade',
    tags: ['classic', 'arcade', 'retro'],
    developerName: 'Game Portal Team',
    packageName: 'breakout',
    version: '1.0.0'
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
          debug: false
        }
      },
      scene: [BreakoutScene]
    })
  }
}
