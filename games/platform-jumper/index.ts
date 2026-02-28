import * as Phaser from 'phaser'

class PlatformJumperScene extends Phaser.Scene {
  private player?: Phaser.Physics.Arcade.Image
  private platforms?: Phaser.Physics.Arcade.Group
  private score = 0
  private scoreText?: Phaser.GameObjects.Text
  private gameOver = false
  private highestY = 600
  private cameraY = 0

  constructor() {
    super({ key: 'PlatformJumperScene' })
  }

  create() {
    this.score = 0
    this.gameOver = false
    this.highestY = 600
    this.cameraY = 0

    this.createTextures()

    this.platforms = this.physics.add.group()

    // starting platform
    const startPlat = this.physics.add.image(400, 580, 'plat')
    startPlat.setScale(2, 1)
    this.platforms.add(startPlat)
      ; (startPlat.body as Phaser.Physics.Arcade.Body).setImmovable(true)
      ; (startPlat.body as Phaser.Physics.Arcade.Body).setAllowGravity(false)

    for (let i = 0; i < 8; i++) {
      this.spawnPlatform(Phaser.Math.Between(50, 750), 500 - i * 70)
    }

    this.player = this.physics.add.image(400, 520, 'jumper')
    const pb = this.player.body as Phaser.Physics.Arcade.Body
    pb.setCollideWorldBounds(false)
    pb.setBounceY(0)

    this.physics.add.collider(this.player, this.platforms, this.onLand as any, (_p, plat) => {
      const playerBody = this.player?.body as Phaser.Physics.Arcade.Body
      return playerBody.velocity.y > 0 && playerBody.y + playerBody.height - 10 < (plat as any).y
    }, this)

    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '22px', color: '#0f0', fontFamily: 'monospace',
    }).setScrollFactor(0)

      // initial jump
      ; (this.player.body as Phaser.Physics.Arcade.Body).setVelocityY(-500)
  }

  private createTextures() {
    if (this.textures.exists('jumper')) return

    const jg = this.make.graphics({ x: 0, y: 0 })
    jg.fillStyle(0x00ff88, 1)
    jg.fillRoundedRect(0, 0, 30, 30, 6)
    jg.fillStyle(0xffffff, 1)
    jg.fillCircle(10, 12, 4)
    jg.fillCircle(20, 12, 4)
    jg.fillStyle(0x000000, 1)
    jg.fillCircle(11, 12, 2)
    jg.fillCircle(21, 12, 2)
    jg.generateTexture('jumper', 30, 30)
    jg.destroy()

    const pg = this.make.graphics({ x: 0, y: 0 })
    pg.fillStyle(0x44aa44, 1)
    pg.fillRoundedRect(0, 0, 80, 14, 4)
    pg.generateTexture('plat', 80, 14)
    pg.destroy()
  }

  spawnPlatform(x: number, y: number) {
    const p = this.physics.add.image(x, y, 'plat')
    this.platforms?.add(p)
      ; (p.body as Phaser.Physics.Arcade.Body).setImmovable(true)
      ; (p.body as Phaser.Physics.Arcade.Body).setAllowGravity(false)
    // some platforms move
    if (Math.random() > 0.7) {
      this.tweens.add({
        targets: p,
        x: x + Phaser.Math.Between(-100, 100),
        duration: Phaser.Math.Between(1500, 3000),
        yoyo: true,
        repeat: -1,
      })
    }
  }

  onLand() {
    ; (this.player?.body as Phaser.Physics.Arcade.Body).setVelocityY(-500)
  }

  update() {
    if (this.gameOver) return

    const cursors = this.input.keyboard?.createCursorKeys()
    const pb = this.player?.body as Phaser.Physics.Arcade.Body

    if (cursors?.left.isDown) pb.setVelocityX(-250)
    else if (cursors?.right.isDown) pb.setVelocityX(250)
    else pb.setVelocityX(0)

    // wrap horizontally
    if (this.player && this.player.x < -15) this.player.x = 815
    if (this.player && this.player.x > 815) this.player.x = -15

    // scroll camera
    if (this.player && this.player.y < this.highestY - 100) {
      const diff = this.highestY - 100 - this.player.y
      this.highestY = this.player.y + 100
      this.score += Math.floor(diff)
      this.scoreText?.setText(`Score: ${this.score}`)

      // generate new platforms above
      this.platforms?.children.entries.forEach(p => {
        const plat = p as Phaser.GameObjects.Image
        plat.y += diff
        if (plat.y > 650) {
          plat.y = Phaser.Math.Between(-20, 20)
          plat.x = Phaser.Math.Between(50, 750)
        }
      })

      if (this.player) this.player.y += diff
    }

    // fall off screen
    if (this.player && this.player.y > 650) {
      this.gameOver = true
      this.physics.pause()
      this.add.text(400, 260, 'Game Over!', { fontSize: '48px', color: '#ff4444', fontStyle: 'bold' }).setOrigin(0.5).setScrollFactor(0)
      this.add.text(400, 320, `Score: ${this.score}`, { fontSize: '32px', color: '#fff' }).setOrigin(0.5).setScrollFactor(0)
      this.add.text(400, 380, 'Click to Restart', { fontSize: '20px', color: '#aaa' }).setOrigin(0.5).setScrollFactor(0)
      this.input.once('pointerdown', () => this.scene.restart())
    }
  }
}

export default {
  metadata: {
    slug: 'platform-jumper',
    title: 'Platform Jumper',
    description: 'Endless vertical jumping game. Land on moving platforms and climb as high as you can!',
    thumbnailUrl: '/games/platform-jumper/thumbnail.png',
    category: 'Platformer',
    tags: ['arcade', 'jumping'],
    developerName: 'Game Portal Team',
    packageName: 'platform-jumper',
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
      scene: [PlatformJumperScene],
    })
  },
}
