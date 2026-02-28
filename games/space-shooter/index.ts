import * as Phaser from 'phaser'

class SpaceShooterScene extends Phaser.Scene {
  private player?: Phaser.GameObjects.Rectangle
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys
  private bullets?: Phaser.Physics.Arcade.Group
  private enemies?: Phaser.Physics.Arcade.Group
  private score = 0
  private scoreText?: Phaser.GameObjects.Text
  private lastFired = 0
  private gameOver = false

  constructor() {
    super({ key: 'SpaceShooterScene' })
  }

  create() {
    this.score = 0
    this.gameOver = false

    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      color: '#fff'
    })

    this.player = this.add.rectangle(400, 550, 40, 40, 0x00ff00)
    this.physics.add.existing(this.player)
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body
    playerBody.setCollideWorldBounds(true)

    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 30
    })

    this.enemies = this.physics.add.group()

    this.time.addEvent({
      delay: 1000,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    })

    this.physics.add.overlap(
      this.bullets,
      this.enemies,
      this.hitEnemy as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    )

    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.hitPlayer as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    )

    this.cursors = this.input.keyboard?.createCursorKeys()
  }

  spawnEnemy() {
    if (this.gameOver) return

    const x = Phaser.Math.Between(50, 750)
    const enemy = this.add.rectangle(x, 0, 30, 30, 0xff0000)
    this.enemies?.add(enemy)
    this.physics.add.existing(enemy)
    const enemyBody = enemy.body as Phaser.Physics.Arcade.Body
    enemyBody.setVelocityY(Phaser.Math.Between(100, 200))
  }

  shootBullet() {
    if (!this.player || this.gameOver) return

    const bullet = this.add.rectangle(
      this.player.x,
      this.player.y - 20,
      5,
      15,
      0xffff00
    )
    this.bullets?.add(bullet)
    this.physics.add.existing(bullet)
    const bulletBody = bullet.body as Phaser.Physics.Arcade.Body
    bulletBody.setVelocityY(-400)
  }

  hitEnemy(
    bullet: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    enemy: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ) {
    bullet.destroy()
    enemy.destroy()
    this.score += 10
    this.scoreText?.setText(`Score: ${this.score}`)
  }

  hitPlayer() {
    if (this.gameOver) return
    
    this.gameOver = true
    this.physics.pause()
    this.add.text(400, 300, 'Game Over!', {
      fontSize: '48px',
      color: '#fff'
    }).setOrigin(0.5)
    this.add.text(400, 350, `Final Score: ${this.score}`, {
      fontSize: '32px',
      color: '#fff'
    }).setOrigin(0.5)
  }

  update(time: number) {
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
      const bulletObj = bullet as Phaser.GameObjects.Rectangle
      if (bulletObj.y < 0) {
        bulletObj.destroy()
      }
    })

    this.enemies?.children.entries.forEach((enemy) => {
      const enemyObj = enemy as Phaser.GameObjects.Rectangle
      if (enemyObj.y > 600) {
        enemyObj.destroy()
      }
    })
  }
}

export default {
  metadata: {
    slug: 'space-shooter',
    title: 'Space Shooter',
    description: 'Defend Earth from alien invaders! Use arrow keys to move and spacebar to shoot.',
    thumbnailUrl: '/games/space-shooter/thumbnail.png',
    category: 'Shooter',
    tags: ['space', 'action', 'arcade'],
    developerName: 'Game Portal Team',
    packageName: 'space-shooter',
    version: '1.0.0'
  },
  createGame: (containerId: string) => {
    return new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerId,
      width: 800,
      height: 600,
      backgroundColor: '#000033',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false
        }
      },
      scene: [SpaceShooterScene]
    })
  }
}
