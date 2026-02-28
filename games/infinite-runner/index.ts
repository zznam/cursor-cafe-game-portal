import * as Phaser from 'phaser'

let highScore = 0

class InfiniteRunnerScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Image
  private ground!: Phaser.GameObjects.TileSprite
  private groundBody!: Phaser.Physics.Arcade.StaticGroup
  private obstacles!: Phaser.Physics.Arcade.Group
  private coins!: Phaser.Physics.Arcade.Group
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private scoreText!: Phaser.GameObjects.Text
  private highScoreText!: Phaser.GameObjects.Text
  private bgFar!: Phaser.GameObjects.TileSprite
  private bgMid!: Phaser.GameObjects.TileSprite
  private groundLine!: Phaser.GameObjects.TileSprite
  private trailParticles!: Phaser.GameObjects.Particles.ParticleEmitter
  private coinParticles!: Phaser.GameObjects.Particles.ParticleEmitter

  private score = 0
  private gameOver = false
  private jumpCount = 0
  private maxJumps = 2
  private baseSpeed = 300
  private currentSpeed = 300
  private scoreTimer = 0
  private obstacleTimer = 0
  private coinTimer = 0
  private spawnInterval = 1500

  constructor() {
    super({ key: 'InfiniteRunnerScene' })
  }

  create() {
    this.score = 0
    this.gameOver = false
    this.jumpCount = 0
    this.currentSpeed = this.baseSpeed
    this.scoreTimer = 0
    this.obstacleTimer = 0
    this.coinTimer = 0
    this.spawnInterval = 1500

    this.generateTextures()

    this.bgFar = this.add.tileSprite(400, 200, 800, 400, 'bg_far').setScrollFactor(0)
    this.bgMid = this.add.tileSprite(400, 350, 800, 200, 'bg_mid').setScrollFactor(0)

    this.ground = this.add.tileSprite(400, 540, 800, 80, 'ground_tile').setScrollFactor(0)
    this.groundLine = this.add.tileSprite(400, 501, 800, 2, 'ground_line').setScrollFactor(0)

    this.groundBody = this.physics.add.staticGroup()
    const groundPlatform = this.add.rectangle(400, 530, 800, 60, 0x000000, 0)
    this.groundBody.add(groundPlatform)
    ;(groundPlatform.body as Phaser.Physics.Arcade.StaticBody).setSize(800, 60)
    ;(groundPlatform.body as Phaser.Physics.Arcade.StaticBody).setOffset(-400, -30)

    this.player = this.physics.add.image(150, 460, 'player')
    this.player.setCollideWorldBounds(true)
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body
    playerBody.setGravityY(800)
    playerBody.setSize(28, 48)
    playerBody.setOffset(6, 8)

    this.physics.add.collider(this.player, this.groundBody, () => {
      this.jumpCount = 0
    })

    this.obstacles = this.physics.add.group({ allowGravity: false })
    this.coins = this.physics.add.group({ allowGravity: false })

    this.physics.add.collider(
      this.player,
      this.obstacles,
      this.handleObstacleHit as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this,
    )

    this.physics.add.overlap(
      this.player,
      this.coins,
      this.handleCoinCollect as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this,
    )

    this.trailParticles = this.add.particles(0, 0, 'particle', {
      speed: { min: 20, max: 60 },
      angle: { min: 150, max: 210 },
      scale: { start: 0.6, end: 0 },
      lifespan: 400,
      frequency: 50,
      tint: 0x00ffff,
      blendMode: 'ADD',
      follow: this.player,
      followOffset: { x: -15, y: 10 },
    })

    this.coinParticles = this.add.particles(0, 0, 'particle', {
      speed: { min: 50, max: 150 },
      scale: { start: 0.5, end: 0 },
      lifespan: 500,
      tint: 0xffd700,
      blendMode: 'ADD',
      emitting: false,
    })

    this.scoreText = this.add
      .text(400, 20, 'Score: 0', {
        fontSize: '28px',
        color: '#00ffff',
        fontStyle: 'bold',
        shadow: { offsetX: 0, offsetY: 0, color: '#00ffff', blur: 10, fill: true, stroke: true },
      })
      .setOrigin(0.5, 0)

    this.highScoreText = this.add
      .text(780, 20, `Best: ${highScore}`, {
        fontSize: '20px',
        color: '#ff66ff',
        shadow: { offsetX: 0, offsetY: 0, color: '#ff66ff', blur: 8, fill: true, stroke: true },
      })
      .setOrigin(1, 0)

    this.cursors = this.input.keyboard!.createCursorKeys()

    this.input.keyboard!.on('keydown-SPACE', () => {
      this.tryJump()
    })
    this.input.keyboard!.on('keydown-UP', () => {
      this.tryJump()
    })
  }

  private generateTextures() {
    if (!this.textures.exists('player')) {
      const g = this.make.graphics({ x: 0, y: 0 })
      g.lineStyle(2, 0x00ffff, 1)
      g.strokeRect(6, 8, 28, 48)
      g.lineStyle(2, 0x00ffff, 1)
      g.strokeCircle(20, 16, 8)
      g.fillStyle(0x00ffff, 0.3)
      g.fillRect(8, 30, 24, 24)
      g.lineStyle(2, 0x00ffff, 1)
      g.beginPath()
      g.moveTo(8, 54)
      g.lineTo(8, 56)
      g.strokePath()
      g.beginPath()
      g.moveTo(32, 54)
      g.lineTo(32, 56)
      g.strokePath()
      g.fillStyle(0x00ffff, 1)
      g.fillRect(16, 14, 3, 3)
      g.fillRect(22, 14, 3, 3)
      g.generateTexture('player', 40, 60)
      g.destroy()
    }

    if (!this.textures.exists('obstacle_low')) {
      const g = this.make.graphics({ x: 0, y: 0 })
      g.lineStyle(2, 0xff4444, 1)
      g.strokeRect(1, 1, 38, 38)
      g.fillStyle(0xff4444, 0.25)
      g.fillRect(3, 3, 34, 34)
      g.lineStyle(1, 0xff6600, 0.6)
      g.strokeRect(8, 8, 24, 24)
      g.generateTexture('obstacle_low', 40, 40)
      g.destroy()
    }

    if (!this.textures.exists('obstacle_tall')) {
      const g = this.make.graphics({ x: 0, y: 0 })
      g.lineStyle(2, 0xff4444, 1)
      g.strokeRect(1, 1, 38, 78)
      g.fillStyle(0xff4444, 0.25)
      g.fillRect(3, 3, 34, 74)
      g.lineStyle(1, 0xff6600, 0.6)
      g.strokeRect(8, 8, 24, 64)
      g.lineStyle(1, 0xff6600, 0.4)
      g.beginPath()
      g.moveTo(20, 8)
      g.lineTo(20, 72)
      g.strokePath()
      g.generateTexture('obstacle_tall', 40, 80)
      g.destroy()
    }

    if (!this.textures.exists('obstacle_fly')) {
      const g = this.make.graphics({ x: 0, y: 0 })
      g.lineStyle(2, 0xff6600, 1)
      g.strokeRect(1, 1, 28, 28)
      g.fillStyle(0xff6600, 0.3)
      g.fillRect(3, 3, 24, 24)
      g.lineStyle(1, 0xffaa00, 0.7)
      g.beginPath()
      g.moveTo(5, 15)
      g.lineTo(25, 15)
      g.strokePath()
      g.beginPath()
      g.moveTo(15, 5)
      g.lineTo(15, 25)
      g.strokePath()
      g.generateTexture('obstacle_fly', 30, 30)
      g.destroy()
    }

    if (!this.textures.exists('coin')) {
      const g = this.make.graphics({ x: 0, y: 0 })
      g.lineStyle(2, 0xffd700, 1)
      g.strokeCircle(10, 10, 9)
      g.fillStyle(0xffd700, 0.35)
      g.fillCircle(10, 10, 7)
      g.fillStyle(0xffd700, 1)
      g.fillRect(8, 6, 4, 8)
      g.generateTexture('coin', 20, 20)
      g.destroy()
    }

    if (!this.textures.exists('particle')) {
      const g = this.make.graphics({ x: 0, y: 0 })
      g.fillStyle(0xffffff, 1)
      g.fillCircle(4, 4, 4)
      g.generateTexture('particle', 8, 8)
      g.destroy()
    }

    if (!this.textures.exists('ground_tile')) {
      const g = this.make.graphics({ x: 0, y: 0 })
      g.fillStyle(0x0d0d2b, 1)
      g.fillRect(0, 0, 64, 80)
      g.lineStyle(1, 0x1a1a4a, 0.5)
      for (let i = 0; i < 80; i += 16) {
        g.beginPath()
        g.moveTo(0, i)
        g.lineTo(64, i)
        g.strokePath()
      }
      for (let i = 0; i < 64; i += 16) {
        g.beginPath()
        g.moveTo(i, 0)
        g.lineTo(i, 80)
        g.strokePath()
      }
      g.generateTexture('ground_tile', 64, 80)
      g.destroy()
    }

    if (!this.textures.exists('ground_line')) {
      const g = this.make.graphics({ x: 0, y: 0 })
      g.fillStyle(0x00ffff, 1)
      g.fillRect(0, 0, 64, 2)
      g.generateTexture('ground_line', 64, 2)
      g.destroy()
    }

    if (!this.textures.exists('bg_far')) {
      const g = this.make.graphics({ x: 0, y: 0 })
      g.fillStyle(0x0a0a1a, 1)
      g.fillRect(0, 0, 800, 400)
      const buildingColors = [0x1a0033, 0x0d1a33, 0x1a1a00, 0x0d0d2b, 0x1a0d1a]
      const topColors = [0xff00ff, 0x00ffff, 0xff6600, 0x6600ff, 0x00ff66]
      for (let i = 0; i < 20; i++) {
        const bw = 20 + Math.floor(i * 7 % 30)
        const bh = 60 + Math.floor((i * 13 + 7) % 120)
        const bx = i * 40
        const by = 400 - bh
        g.fillStyle(buildingColors[i % buildingColors.length], 0.6)
        g.fillRect(bx, by, bw, bh)
        g.fillStyle(topColors[i % topColors.length], 0.8)
        g.fillRect(bx, by, bw, 3)
        g.fillStyle(topColors[i % topColors.length], 0.15)
        for (let wy = by + 10; wy < 400; wy += 15) {
          for (let wx = bx + 4; wx < bx + bw - 4; wx += 8) {
            g.fillRect(wx, wy, 3, 5)
          }
        }
      }
      g.generateTexture('bg_far', 800, 400)
      g.destroy()
    }

    if (!this.textures.exists('bg_mid')) {
      const g = this.make.graphics({ x: 0, y: 0 })
      const midColors = [0x1a0040, 0x0d2640, 0x1a0d33]
      const midTopColors = [0xff00ff, 0x00ffff, 0xff3300]
      for (let i = 0; i < 12; i++) {
        const bw = 30 + Math.floor((i * 11 + 3) % 40)
        const bh = 40 + Math.floor((i * 17 + 5) % 80)
        const bx = i * 67
        const by = 200 - bh
        g.fillStyle(midColors[i % midColors.length], 0.7)
        g.fillRect(bx, by, bw, bh)
        g.fillStyle(midTopColors[i % midTopColors.length], 0.9)
        g.fillRect(bx, by, bw, 2)
      }
      g.generateTexture('bg_mid', 800, 200)
      g.destroy()
    }
  }

  private tryJump() {
    if (this.gameOver) return
    if (this.jumpCount < this.maxJumps) {
      const body = this.player.body as Phaser.Physics.Arcade.Body
      body.setVelocityY(-450)
      this.jumpCount++
    }
  }

  private handleObstacleHit() {
    if (this.gameOver) return
    this.gameOver = true
    this.trailParticles.stop()
    this.physics.pause()

    if (this.score > highScore) {
      highScore = this.score
    }

    const deathEmitter = this.add.particles(this.player.x, this.player.y, 'particle', {
      speed: { min: 100, max: 300 },
      scale: { start: 0.8, end: 0 },
      lifespan: 800,
      quantity: 30,
      tint: [0x00ffff, 0xff00ff, 0xff4444],
      blendMode: 'ADD',
      emitting: false,
    })
    deathEmitter.explode(30)

    this.player.setVisible(false)

    this.time.delayedCall(400, () => {
      this.add
        .text(400, 200, 'GAME OVER', {
          fontSize: '52px',
          color: '#ff4444',
          fontStyle: 'bold',
          shadow: { offsetX: 0, offsetY: 0, color: '#ff0000', blur: 20, fill: true, stroke: true },
        })
        .setOrigin(0.5)

      this.add
        .text(400, 270, `Score: ${this.score}`, {
          fontSize: '32px',
          color: '#00ffff',
          shadow: { offsetX: 0, offsetY: 0, color: '#00ffff', blur: 10, fill: true, stroke: true },
        })
        .setOrigin(0.5)

      this.add
        .text(400, 320, `Best: ${highScore}`, {
          fontSize: '24px',
          color: '#ff66ff',
          shadow: { offsetX: 0, offsetY: 0, color: '#ff66ff', blur: 8, fill: true, stroke: true },
        })
        .setOrigin(0.5)

      this.add
        .text(400, 390, 'Click to Restart', {
          fontSize: '24px',
          color: '#aaaaaa',
        })
        .setOrigin(0.5)

      this.input.once('pointerdown', () => {
        this.scene.restart()
      })
    })
  }

  private handleCoinCollect(
    _player: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    coin: Phaser.Types.Physics.Arcade.GameObjectWithBody,
  ) {
    const coinObj = coin as unknown as Phaser.Physics.Arcade.Image
    this.coinParticles.emitParticleAt(coinObj.x, coinObj.y, 8)
    coinObj.destroy()
    this.score += 10
    this.scoreText.setText(`Score: ${this.score}`)
  }

  private spawnObstacle() {
    const type = Phaser.Math.Between(0, 2)
    let obstacle: Phaser.Physics.Arcade.Image

    if (type === 0) {
      obstacle = this.obstacles.create(850, 480, 'obstacle_low') as Phaser.Physics.Arcade.Image
    } else if (type === 1) {
      obstacle = this.obstacles.create(850, 460, 'obstacle_tall') as Phaser.Physics.Arcade.Image
    } else {
      obstacle = this.obstacles.create(850, 420, 'obstacle_fly') as Phaser.Physics.Arcade.Image
    }

    const body = obstacle.body as Phaser.Physics.Arcade.Body
    body.setAllowGravity(false)
    body.setVelocityX(-this.currentSpeed)
    body.setImmovable(true)
  }

  private spawnCoin() {
    const yPos = Phaser.Math.Between(350, 480)
    const coin = this.coins.create(850, yPos, 'coin') as Phaser.Physics.Arcade.Image
    const body = coin.body as Phaser.Physics.Arcade.Body
    body.setAllowGravity(false)
    body.setVelocityX(-this.currentSpeed)
  }

  private cleanupOffscreen() {
    this.obstacles.getChildren().forEach((child) => {
      const obj = child as Phaser.Physics.Arcade.Image
      if (obj.x < -60) {
        obj.destroy()
      }
    })
    this.coins.getChildren().forEach((child) => {
      const obj = child as Phaser.Physics.Arcade.Image
      if (obj.x < -30) {
        obj.destroy()
      }
    })
  }

  update(_time: number, delta: number) {
    if (this.gameOver) return

    this.scoreTimer += delta
    if (this.scoreTimer >= 100) {
      this.score += 1
      this.scoreTimer -= 100
      this.scoreText.setText(`Score: ${this.score}`)
    }

    this.currentSpeed = Math.min(
      600,
      this.baseSpeed + Math.floor(this.score / 500) * 10,
    )

    this.spawnInterval = Math.max(600, 1500 - Math.floor(this.score / 200) * 50)

    const scrollAmount = (this.currentSpeed * delta) / 1000

    this.bgFar.tilePositionX += scrollAmount * 0.5
    this.bgMid.tilePositionX += scrollAmount * 0.75
    this.ground.tilePositionX += scrollAmount
    this.groundLine.tilePositionX += scrollAmount

    this.obstacleTimer += delta
    if (this.obstacleTimer >= this.spawnInterval) {
      this.spawnObstacle()
      this.obstacleTimer = 0
    }

    this.coinTimer += delta
    if (this.coinTimer >= this.spawnInterval * 1.5) {
      this.spawnCoin()
      this.coinTimer = 0
    }

    this.obstacles.getChildren().forEach((child) => {
      const body = (child as Phaser.Physics.Arcade.Image).body as Phaser.Physics.Arcade.Body
      body.setVelocityX(-this.currentSpeed)
    })
    this.coins.getChildren().forEach((child) => {
      const body = (child as Phaser.Physics.Arcade.Image).body as Phaser.Physics.Arcade.Body
      body.setVelocityX(-this.currentSpeed)
    })

    this.cleanupOffscreen()

    const playerBody = this.player.body as Phaser.Physics.Arcade.Body
    if (playerBody.blocked.down || playerBody.touching.down) {
      this.jumpCount = 0
    }
  }
}

export default {
  metadata: {
    slug: 'infinite-runner',
    title: 'Neon Run',
    description:
      'Run, jump, and dodge through a neon city! Collect coins and survive as long as you can.',
    thumbnailUrl: '/games/infinite-runner/thumbnail.png',
    category: 'Platformer',
    tags: ['runner', 'platformer', 'endless', 'action'],
    developerName: 'Game Portal Team',
    packageName: 'infinite-runner',
    version: '1.0.0',
  },
  createGame: (containerId: string) => {
    return new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerId,
      width: 800,
      height: 600,
      backgroundColor: '#0a0a1a',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
      scene: [InfiniteRunnerScene],
    })
  },
}
