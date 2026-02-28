import * as Phaser from 'phaser'

class NeonSnakeScene extends Phaser.Scene {
  private snake: { x: number; y: number }[] = []
  private food = { x: 0, y: 0 }
  private direction = { x: 1, y: 0 }
  private nextDirection = { x: 1, y: 0 }
  private score = 0
  private scoreText?: Phaser.GameObjects.Text
  private gameOver = false
  private moveTimer = 0
  private moveInterval = 120
  private cellSize = 20
  private gridW = 40
  private gridH = 30
  private snakeGraphics?: Phaser.GameObjects.Graphics
  private foodGraphics?: Phaser.GameObjects.Graphics
  private trailGraphics?: Phaser.GameObjects.Graphics

  constructor() {
    super({ key: 'NeonSnakeScene' })
  }

  create() {
    this.score = 0
    this.gameOver = false
    this.moveTimer = 0
    this.moveInterval = 120
    this.direction = { x: 1, y: 0 }
    this.nextDirection = { x: 1, y: 0 }

    this.snake = []
    for (let i = 4; i >= 0; i--) {
      this.snake.push({ x: 10 + i, y: 15 })
    }

    this.trailGraphics = this.add.graphics()
    this.snakeGraphics = this.add.graphics()
    this.foodGraphics = this.add.graphics()

    this.scoreText = this.add.text(16, 8, 'Score: 0', {
      fontSize: '20px',
      color: '#0ff',
      fontFamily: 'monospace',
    })

    this.spawnFood()
    this.drawFood()

    this.input.keyboard?.on('keydown-LEFT', () => {
      if (this.direction.x !== 1) this.nextDirection = { x: -1, y: 0 }
    })
    this.input.keyboard?.on('keydown-RIGHT', () => {
      if (this.direction.x !== -1) this.nextDirection = { x: 1, y: 0 }
    })
    this.input.keyboard?.on('keydown-UP', () => {
      if (this.direction.y !== 1) this.nextDirection = { x: 0, y: -1 }
    })
    this.input.keyboard?.on('keydown-DOWN', () => {
      if (this.direction.y !== -1) this.nextDirection = { x: 0, y: 1 }
    })
  }

  spawnFood() {
    let valid = false
    while (!valid) {
      this.food.x = Phaser.Math.Between(0, this.gridW - 1)
      this.food.y = Phaser.Math.Between(0, this.gridH - 1)
      valid = !this.snake.some(s => s.x === this.food.x && s.y === this.food.y)
    }
  }

  drawFood() {
    this.foodGraphics?.clear()
    this.foodGraphics?.fillStyle(0xff00ff, 1)
    this.foodGraphics?.fillRect(
      this.food.x * this.cellSize + 2,
      this.food.y * this.cellSize + 2,
      this.cellSize - 4,
      this.cellSize - 4
    )
    this.foodGraphics?.fillStyle(0xff88ff, 0.5)
    this.foodGraphics?.fillCircle(
      this.food.x * this.cellSize + this.cellSize / 2,
      this.food.y * this.cellSize + this.cellSize / 2,
      this.cellSize
    )
  }

  drawSnake() {
    this.snakeGraphics?.clear()
    this.snake.forEach((seg, i) => {
      const alpha = 1 - i * 0.015
      const color = i === 0 ? 0x00ffff : 0x00cc88
      this.snakeGraphics?.fillStyle(color, Math.max(alpha, 0.3))
      this.snakeGraphics?.fillRect(
        seg.x * this.cellSize + 1,
        seg.y * this.cellSize + 1,
        this.cellSize - 2,
        this.cellSize - 2
      )
    })
    // glow on head
    const head = this.snake[0]
    this.snakeGraphics?.fillStyle(0x00ffff, 0.2)
    this.snakeGraphics?.fillCircle(
      head.x * this.cellSize + this.cellSize / 2,
      head.y * this.cellSize + this.cellSize / 2,
      this.cellSize
    )
  }

  update(_time: number, delta: number) {
    if (this.gameOver) return

    this.moveTimer += delta
    if (this.moveTimer < this.moveInterval) return
    this.moveTimer = 0

    this.direction = { ...this.nextDirection }

    const head = this.snake[0]
    const newHead = {
      x: head.x + this.direction.x,
      y: head.y + this.direction.y,
    }

    if (newHead.x < 0 || newHead.x >= this.gridW || newHead.y < 0 || newHead.y >= this.gridH) {
      this.endGame()
      return
    }

    if (this.snake.some(s => s.x === newHead.x && s.y === newHead.y)) {
      this.endGame()
      return
    }

    this.snake.unshift(newHead)

    if (newHead.x === this.food.x && newHead.y === this.food.y) {
      this.score += 10
      this.scoreText?.setText(`Score: ${this.score}`)
      this.spawnFood()
      this.drawFood()
      if (this.moveInterval > 50) this.moveInterval -= 2
    } else {
      this.snake.pop()
    }

    this.drawSnake()
  }

  endGame() {
    this.gameOver = true
    this.add.text(400, 250, 'Game Over!', {
      fontSize: '48px', color: '#ff0066', fontStyle: 'bold',
    }).setOrigin(0.5)
    this.add.text(400, 310, `Score: ${this.score}`, {
      fontSize: '32px', color: '#ffffff',
    }).setOrigin(0.5)
    this.add.text(400, 370, 'Click to Restart', {
      fontSize: '20px', color: '#aaaaaa',
    }).setOrigin(0.5)
    this.input.once('pointerdown', () => this.scene.restart())
  }
}

export default {
  metadata: {
    slug: 'neon-snake',
    title: 'Neon Snake',
    description: 'A modern, neon-drenched take on the classic Snake game with speed boosts as you grow.',
    thumbnailUrl: '/games/neon-snake/thumbnail.png',
    category: 'Action',
    tags: ['arcade', 'snake'],
    developerName: 'Game Portal Team',
    packageName: 'neon-snake',
    version: '1.0.0',
  },
  createGame: (containerId: string) => {
    return new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerId,
      width: 800,
      height: 600,
      backgroundColor: '#0a0a1a',
      scene: [NeonSnakeScene],
    })
  },
}
