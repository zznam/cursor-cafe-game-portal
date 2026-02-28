import * as Phaser from 'phaser'

class PixelNinjaDashScene extends Phaser.Scene {
  private ninja?: Phaser.Physics.Arcade.Image
  private obstacles?: Phaser.Physics.Arcade.Group
  private shurikens?: Phaser.Physics.Arcade.Group
  private ground?: Phaser.GameObjects.Rectangle
  private score = 0
  private scoreText?: Phaser.GameObjects.Text
  private gameOver = false
  private speed = 300
  private spawnTimer?: Phaser.Time.TimerEvent
  private bgTiles: Phaser.GameObjects.Rectangle[] = []

  constructor() {
    super({ key: 'PixelNinjaDashScene' })
  }

  create() {
    this.score = 0
    this.gameOver = false
    this.speed = 300
    this.bgTiles = []

    this.createTextures()

    // scrolling bg tiles
    for (let i = 0; i < 20; i++) {
      const t = this.add.rectangle(i * 42, Phaser.Math.Between(100, 500), 2, 2, 0x222244)
      t.setData('speed', Phaser.Math.Between(50, 150))
      this.bgTiles.push(t)
    }

    this.ground = this.add.rectangle(400, 560, 800, 80, 0x222244)
    this.physics.add.existing(this.ground, true)

    this.ninja = this.physics.add.image(120, 500, 'ninja')
    const nb = this.ninja.body as Phaser.Physics.Arcade.Body
    nb.setCollideWorldBounds(true)
    nb.setBounceY(0)

    this.physics.add.collider(this.ninja, this.ground)

    this.obstacles = this.physics.add.group()
    this.shurikens = this.physics.add.group()

    this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '22px', color: '#0f0', fontFamily: 'monospace' })

    this.spawnTimer = this.time.addEvent({
      delay: 1200,
      callback: this.spawnObstacle,
      callbackScope: this,
      loop: true,
    })

    this.physics.add.overlap(this.ninja, this.obstacles, this.hitObstacle as any, undefined, this)
    this.physics.add.overlap(this.shurikens, this.obstacles, this.hitShurikenObstacle as any, undefined, this)

    this.input.on('pointerdown', () => {
      if (this.gameOver) return
      const nb2 = this.ninja?.body as Phaser.Physics.Arcade.Body
      if (nb2.blocked.down) nb2.setVelocityY(-450)
    })
    this.input.keyboard?.on('keydown-SPACE', () => {
      if (this.gameOver) return
      const nb2 = this.ninja?.body as Phaser.Physics.Arcade.Body
      if (nb2.blocked.down) nb2.setVelocityY(-450)
    })
    this.input.keyboard?.on('keydown-X', () => {
      if (this.gameOver) return
      this.throwShuriken()
    })

    // auto score
    this.time.addEvent({
      delay: 100,
      callback: () => {
        if (!this.gameOver) {
          this.score++
          this.scoreText?.setText(`Score: ${this.score}`)
        }
      },
      loop: true,
    })
  }

  private createTextures() {
    if (this.textures.exists('ninja')) return

    const ng = this.make.graphics({ x: 0, y: 0 })
    ng.fillStyle(0x222222, 1)
    ng.fillRect(4, 0, 22, 28)
    ng.fillStyle(0xff0000, 1)
    ng.fillRect(4, 6, 22, 4) // headband
    ng.fillStyle(0xffffff, 1)
    ng.fillCircle(12, 8, 2) // eye
    ng.fillCircle(20, 8, 2) // eye
    ng.generateTexture('ninja', 30, 30)
    ng.destroy()

    const sg = this.make.graphics({ x: 0, y: 0 })
    sg.fillStyle(0xcccccc, 1)
    sg.fillRect(2, 6, 12, 4)
    sg.fillRect(6, 2, 4, 12)
    sg.generateTexture('shuriken', 16, 16)
    sg.destroy()

    const og = this.make.graphics({ x: 0, y: 0 })
    og.fillStyle(0x884422, 1)
    og.fillRect(0, 0, 30, 50)
    og.fillStyle(0x663311, 1)
    og.fillRect(5, 0, 5, 50)
    og.generateTexture('obstacle', 30, 50)
    og.destroy()
  }

  throwShuriken() {
    if (!this.ninja) return
    const s = this.physics.add.image(this.ninja.x + 20, this.ninja.y, 'shuriken')
    this.shurikens?.add(s)
      ; (s.body as Phaser.Physics.Arcade.Body).setVelocityX(400)
      ; (s.body as Phaser.Physics.Arcade.Body).setAllowGravity(false)
      ; (s.body as Phaser.Physics.Arcade.Body).setAngularVelocity(500)
  }

  spawnObstacle() {
    if (this.gameOver) return
    const h = Phaser.Math.Between(30, 70)
    const o = this.physics.add.image(850, 520 - h / 2, 'obstacle')
    o.setDisplaySize(30, h)
    this.obstacles?.add(o)
      ; (o.body as Phaser.Physics.Arcade.Body).setVelocityX(-this.speed)
      ; (o.body as Phaser.Physics.Arcade.Body).setAllowGravity(false)
      ; (o.body as Phaser.Physics.Arcade.Body).setImmovable(true)

    this.speed = Math.min(this.speed + 2, 600)
  }

  hitObstacle() {
    if (this.gameOver) return
    this.gameOver = true
    this.physics.pause()
    this.spawnTimer?.remove()
    this.add.text(400, 250, 'Game Over!', { fontSize: '48px', color: '#ff4444', fontStyle: 'bold' }).setOrigin(0.5)
    this.add.text(400, 310, `Score: ${this.score}`, { fontSize: '32px', color: '#fff' }).setOrigin(0.5)
    this.add.text(400, 370, 'Click to Restart', { fontSize: '20px', color: '#aaa' }).setOrigin(0.5)
    this.input.once('pointerdown', () => this.scene.restart())
  }

  hitShurikenObstacle(shuriken: any, obstacle: any) {
    shuriken.destroy()
    obstacle.destroy()
    this.score += 50
    this.scoreText?.setText(`Score: ${this.score}`)
  }

  update() {
    if (this.gameOver) return
    for (const t of this.bgTiles) {
      t.x -= (t.getData('speed') as number) * 0.016
      if (t.x < -10) t.x = 810
    }
    this.obstacles?.children.entries.forEach(o => { if ((o as any).x < -50) o.destroy() })
    this.shurikens?.children.entries.forEach(s => { if ((s as any).x > 850) s.destroy() })
  }
}

export default {
  metadata: {
    slug: 'pixel-ninja-dash',
    title: 'Pixel Ninja Dash',
    description: 'Endless auto-runner. Tap/Space to jump, X to throw shurikens at obstacles!',
    thumbnailUrl: '/games/pixel-ninja-dash/thumbnail.png',
    category: 'Action',
    tags: ['runner', 'ninja'],
    developerName: 'Game Portal Team',
    packageName: 'pixel-ninja-dash',
    version: '1.0.0',
  },
  createGame: (containerId: string) => {
    return new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerId,
      width: 800,
      height: 600,
      backgroundColor: '#1a0a2e',
      physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 800 }, debug: false } },
      scene: [PixelNinjaDashScene],
    })
  },
}
