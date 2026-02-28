import * as Phaser from 'phaser'

class SpaceShooterScene extends Phaser.Scene {
  private player?: Phaser.Physics.Arcade.Image
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys
  private bullets?: Phaser.Physics.Arcade.Group
  private enemies?: Phaser.Physics.Arcade.Group
  private score = 0
  private scoreText?: Phaser.GameObjects.Text
  private lastFired = 0
  private gameOver = false
  private spawnTimer?: Phaser.Time.TimerEvent
  private stars: Phaser.GameObjects.Rectangle[] = []

  constructor() {
    super({ key: 'SpaceShooterScene' })
  }

  create() {
    this.score = 0
    this.gameOver = false
    this.stars = []

    this.createStarfield()
    this.createTextures()

    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      color: '#fff',
    })

    this.player = this.physics.add.image(400, 540, 'ship')
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body
    playerBody.setCollideWorldBounds(true)

    this.bullets = this.physics.add.group()

    this.enemies = this.physics.add.group()

    this.spawnTimer = this.time.addEvent({
      delay: 1000,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true,
    })

    this.physics.add.overlap(
      this.bullets,
      this.enemies,
      this.hitEnemy as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this,
    )

    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.hitPlayer as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this,
    )

    this.cursors = this.input.keyboard?.createCursorKeys()
  }

  private createTextures() {
    if (this.textures.exists('ship')) return

    const shipGfx = this.make.graphics({ x: 0, y: 0 })
    shipGfx.fillStyle(0x00ff88, 1)
    shipGfx.fillTriangle(16, 0, 0, 32, 32, 32)
    shipGfx.fillStyle(0x00cc66, 1)
    shipGfx.fillRect(12, 28, 8, 8)
    shipGfx.generateTexture('ship', 32, 36)
    shipGfx.destroy()

    const enemyGfx = this.make.graphics({ x: 0, y: 0 })
    enemyGfx.fillStyle(0xff4444, 1)
    enemyGfx.fillTriangle(15, 30, 0, 0, 30, 0)
    enemyGfx.fillStyle(0xff6666, 1)
    enemyGfx.fillRect(10, 4, 10, 10)
    enemyGfx.generateTexture('enemy', 30, 30)
    enemyGfx.destroy()

    const bulletGfx = this.make.graphics({ x: 0, y: 0 })
    bulletGfx.fillStyle(0xffff00, 1)
    bulletGfx.fillRect(0, 0, 4, 12)
    bulletGfx.fillStyle(0xffffff, 1)
    bulletGfx.fillRect(1, 0, 2, 4)
    bulletGfx.generateTexture('bullet', 4, 12)
    bulletGfx.destroy()
  }

  private createStarfield() {
    for (let i = 0; i < 80; i++) {
      const x = Phaser.Math.Between(0, 800)
      const y = Phaser.Math.Between(0, 600)
      const size = Phaser.Math.Between(1, 3)
      const alpha = Phaser.Math.FloatBetween(0.2, 0.8)
      const star = this.add.rectangle(x, y, size, size, 0xffffff, alpha)
      star.setData('speed', Phaser.Math.Between(20, 60))
      this.stars.push(star)
    }
  }

  private scrollStars() {
    for (const star of this.stars) {
      star.y += (star.getData('speed') as number) * 0.016
      if (star.y > 610) {
        star.y = -2
        star.x = Phaser.Math.Between(0, 800)
      }
    }
  }

  spawnEnemy() {
    if (this.gameOver) return

    const x = Phaser.Math.Between(30, 770)
    const enemy = this.physics.add.image(x, -20, 'enemy')
    this.enemies?.add(enemy)
    const enemyBody = enemy.body as Phaser.Physics.Arcade.Body
    enemyBody.setVelocityY(Phaser.Math.Between(100, 220))
    enemyBody.setVelocityX(Phaser.Math.Between(-40, 40))
  }

  shootBullet() {
    if (!this.player || this.gameOver) return

    const bullet = this.physics.add.image(this.player.x, this.player.y - 20, 'bullet')
    this.bullets?.add(bullet)
    const bulletBody = bullet.body as Phaser.Physics.Arcade.Body
    bulletBody.setVelocityY(-400)
  }

  hitEnemy(
    bullet: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    enemy: Phaser.Types.Physics.Arcade.GameObjectWithBody,
  ) {
    const ex = (enemy as unknown as Phaser.GameObjects.Components.Transform).x
    const ey = (enemy as unknown as Phaser.GameObjects.Components.Transform).y

    bullet.destroy()
    enemy.destroy()
    this.score += 10
    this.scoreText?.setText(`Score: ${this.score}`)

    this.spawnExplosion(ex, ey)
  }

  private spawnExplosion(x: number, y: number) {
    const particles: Phaser.GameObjects.Rectangle[] = []
    for (let i = 0; i < 6; i++) {
      const p = this.add.rectangle(x, y, 4, 4, 0xff8800)
      const angle = (Math.PI * 2 * i) / 6
      const speed = Phaser.Math.Between(60, 120)
      const vx = Math.cos(angle) * speed
      const vy = Math.sin(angle) * speed
      p.setData('vx', vx)
      p.setData('vy', vy)
      particles.push(p)
    }
    this.time.delayedCall(300, () => {
      for (const p of particles) p.destroy()
    })
    this.time.addEvent({
      delay: 16,
      repeat: 18,
      callback: () => {
        for (const p of particles) {
          if (!p.active) continue
          p.x += (p.getData('vx') as number) * 0.016
          p.y += (p.getData('vy') as number) * 0.016
          p.alpha -= 0.05
        }
      },
    })
  }

  hitPlayer() {
    if (this.gameOver) return

    this.gameOver = true
    this.spawnTimer?.remove()
    this.physics.pause()
    this.player?.setVisible(false)

    if (this.player) {
      this.spawnExplosion(this.player.x, this.player.y)
    }

    this.add
      .text(400, 240, 'Game Over!', {
        fontSize: '48px',
        color: '#ff4444',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    this.add
      .text(400, 300, `Final Score: ${this.score}`, {
        fontSize: '32px',
        color: '#ffffff',
      })
      .setOrigin(0.5)

    this.add
      .text(400, 360, 'Click to Restart', {
        fontSize: '24px',
        color: '#aaaaaa',
      })
      .setOrigin(0.5)

    this.input.once('pointerdown', () => {
      this.scene.restart()
    })
  }

  update(time: number) {
    this.scrollStars()

    if (this.gameOver || !this.player || !this.cursors) return

    const playerBody = this.player.body as Phaser.Physics.Arcade.Body

    if (this.cursors.left.isDown) {
      playerBody.setVelocityX(-300)
    } else if (this.cursors.right.isDown) {
      playerBody.setVelocityX(300)
    } else {
      playerBody.setVelocityX(0)
    }

    if (this.cursors.space.isDown && time > this.lastFired + 200) {
      this.shootBullet()
      this.lastFired = time
    }

    this.bullets?.children.entries.forEach((bullet) => {
      if ((bullet as Phaser.GameObjects.Image).y < -10) {
        bullet.destroy()
      }
    })

    this.enemies?.children.entries.forEach((enemy) => {
      if ((enemy as Phaser.GameObjects.Image).y > 620) {
        enemy.destroy()
      }
    })
  }
}

export default {
  metadata: {
    slug: 'space-shooter',
    title: 'Space Shooter',
    description:
      'Defend Earth from alien invaders! Use arrow keys to move and spacebar to shoot.',
    thumbnailUrl: '/games/space-shooter/thumbnail.png',
    category: 'Shooter',
    tags: ['space', 'action', 'arcade'],
    developerName: 'Game Portal Team',
    packageName: 'space-shooter',
    version: '1.0.0',
  },
  createGame: (containerId: string) => {
    return new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerId,
      width: 800,
      height: 600,
      backgroundColor: '#000022',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
      scene: [SpaceShooterScene],
    })
  },
}
