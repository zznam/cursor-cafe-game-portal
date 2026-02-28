import * as Phaser from 'phaser'

const HEADER_H = 50
const GRID_COLS = 20
const GRID_ROWS = 20
const CELL_SIZE = Math.floor((600 - HEADER_H) / GRID_ROWS)
const CELL_W = CELL_SIZE
const CELL_H = CELL_SIZE
const AREA_W = GRID_COLS * CELL_W
const AREA_H = GRID_ROWS * CELL_H
const OFFSET_X = (800 - AREA_W) / 2
const OFFSET_Y = HEADER_H

enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT,
}

interface SnakeSegment {
  col: number
  row: number
}

class SnakeScene extends Phaser.Scene {
  private snake: SnakeSegment[] = []
  private food: SnakeSegment = { col: 0, row: 0 }
  private direction: Direction = Direction.RIGHT
  private nextDirection: Direction = Direction.RIGHT
  private score = 0
  private scoreText?: Phaser.GameObjects.Text
  private gameOver = false
  private moveInterval = 150
  private moveTimer?: Phaser.Time.TimerEvent
  private foodsEaten = 0
  private snakeGraphics?: Phaser.GameObjects.Graphics
  private foodGraphics?: Phaser.GameObjects.Graphics
  private gridGraphics?: Phaser.GameObjects.Graphics
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys
  private foodPulseTween?: Phaser.Tweens.Tween
  private foodAlpha = 1

  constructor() {
    super({ key: 'SnakeScene' })
  }

