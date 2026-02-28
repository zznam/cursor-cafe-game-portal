import * as Phaser from 'phaser'

class NeonHoverboardScene extends Phaser.Scene {
  private player?: Phaser.Physics.Arcade.Image
  private rails?: Phaser.Physics.Arcade.Group
  private gaps?: Phaser.Physics.Arcade.Group
  private score = 0
  private scoreText?: Phaser.GameObjects.Text
  private gameOver = false
  private speed = 250
  private ground?: Phaser.GameObjects.Rectangle
  private bgLines: Phaser.GameObjects.Rectangle[] = []

  constructor() {
    super({ key: 'NeonHoverboardScene' })
  }

  create() {
    this.score = 0
    this.gameOver = false
    this.speed = 250
    this.bgLines = []

    this.createTextures()

    // neon bg lines
    for (let i = 0; i < 15; i++) {
      const l = this.add.rectangle(Phaser.Math.Between(0, 800), Phaser.Math.Between(0, 600), 2, Phaser.Math.Between(20, 80), 0x1a0a3e)
      l.setData('speed', Phaser.Math.Between(100, 300))
      this.bgLines.push(l)
    }

    this.ground = this.add.rectangle(400, 560, 800, 80, 0x1a1a3e)
    this.physics.add.existing(this.ground, true)

    this.player = this.physics.add.image(150, 500, 'hoverboard')
    const pb = this.player.body as Phaser.Physics.Arcade.Body
    pb.setCollideWorldBounds(true)

    this.physics.add.collider(this.player, this.ground)

    this.rails = this.physics.add.group()
    this.gaps = this.physics.add.group()

    this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '22px', color: '#0ff', fontFamily: 'monospace' })

    this.time.addEvent({
      delay: 1500,
      callback: this.spawnSection,
      callbackScope: this,
      loop: true,
    })

    this.physics.add.overlap(this.player, this.gaps, this.hitGap as any, undefined, this)
    this.physics.add.overlap(this.player, this.rails, this.grindRail as any, undefined, this)

    this.input.on('pointerdown', () => this.jump())
    this.input.keyboard?.on('keydown-SPACE', () => this.jump())

    this.time.addEvent({
      delay: 100,
      callback: () => { if (!this.gameOver) { this.score++; this.scoreText?.setText(`Score: ${this.score}`) } },
      loop: true,
    })
  }

  private createTextures() {
    if (this.textures.exists('hoverboard')) return
    const hg = this.make.graphics({ x: 0, y: 0 })
    hg.fillStyle(0x00ffcc, 1)
    hg.fillRoundedRect(0, 8, 40, 10, 4)
    hg.fillStyle(0xff00ff, 1)
    hg.fillCircle(20, 6, 8)
    hg.fillStyle(0xffffff, 1)
    hg.fillCircle(17, 4, 2)
    hg.fillCircle(23, 4, 2)
    // glow
    hg.fillStyle(0x00ffcc, 0.3)
    hg.fillRect(0, 18, 40, 4)
    hg.generateTexture('hoverboard', 40, 24)
    hg.destroy()
  }

  jump() {
    if (this.gameOver) { this.scene.restart(); return }
    const pb = this.player?.body as Phaser.Physics.Arcade.Body
    if (pb.blocked.down) pb.setVelocityY(-420)
  }

  spawnSection() {
    if (this.gameOver) return
    const type = Math.random()
    if (type < 0.4) {
      // rail (elevated platform)
      const y = Phaser.Math.Between(350, 480)
      const rail = this.add.rectangle(850, y, 120, 8, 0xff00ff)
      this.physics.add.existing(rail, false)
      this.rails?.add(rail)
        ; (rail.body as Phaser.Physics.Arcade.Body).setVelocityX(-this.speed)
        ; (rail.body as Phaser.Physics.Arcade.Body).setAllowGravity(false)
        ; (rail.body as Phaser.Physics.Arcade.Body).setImmovable(true)
    } else {
      // gap (danger zone on ground)
      const gap = this.add.rectangle(850, 530, 60, 40, 0xff0044, 0.6)
      this.physics.add.existing(gap, false)
      this.gaps?.add(gap)
        ; (gap.body as Phaser.Physics.Arcade.Body).setVelocityX(-this.speed)
        ; (gap.body as Phaser.Physics.Arcade.Body).setAllowGravity(false)
    }

    this.speed = Math.min(this.speed + 3, 500)
  }

  grindRail(_player: any, rail: any) {
    this.score += 5
    this.scoreText?.setText(`Score: ${this.score}`)
  }

  hitGap() {
    if (this.gameOver) return
    this.gameOver = true
    this.physics.pause()
    this.add.text(400, 250, 'Wipeout!', { fontSize: '48px', color: '#ff0066', fontStyle: 'bold' }).setOrigin(0.5)
    this.add.text(400, 310, `Score: ${this.score}`, { fontSize: '32px', color: '#fff' }).setOrigin(0.5)
    this.add.text(400, 370, 'Click to Restart', { fontSize: '20px', color: '#aaa' }).setOrigin(0.5)
  }

  update() {
    if (this.gameOver) return
    for (const l of this.bgLines) {
      l.x -= (l.getData('speed') as number) * 0.016
      if (l.x < -10) { l.x = 810; l.y = Phaser.Math.Between(0, 600) }
    }
    this.rails?.children.entries.forEach(r => { if ((r as any).x < -150) r.destroy() })
    this.gaps?.children.entries.forEach(g => { if ((g as any).x < -80) g.destroy() })
  }
}

export default {
  metadata: {
    slug: 'neon-hoverboard-rider',
    title: 'Neon Hoverboard Rider',
    description: 'Side-scrolling hoverboard game. Jump to avoid gaps and grind neon rails for bonus points!',
    thumbnailUrl: '/games/neon-hoverboard-rider/thumbnail.png',
    category: 'Racing',
    tags: ['side-scroller', 'racing'],
    developerName: 'Game Portal Team',
    packageName: 'neon-hoverboard-rider',
    version: '1.0.0',
  },
  createGame: (containerId: string) => {
    return new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerId,
      width: 800,
      height: 600,
      backgroundColor: '#0a0a2e',
      physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 800 }, debug: false } },
      scene: [NeonHoverboardScene],
    })
  },
}
