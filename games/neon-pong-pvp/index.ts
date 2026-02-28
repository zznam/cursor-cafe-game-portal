import * as Phaser from 'phaser'

class NeonPongScene extends Phaser.Scene {
  private paddleLeft?: Phaser.GameObjects.Rectangle
  private paddleRight?: Phaser.GameObjects.Rectangle
  private ball?: Phaser.Physics.Arcade.Image
  private scoreLeft = 0
  private scoreRight = 0
  private scoreText?: Phaser.GameObjects.Text
  private gameOver = false
  private keysW?: Phaser.Input.Keyboard.Key
  private keysS?: Phaser.Input.Keyboard.Key
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys

  constructor() {
    super({ key: 'NeonPongScene' })
  }

  create() {
    this.scoreLeft = 0
    this.scoreRight = 0
    this.gameOver = false

    // center line
    const gfx = this.add.graphics()
    gfx.lineStyle(2, 0x333366)
    for (let y = 0; y < 600; y += 20) {
      gfx.moveTo(400, y)
      gfx.lineTo(400, y + 10)
    }
    gfx.strokePath()

    this.createTextures()

    this.paddleLeft = this.add.rectangle(30, 300, 14, 90, 0x00ffff)
    this.physics.add.existing(this.paddleLeft, false)
      ; (this.paddleLeft.body as Phaser.Physics.Arcade.Body).setImmovable(true)
      ; (this.paddleLeft.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true)

    this.paddleRight = this.add.rectangle(770, 300, 14, 90, 0xff00ff)
    this.physics.add.existing(this.paddleRight, false)
      ; (this.paddleRight.body as Phaser.Physics.Arcade.Body).setImmovable(true)
      ; (this.paddleRight.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true)

    this.ball = this.physics.add.image(400, 300, 'pongball')
    this.ball.setCollideWorldBounds(true)
    this.ball.setBounce(1, 1)
      ; (this.ball.body as Phaser.Physics.Arcade.Body).onWorldBounds = true

    this.scoreText = this.add.text(400, 40, '0 - 0', {
      fontSize: '36px', color: '#fff', fontFamily: 'monospace',
    }).setOrigin(0.5)

    this.physics.add.collider(this.ball, this.paddleLeft, this.hitPaddle as any, undefined, this)
    this.physics.add.collider(this.ball, this.paddleRight, this.hitPaddle as any, undefined, this)

    this.physics.world.on('worldbounds', (_body: Phaser.Physics.Arcade.Body, _up: boolean, _down: boolean, left: boolean, right: boolean) => {
      if (left) { this.scoreRight++; this.resetBall(-1) }
      if (right) { this.scoreLeft++; this.resetBall(1) }
      this.scoreText?.setText(`${this.scoreLeft} - ${this.scoreRight}`)
      if (this.scoreLeft >= 7 || this.scoreRight >= 7) this.endGame()
    })

    this.keysW = this.input.keyboard?.addKey('W')
    this.keysS = this.input.keyboard?.addKey('S')
    this.cursors = this.input.keyboard?.createCursorKeys()

    this.resetBall(1)
  }

  private createTextures() {
    if (this.textures.exists('pongball')) return
    const bg = this.make.graphics({ x: 0, y: 0 })
    bg.fillStyle(0xffffff, 1)
    bg.fillCircle(8, 8, 8)
    bg.generateTexture('pongball', 16, 16)
    bg.destroy()
  }

  resetBall(dir: number) {
    this.ball?.setPosition(400, 300)
    this.ball?.setVelocity(250 * dir, Phaser.Math.Between(-150, 150))
  }

  hitPaddle(ball: any, paddle: any) {
    const diff = ball.y - paddle.y
    ball.body.setVelocityY(diff * 5)
    const vx = ball.body.velocity.x
    ball.body.setVelocityX(vx > 0 ? Math.min(vx + 20, 500) : Math.max(vx - 20, -500))
  }

  endGame() {
    if (this.gameOver) return
    this.gameOver = true
    this.physics.pause()
    const winner = this.scoreLeft >= 7 ? 'Player 1' : 'Player 2'
    this.add.text(400, 260, `${winner} Wins!`, { fontSize: '48px', color: '#0ff', fontStyle: 'bold' }).setOrigin(0.5)
    this.add.text(400, 330, 'Click to Restart', { fontSize: '20px', color: '#aaa' }).setOrigin(0.5)
    this.input.once('pointerdown', () => this.scene.restart())
  }

  update() {
    if (this.gameOver) return
    const plb = this.paddleLeft?.body as Phaser.Physics.Arcade.Body
    const prb = this.paddleRight?.body as Phaser.Physics.Arcade.Body
    if (this.keysW?.isDown) plb.setVelocityY(-350)
    else if (this.keysS?.isDown) plb.setVelocityY(350)
    else plb.setVelocityY(0)
    if (this.cursors?.up.isDown) prb.setVelocityY(-350)
    else if (this.cursors?.down.isDown) prb.setVelocityY(350)
    else prb.setVelocityY(0)
  }
}

export default {
  metadata: {
    slug: 'neon-pong-pvp',
    title: 'Neon Pong PvP',
    description: 'A competitive pong game. P1: W/S, P2: Up/Down. First to 7 wins!',
    thumbnailUrl: '/games/neon-pong-pvp/thumbnail.png',
    category: 'Sports',
    tags: ['arcade', 'pong'],
    developerName: 'Game Portal Team',
    packageName: 'neon-pong-pvp',
    version: '1.0.0',
  },
  createGame: (containerId: string) => {
    return new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerId,
      width: 800,
      height: 600,
      backgroundColor: '#0a0a2e',
      physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 0 }, debug: false } },
      scene: [NeonPongScene],
    })
  },
}