  create() {
    this.score = 0
    this.gameOver = false
    this.moveInterval = 150
    this.foodsEaten = 0
    this.direction = Direction.RIGHT
    this.nextDirection = Direction.RIGHT
    this.foodAlpha = 1

    this.snake = [
      { col: 4, row: 10 },
      { col: 3, row: 10 },
      { col: 2, row: 10 },
    ]

    this.drawGrid()

    this.snakeGraphics = this.add.graphics()
    this.foodGraphics = this.add.graphics()

    this.spawnFood()

    this.scoreText = this.add
      .text(400, HEADER_H / 2, 'Score: 0', {
        fontSize: '28px',
        color: '#00ff88',
        fontStyle: 'bold',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5)

    this.cursors = this.input.keyboard?.createCursorKeys()

    this.moveTimer = this.time.addEvent({
      delay: this.moveInterval,
      callback: this.moveSnake,
      callbackScope: this,
      loop: true,
    })

    this.drawSnake()
    this.drawFood()
  }

  private drawGrid() {
    this.gridGraphics = this.add.graphics()
    this.gridGraphics.lineStyle(1, 0x1a3a1a, 0.3)

    for (let c = 0; c <= GRID_COLS; c++) {
      const x = OFFSET_X + c * CELL_W
      this.gridGraphics.lineBetween(x, OFFSET_Y, x, OFFSET_Y + AREA_H)
    }
    for (let r = 0; r <= GRID_ROWS; r++) {
      const y = OFFSET_Y + r * CELL_H
      this.gridGraphics.lineBetween(OFFSET_X, y, OFFSET_X + AREA_W, y)
    }

    this.gridGraphics.lineStyle(2, 0x00ff44, 0.4)
    this.gridGraphics.strokeRect(OFFSET_X, OFFSET_Y, AREA_W, AREA_H)
  }

  private cellToPixel(col: number, row: number): { x: number; y: number } {
    return {
      x: OFFSET_X + col * CELL_W + CELL_W / 2,
      y: OFFSET_Y + row * CELL_H + CELL_H / 2,
    }
  }

  private drawSnake() {
    if (!this.snakeGraphics) return
    this.snakeGraphics.clear()

    for (let i = this.snake.length - 1; i >= 0; i--) {
      const seg = this.snake[i]
      const { x, y } = this.cellToPixel(seg.col, seg.row)
      const isHead = i === 0

      const brightness = 0.4 + 0.6 * (1 - i / this.snake.length)
      const green = Math.floor(255 * brightness)
      const color = Phaser.Display.Color.GetColor(0, green, 0)

      if (isHead) {
        this.snakeGraphics.fillStyle(0x00ff00, 1)
        this.snakeGraphics.fillRoundedRect(
          x - CELL_W / 2 + 1,
          y - CELL_H / 2 + 1,
          CELL_W - 2,
          CELL_H - 2,
          6,
        )
        this.snakeGraphics.fillStyle(0x88ff88, 0.3)
        this.snakeGraphics.fillRoundedRect(
          x - CELL_W / 2 - 2,
          y - CELL_H / 2 - 2,
          CELL_W + 4,
          CELL_H + 4,
          8,
        )
      } else {
        this.snakeGraphics.fillStyle(color, 0.9)
        this.snakeGraphics.fillRoundedRect(
          x - CELL_W / 2 + 2,
          y - CELL_H / 2 + 2,
          CELL_W - 4,
          CELL_H - 4,
          4,
        )
      }
    }
  }

  private drawFood() {
    if (!this.foodGraphics) return
    this.foodGraphics.clear()

    const { x, y } = this.cellToPixel(this.food.col, this.food.row)

    this.foodGraphics.fillStyle(0xff0044, 0.2 * this.foodAlpha)
    this.foodGraphics.fillCircle(x, y, CELL_W * 0.7)

    this.foodGraphics.fillStyle(0xff0044, 0.5 * this.foodAlpha)
    this.foodGraphics.fillCircle(x, y, CELL_W * 0.5)

    this.foodGraphics.fillStyle(0xff4466, this.foodAlpha)
    this.foodGraphics.fillCircle(x, y, CELL_W * 0.35)
  }

  private spawnFood() {
    const occupied = new Set(this.snake.map((s) => `${s.col},${s.row}`))
    const free: SnakeSegment[] = []

    for (let c = 0; c < GRID_COLS; c++) {
      for (let r = 0; r < GRID_ROWS; r++) {
        if (!occupied.has(`${c},${r}`)) {
          free.push({ col: c, row: r })
        }
      }
    }

    if (free.length === 0) return
    this.food = Phaser.Utils.Array.GetRandom(free)

    if (this.foodPulseTween) this.foodPulseTween.destroy()
    this.foodAlpha = 1
    this.foodPulseTween = this.tweens.add({
      targets: this,
      foodAlpha: 0.4,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })
  }

  private moveSnake() {
    if (this.gameOver) return

    this.direction = this.nextDirection

    const head = this.snake[0]
    let newCol = head.col
    let newRow = head.row

    switch (this.direction) {
      case Direction.UP:
        newRow--
        break
      case Direction.DOWN:
        newRow++
        break
      case Direction.LEFT:
        newCol--
        break
      case Direction.RIGHT:
        newCol++
        break
    }

    if (newCol < 0 || newCol >= GRID_COLS || newRow < 0 || newRow >= GRID_ROWS) {
      this.triggerGameOver()
      return
    }

    for (const seg of this.snake) {
      if (seg.col === newCol && seg.row === newRow) {
        this.triggerGameOver()
        return
      }
    }

    this.snake.unshift({ col: newCol, row: newRow })

    if (newCol === this.food.col && newRow === this.food.row) {
      this.score += 10
      this.foodsEaten++
      this.scoreText?.setText(`Score: ${this.score}`)

      if (this.foodsEaten % 5 === 0) {
        this.moveInterval = Math.max(60, this.moveInterval - 10)
        this.moveTimer?.destroy()
        this.moveTimer = this.time.addEvent({
          delay: this.moveInterval,
          callback: this.moveSnake,
          callbackScope: this,
          loop: true,
        })
      }

      this.spawnFood()
    } else {
      this.snake.pop()
    }

    this.drawSnake()
    this.drawFood()
  }

  private triggerGameOver() {
    if (this.gameOver) return
    this.gameOver = true

    this.moveTimer?.destroy()
    if (this.foodPulseTween) this.foodPulseTween.destroy()

    this.add
      .text(400, 240, 'Game Over', {
        fontSize: '48px',
        color: '#ff4444',
        fontStyle: 'bold',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5)
      .setDepth(10)

    this.add
      .text(400, 300, `Score: ${this.score}`, {
        fontSize: '32px',
        color: '#ffffff',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5)
      .setDepth(10)

    this.add
      .text(400, 360, 'Click to Restart', {
        fontSize: '24px',
        color: '#aaaaaa',
        fontFamily: 'monospace',
      })
      .setOrigin(0.5)
      .setDepth(10)

    this.input.once('pointerdown', () => {
      this.scene.restart()
    })
  }

  update() {
    if (this.gameOver || !this.cursors) return

    if (this.cursors.up.isDown && this.direction !== Direction.DOWN) {
      this.nextDirection = Direction.UP
    } else if (this.cursors.down.isDown && this.direction !== Direction.UP) {
      this.nextDirection = Direction.DOWN
    } else if (this.cursors.left.isDown && this.direction !== Direction.RIGHT) {
      this.nextDirection = Direction.LEFT
    } else if (this.cursors.right.isDown && this.direction !== Direction.LEFT) {
      this.nextDirection = Direction.RIGHT
    }

    this.drawFood()
  }
}

const snakeGame = {
  metadata: {
    slug: 'snake',
    title: 'Neon Snake',
    description:
      'Classic snake game with a neon twist. Eat food, grow longer, don\'t crash!',
    thumbnailUrl: '/games/snake/thumbnail.png',
    category: 'Arcade',
    tags: ['classic', 'arcade', 'retro', 'snake'],
    developerName: 'Game Portal Team',
    packageName: 'snake',
    version: '1.0.0',
  },
  createGame: (containerId: string) => {
    return new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerId,
      width: 800,
      height: 600,
      backgroundColor: '#0a0a1a',
      scene: [SnakeScene],
    })
  },
}

export default snakeGame
