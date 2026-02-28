import * as Phaser from 'phaser'

class EndlessHighwayScene extends Phaser.Scene {
  private player?: Phaser.GameObjects.Rectangle
  private lane = 1
  private targetX = 400
  private cars: Phaser.GameObjects.Rectangle[] = []
  private score = 0
  private speed = 4
  private scoreText?: Phaser.GameObjects.Text
  private gameOver = false
  private lanes = [200, 400, 600]
  private roadLines: Phaser.GameObjects.Rectangle[] = []

  constructor() {
    super({ key: 'EndlessHighwayScene' })
  }

  create() {
    this.score = 0
    this.speed = 4
    this.lane = 1
    this.targetX = this.lanes[1]
    this.gameOver = false
    this.cars = []
    this.roadLines = []

    // road
    this.add.rectangle(400, 300, 500, 600, 0x333344)
    // lane markings
    for (let y = 0; y < 600; y += 60) {
      const l1 = this.add.rectangle(300, y, 4, 30, 0xffff00, 0.4)
      const l2 = this.add.rectangle(500, y, 4, 30, 0xffff00, 0.4)
      this.roadLines.push(l1, l2)
    }

    // player motorcycle
    this.player = this.add.rectangle(this.lanes[1], 500, 20, 40, 0x00ffcc)
    this.add.rectangle(this.lanes[1], 490, 12, 8, 0xffffff).setData('player', true)

    this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '22px', color: '#0ff', fontFamily: 'monospace' })
    this.add.text(400, 570, '← → Arrow keys to change lanes', { fontSize: '14px', color: '#666', fontFamily: 'monospace' }).setOrigin(0.5)

    this.input.keyboard?.on('keydown-LEFT', () => {
      if (this.gameOver) return
      this.lane = Math.max(0, this.lane - 1)
      this.targetX = this.lanes[this.lane]
    })
    this.input.keyboard?.on('keydown-RIGHT', () => {
      if (this.gameOver) return
      this.lane = Math.min(2, this.lane + 1)
      this.targetX = this.lanes[this.lane]
    })

    this.time.addEvent({
      delay: 800,
      callback: this.spawnCar,
      callbackScope: this,
      loop: true,
    })

    this.time.addEvent({
      delay: 100,
      callback: () => {
        if (!this.gameOver) {
          this.score++
          this.scoreText?.setText(`Score: ${this.score}`)
          this.speed = Math.min(this.speed + 0.02, 12)
        }
      },
      loop: true,
    })
  }

  spawnCar() {
    if (this.gameOver) return
    const lane = Phaser.Math.Between(0, 2)
    const car = this.add.rectangle(this.lanes[lane], -50, 24, 44, Phaser.Math.Between(0, 0xffffff))
    car.setData('speed', this.speed)
    this.cars.push(car)
  }

  update() {
    if (this.gameOver) return

    // scroll road lines
    for (const l of this.roadLines) {
      l.y += this.speed
      if (l.y > 620) l.y -= 660
    }

    // smooth lane change
    if (this.player) {
      this.player.x += (this.targetX - this.player.x) * 0.15
    }

    // move and check cars
    for (let i = this.cars.length - 1; i >= 0; i--) {
      const car = this.cars[i]
      car.y += car.getData('speed') as number

      if (car.y > 650) {
        car.destroy()
        this.cars.splice(i, 1)
        continue
      }

      // collision
      if (this.player && Math.abs(car.x - this.player.x) < 22 && Math.abs(car.y - this.player.y) < 40) {
        this.endGame()
        return
      }
    }
  }

  endGame() {
    this.gameOver = true
    this.add.text(400, 250, 'Crash!', { fontSize: '48px', color: '#ff4444', fontStyle: 'bold' }).setOrigin(0.5)
    this.add.text(400, 310, `Score: ${this.score}`, { fontSize: '32px', color: '#fff' }).setOrigin(0.5)
    this.add.text(400, 370, 'Click to Restart', { fontSize: '20px', color: '#aaa' }).setOrigin(0.5)
    this.input.once('pointerdown', () => this.scene.restart())
  }
}

export default {
  metadata: {
    slug: 'endless-highway-rider',
    title: 'Endless Highway Rider',
    description: 'Outrun traffic on a motorcycle! Use arrow keys to switch lanes and avoid cars.',
    thumbnailUrl: '/games/endless-highway-rider/thumbnail.png',
    category: 'Racing',
    tags: ['driving', 'retro'],
    developerName: 'Game Portal Team',
    packageName: 'endless-highway-rider',
    version: '1.0.0',
  },
  createGame: (containerId: string) => {
    return new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerId,
      width: 800,
      height: 600,
      backgroundColor: '#111111',
      scene: [EndlessHighwayScene],
    })
  },
}
