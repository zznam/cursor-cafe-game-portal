import * as Phaser from 'phaser'

class AsteroidSweeperScene extends Phaser.Scene {
  private player?: Phaser.Physics.Arcade.Image
  private bullets?: Phaser.Physics.Arcade.Group
  private asteroids?: Phaser.Physics.Arcade.Group
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys
  private score = 0
  private scoreText?: Phaser.GameObjects.Text
  private gameOver = false
  private lastFired = 0
  private spawnTimer?: Phaser.Time.TimerEvent
  private stars: Phaser.GameObjects.Rectangle[] = []

  constructor() {
    super({ key: 'AsteroidSweeperScene' })
  }

  create() {
    this.score = 0
    this.gameOver = false
    this.stars = []

    for (let i = 0; i < 60; i++) {
      const s = this.add.rectangle(
        Phaser.Math.Between(0, 800), Phaser.Math.Between(0, 600),
        Phaser.Math.Between(1, 2), Phaser.Math.Between(1, 2),
        0xffffff, Phaser.Math.FloatBetween(0.2, 0.6)
      )
      s.setData('speed', Phaser.Math.Between(10, 40))
      this.stars.push(s)
    }

    this.createTextures()

    this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '22px', color: '#0ff', fontFamily: 'monospace' })

    this.player = this.physics.add.image(400, 500, 'ship')
    const pb = this.player.body as Phaser.Physics.Arcade.Body
    pb.setCollideWorldBounds(true)

    this.bullets = this.physics.add.group()
    this.asteroids = this.physics.add.group()

    this.spawnTimer = this.time.addEvent({
      delay: 800,
      callback: this.spawnAsteroid,
      callbackScope: this,
      loop: true,
    })

    this.physics.add.overlap(this.bullets, this.asteroids, this.hitAsteroid as any, undefined, this)
    this.physics.add.overlap(this.player, this.asteroids, this.hitPlayer as any, undefined, this)

    this.cursors = this.input.keyboard?.createCursorKeys()
  }

  private createTextures() {
    if (this.textures.exists('ship')) return

    const sg = this.make.graphics({ x: 0, y: 0 })
    sg.fillStyle(0x00ddff, 1)
    sg.fillTriangle(16, 0, 0, 32, 32, 32)
    sg.fillStyle(0x0088cc, 1)
    sg.fillRect(12, 28, 8, 8)
    sg.generateTexture('ship', 32, 36)
    sg.destroy()

    const ag = this.make.graphics({ x: 0, y: 0 })
    ag.fillStyle(0x888888, 1)
    ag.fillCircle(16, 16, 16)
    ag.fillStyle(0x666666, 1)
    ag.fillCircle(10, 10, 5)
    ag.fillCircle(22, 18, 4)
    ag.generateTexture('asteroid', 32, 32)
    ag.destroy()

    const bg = this.make.graphics({ x: 0, y: 0 })
    bg.fillStyle(0x00ffff, 1)
    bg.fillRect(0, 0, 4, 10)
    bg.generateTexture('bullet', 4, 10)
    bg.destroy()
  }

  spawnAsteroid() {
    if (this.gameOver) return
    const x = Phaser.Math.Between(20, 780)
    const a = this.physics.add.image(x, -20, 'asteroid')
    const scale = Phaser.Math.FloatBetween(0.6, 1.5)
    a.setScale(scale)
    this.asteroids?.add(a)
    const ab = a.body as Phaser.Physics.Arcade.Body
    ab.setVelocityY(Phaser.Math.Between(80, 200))
    ab.setVelocityX(Phaser.Math.Between(-30, 30))
    ab.setAngularVelocity(Phaser.Math.Between(-100, 100))
  }

  hitAsteroid(bullet: any, asteroid: any) {
    bullet.destroy()
    asteroid.destroy()
    this.score += 10
    this.scoreText?.setText(`Score: ${this.score}`)
  }

  hitPlayer() {
    if (this.gameOver) return
    this.gameOver = true
    this.spawnTimer?.remove()
    this.physics.pause()
    this.player?.setVisible(false)

    this.add.text(400, 250, 'Game Over!', { fontSize: '48px', color: '#ff4444', fontStyle: 'bold' }).setOrigin(0.5)
    this.add.text(400, 310, `Score: ${this.score}`, { fontSize: '32px', color: '#fff' }).setOrigin(0.5)
    this.add.text(400, 370, 'Click to Restart', { fontSize: '20px', color: '#aaa' }).setOrigin(0.5)
    this.input.once('pointerdown', () => this.scene.restart())
  }

  update(time: number) {
    for (const s of this.stars) {
      s.y += (s.getData('speed') as number) * 0.016
      if (s.y > 610) { s.y = -2; s.x = Phaser.Math.Between(0, 800) }
    }

    if (this.gameOver || !this.player || !this.cursors) return

    const pb = this.player.body as Phaser.Physics.Arcade.Body
    pb.setVelocityX(this.cursors.left.isDown ? -300 : this.cursors.right.isDown ? 300 : 0)
    pb.setVelocityY(this.cursors.up.isDown ? -300 : this.cursors.down.isDown ? 300 : 0)

    if (this.cursors.space.isDown && time > this.lastFired + 180) {
      const b = this.physics.add.image(this.player.x, this.player.y - 20, 'bullet')
      this.bullets?.add(b)
        ; (b.body as Phaser.Physics.Arcade.Body).setVelocityY(-450)
      this.lastFired = time
    }

    this.bullets?.children.entries.forEach(b => { if ((b as any).y < -10) b.destroy() })
    this.asteroids?.children.entries.forEach(a => { if ((a as any).y > 620) a.destroy() })
  }
}

export default {
  metadata: {
    slug: 'asteroid-sweeper',
    title: 'Asteroid Sweeper',
    description: 'Top-down shooter where players clear asteroid fields without getting hit by debris.',
    thumbnailUrl: '/games/asteroid-sweeper/thumbnail.png',
    category: 'Action',
    tags: ['arcade', 'space'],
    developerName: 'Game Portal Team',
    packageName: 'asteroid-sweeper',
    version: '1.0.0',
  },
  createGame: (containerId: string) => {
    return new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerId,
      width: 800,
      height: 600,
      backgroundColor: '#050510',
      physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 0 }, debug: false } },
      scene: [AsteroidSweeperScene],
    })
  },
}
