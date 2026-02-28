import * as Phaser from 'phaser'

class TowerDefenseScene extends Phaser.Scene {
  private path: { x: number; y: number }[] = []
  private enemies?: Phaser.Physics.Arcade.Group
  private towers: { x: number; y: number; range: number; damage: number; lastFired: number; sprite: Phaser.GameObjects.Arc }[] = []
  private bullets?: Phaser.Physics.Arcade.Group
  private wave = 0
  private lives = 10
  private money = 100
  private score = 0
  private waveText?: Phaser.GameObjects.Text
  private livesText?: Phaser.GameObjects.Text
  private moneyText?: Phaser.GameObjects.Text
  private scoreText?: Phaser.GameObjects.Text
  private infoText?: Phaser.GameObjects.Text
  private gameOver = false
  private spawning = false
  private pathGraphics?: Phaser.GameObjects.Graphics

  constructor() {
    super({ key: 'TowerDefenseScene' })
  }

  create() {
    this.towers = []
    this.wave = 0
    this.lives = 10
    this.money = 100
    this.score = 0
    this.gameOver = false
    this.spawning = false

    this.path = [
      { x: 0, y: 300 }, { x: 150, y: 300 }, { x: 150, y: 150 },
      { x: 400, y: 150 }, { x: 400, y: 450 }, { x: 650, y: 450 },
      { x: 650, y: 300 }, { x: 800, y: 300 },
    ]

    this.pathGraphics = this.add.graphics()
    this.pathGraphics.lineStyle(30, 0x222244, 0.8)
    this.pathGraphics.beginPath()
    this.pathGraphics.moveTo(this.path[0].x, this.path[0].y)
    for (let i = 1; i < this.path.length; i++) {
      this.pathGraphics.lineTo(this.path[i].x, this.path[i].y)
    }
    this.pathGraphics.strokePath()

    this.enemies = this.physics.add.group()
    this.bullets = this.physics.add.group()

    this.waveText = this.add.text(16, 16, 'Wave: 0', { fontSize: '18px', color: '#ff0', fontFamily: 'monospace' })
    this.livesText = this.add.text(16, 40, 'Lives: 10', { fontSize: '18px', color: '#f44', fontFamily: 'monospace' })
    this.moneyText = this.add.text(200, 16, 'Money: $100', { fontSize: '18px', color: '#0f0', fontFamily: 'monospace' })
    this.scoreText = this.add.text(200, 40, 'Score: 0', { fontSize: '18px', color: '#0ff', fontFamily: 'monospace' })
    this.infoText = this.add.text(500, 16, 'Click to place tower ($25)', { fontSize: '14px', color: '#888', fontFamily: 'monospace' })

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.gameOver) { this.scene.restart(); return }
      this.placeTower(pointer.x, pointer.y)
    })

    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy as any, undefined, this)

    this.startWave()
  }

  placeTower(x: number, y: number) {
    if (this.money < 25) return
    // check not too close to path
    for (const p of this.path) {
      if (Phaser.Math.Distance.Between(x, y, p.x, p.y) < 40) return
    }
    // check not too close to other towers
    for (const t of this.towers) {
      if (Phaser.Math.Distance.Between(x, y, t.x, t.y) < 40) return
    }

    this.money -= 25
    this.moneyText?.setText(`Money: $${this.money}`)

    const sprite = this.add.circle(x, y, 12, 0x4488ff)
    sprite.setStrokeStyle(2, 0x88ccff)
    // range indicator
    this.add.circle(x, y, 100, 0x4488ff, 0.05)

    this.towers.push({ x, y, range: 100, damage: 10, lastFired: 0, sprite })
  }

  startWave() {
    this.wave++
    this.waveText?.setText(`Wave: ${this.wave}`)
    this.spawning = true
    const count = 5 + this.wave * 2
    let spawned = 0

    const spawnTimer = this.time.addEvent({
      delay: 600,
      callback: () => {
        if (spawned >= count) { spawnTimer.remove(); this.spawning = false; return }
        this.spawnEnemy()
        spawned++
      },
      loop: true,
    })
  }

  spawnEnemy() {
    const e = this.add.circle(this.path[0].x, this.path[0].y, 10, 0xff4444)
    this.physics.add.existing(e)
    this.enemies?.add(e)
    e.setData('hp', 20 + this.wave * 5)
    e.setData('maxHp', 20 + this.wave * 5)
    e.setData('pathIdx', 0)
    e.setData('speed', 80 + this.wave * 5)
  }

  hitEnemy(bullet: any, enemy: any) {
    bullet.destroy()
    const hp = enemy.getData('hp') - 10
    enemy.setData('hp', hp)
    if (hp <= 0) {
      enemy.destroy()
      this.score += 10
      this.money += 10
      this.scoreText?.setText(`Score: ${this.score}`)
      this.moneyText?.setText(`Money: $${this.money}`)
    }
  }

  update(time: number) {
    if (this.gameOver) return

    // move enemies along path
    this.enemies?.children.entries.forEach(e => {
      const enemy = e as Phaser.GameObjects.Arc
      let idx = enemy.getData('pathIdx') as number
      const speed = enemy.getData('speed') as number
      if (idx >= this.path.length - 1) {
        enemy.destroy()
        this.lives--
        this.livesText?.setText(`Lives: ${this.lives}`)
        if (this.lives <= 0) this.endGame()
        return
      }

      const target = this.path[idx + 1]
      const dx = target.x - enemy.x
      const dy = target.y - enemy.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 3) {
        enemy.setData('pathIdx', idx + 1)
      } else {
        const body = enemy.body as Phaser.Physics.Arcade.Body
        body.setVelocity((dx / dist) * speed, (dy / dist) * speed)
      }

      // hp bar
      const hp = enemy.getData('hp') as number
      const maxHp = enemy.getData('maxHp') as number
      const ratio = hp / maxHp
      enemy.setFillStyle(Phaser.Display.Color.GetColor(
        Math.floor(255 * (1 - ratio)),
        Math.floor(255 * ratio),
        0
      ))
    })

    // towers shoot
    for (const tower of this.towers) {
      if (time - tower.lastFired < 500) continue
      let closest: any = null
      let closestDist = tower.range

      this.enemies?.children.entries.forEach(e => {
        const d = Phaser.Math.Distance.Between(tower.x, tower.y, (e as any).x, (e as any).y)
        if (d < closestDist) { closestDist = d; closest = e }
      })

      if (closest) {
        tower.lastFired = time
        const b = this.add.circle(tower.x, tower.y, 4, 0xffff00)
        this.physics.add.existing(b)
        this.bullets?.add(b)
        const dx = closest.x - tower.x
        const dy = closest.y - tower.y
        const dist = Math.sqrt(dx * dx + dy * dy)
          ; (b.body as Phaser.Physics.Arcade.Body).setVelocity((dx / dist) * 300, (dy / dist) * 300)
        this.time.delayedCall(2000, () => b.destroy())
      }
    }

    // check next wave
    if (!this.spawning && this.enemies?.countActive() === 0 && !this.gameOver) {
      this.time.delayedCall(2000, () => this.startWave())
    }
  }

  endGame() {
    this.gameOver = true
    this.physics.pause()
    this.add.text(400, 260, 'Game Over!', { fontSize: '48px', color: '#ff4444', fontStyle: 'bold' }).setOrigin(0.5)
    this.add.text(400, 320, `Score: ${this.score} | Waves: ${this.wave}`, { fontSize: '24px', color: '#fff' }).setOrigin(0.5)
    this.add.text(400, 370, 'Click to Restart', { fontSize: '20px', color: '#aaa' }).setOrigin(0.5)
  }
}

export default {
  metadata: {
    slug: 'tower-defense-lite',
    title: 'Tower Defense Lite',
    description: 'Build laser towers along a path to stop waves of enemies. Click to place towers!',
    thumbnailUrl: '/games/tower-defense-lite/thumbnail.png',
    category: 'Strategy',
    tags: ['defense', 'tactical'],
    developerName: 'Game Portal Team',
    packageName: 'tower-defense-lite',
    version: '1.0.0',
  },
  createGame: (containerId: string) => {
    return new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerId,
      width: 800,
      height: 600,
      backgroundColor: '#0a0a1e',
      physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 0 }, debug: false } },
      scene: [TowerDefenseScene],
    })
  },
}
