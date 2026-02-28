import * as Phaser from 'phaser'

class GravityFlipScene extends Phaser.Scene {
  private player?: Phaser.Physics.Arcade.Image
  private platforms?: Phaser.Physics.Arcade.StaticGroup
  private spikes?: Phaser.Physics.Arcade.StaticGroup
  private coins?: Phaser.Physics.Arcade.StaticGroup
  private gravityUp = false
  private score = 0
  private level = 0
  private scoreText?: Phaser.GameObjects.Text
  private gameOver = false

  constructor() {
    super({ key: 'GravityFlipScene' })
  }

  create() {
    this.score = 0
    this.level = 0
    this.gravityUp = false
    this.gameOver = false

    this.createTextures()

    this.platforms = this.physics.add.staticGroup()
    this.spikes = this.physics.add.staticGroup()
    this.coins = this.physics.add.staticGroup()

    this.generateLevel()

    this.player = this.physics.add.image(60, 300, 'gfplayer')
    const pb = this.player.body as Phaser.Physics.Arcade.Body
    pb.setCollideWorldBounds(true)
    pb.setBounceY(0)

    this.physics.add.collider(this.player, this.platforms)
    this.physics.add.overlap(this.player, this.spikes, this.hitSpike as any, undefined, this)
    this.physics.add.overlap(this.player, this.coins, this.collectCoin as any, undefined, this)

    this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '22px', color: '#0ff', fontFamily: 'monospace' })

    this.input.on('pointerdown', () => this.flipGravity())
    this.input.keyboard?.on('keydown-SPACE', () => this.flipGravity())
  }

  private createTextures() {
    if (this.textures.exists('gfplayer')) return
    const pg = this.make.graphics({ x: 0, y: 0 })
    pg.fillStyle(0x00ffcc, 1)
    pg.fillRoundedRect(0, 0, 24, 24, 4)
    pg.generateTexture('gfplayer', 24, 24)
    pg.destroy()

    const sg = this.make.graphics({ x: 0, y: 0 })
    sg.fillStyle(0xff4444, 1)
    sg.fillTriangle(10, 0, 0, 20, 20, 20)
    sg.generateTexture('spike', 20, 20)
    sg.destroy()

    const cg = this.make.graphics({ x: 0, y: 0 })
    cg.fillStyle(0xffdd00, 1)
    cg.fillCircle(8, 8, 8)
    cg.fillStyle(0xffff88, 1)
    cg.fillCircle(6, 6, 3)
    cg.generateTexture('coin', 16, 16)
    cg.destroy()
  }

  flipGravity() {
    if (this.gameOver) { this.scene.restart(); return }
    this.gravityUp = !this.gravityUp
    this.physics.world.gravity.y = this.gravityUp ? -600 : 600
    if (this.player) this.player.setFlipY(this.gravityUp)
  }

  generateLevel() {
    this.platforms?.clear(true, true)
    this.spikes?.clear(true, true)
    this.coins?.clear(true, true)

    // floor and ceiling
    for (let x = 0; x < 800; x += 40) {
      const floor = this.add.rectangle(x + 20, 590, 40, 20, 0x334466)
      this.platforms?.add(floor)
      const ceil = this.add.rectangle(x + 20, 10, 40, 20, 0x334466)
      this.platforms?.add(ceil)
    }

    // random platforms
    for (let i = 0; i < 6 + this.level; i++) {
      const x = Phaser.Math.Between(150, 750)
      const y = Phaser.Math.Between(100, 500)
      const w = Phaser.Math.Between(60, 140)
      const p = this.add.rectangle(x, y, w, 14, 0x446688)
      this.platforms?.add(p)
    }

    // spikes
    for (let i = 0; i < 3 + this.level; i++) {
      const x = Phaser.Math.Between(200, 750)
      const y = Phaser.Math.Between(100, 500)
      const s = this.physics.add.image(x, y, 'spike')
      this.spikes?.add(s)
    }

    // coins
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(100, 750)
      const y = Phaser.Math.Between(80, 520)
      const c = this.physics.add.image(x, y, 'coin')
      this.coins?.add(c)
    }
  }

  collectCoin(_player: any, coin: any) {
    coin.destroy()
    this.score += 10
    this.scoreText?.setText(`Score: ${this.score}`)
    if (this.coins?.countActive() === 0) {
      this.level++
      this.generateLevel()
    }
  }

  hitSpike() {
    if (this.gameOver) return
    this.gameOver = true
    this.physics.pause()
    this.add.text(400, 260, 'Game Over!', { fontSize: '48px', color: '#ff4444', fontStyle: 'bold' }).setOrigin(0.5)
    this.add.text(400, 320, `Score: ${this.score}`, { fontSize: '32px', color: '#fff' }).setOrigin(0.5)
    this.add.text(400, 380, 'Click to Restart', { fontSize: '20px', color: '#aaa' }).setOrigin(0.5)
  }

  update() {
    if (this.gameOver || !this.player) return
    const cursors = this.input.keyboard?.createCursorKeys()
    const pb = this.player.body as Phaser.Physics.Arcade.Body
    if (cursors?.left.isDown) pb.setVelocityX(-200)
    else if (cursors?.right.isDown) pb.setVelocityX(200)
    else pb.setVelocityX(0)
  }
}

export default {
  metadata: {
    slug: 'gravity-flip-grappler',
    title: 'Gravity Flip Grappler',
    description: 'A platformer where you flip gravity! Click/Space to invert. Collect coins, avoid spikes.',
    thumbnailUrl: '/games/gravity-flip-grappler/thumbnail.png',
    category: 'Platformer',
    tags: ['physics', 'swinging'],
    developerName: 'Game Portal Team',
    packageName: 'gravity-flip-grappler',
    version: '1.0.0',
  },
  createGame: (containerId: string) => {
    return new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerId,
      width: 800,
      height: 600,
      backgroundColor: '#0d0d2b',
      physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 600 }, debug: false } },
      scene: [GravityFlipScene],
    })
  },
}
