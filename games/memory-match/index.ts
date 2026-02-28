import * as Phaser from 'phaser'

const COLS = 4
const ROWS = 4
const CARD_W = 140
const CARD_H = 160
const GAP = 15
const GRID_W = COLS * CARD_W + (COLS - 1) * GAP
const GRID_H = ROWS * CARD_H + (ROWS - 1) * GAP
const OFFSET_X = (800 - GRID_W) / 2
const OFFSET_Y = (600 - GRID_H) / 2 + 25

const SYMBOLS = [
  { key: 'sym_circle', label: 'Circle', color: 0xff4444, draw: drawCircle },
  { key: 'sym_square', label: 'Square', color: 0x4488ff, draw: drawSquare },
  { key: 'sym_triangle', label: 'Triangle', color: 0x44dd44, draw: drawTriangle },
  { key: 'sym_star', label: 'Star', color: 0xffdd44, draw: drawStar },
  { key: 'sym_diamond', label: 'Diamond', color: 0x44dddd, draw: drawDiamond },
  { key: 'sym_heart', label: 'Heart', color: 0xff44ff, draw: drawHeart },
  { key: 'sym_cross', label: 'Cross', color: 0xff8844, draw: drawCross },
  { key: 'sym_hexagon', label: 'Hexagon', color: 0xffffff, draw: drawHexagon },
]

function drawCircle(gfx: Phaser.GameObjects.Graphics, color: number) {
  gfx.fillStyle(color, 1)
  gfx.fillCircle(70, 80, 40)
}

function drawSquare(gfx: Phaser.GameObjects.Graphics, color: number) {
  gfx.fillStyle(color, 1)
  gfx.fillRect(30, 40, 80, 80)
}

function drawTriangle(gfx: Phaser.GameObjects.Graphics, color: number) {
  gfx.fillStyle(color, 1)
  gfx.fillTriangle(70, 35, 30, 120, 110, 120)
}

function drawStar(gfx: Phaser.GameObjects.Graphics, color: number) {
  gfx.fillStyle(color, 1)
  const cx = 70, cy = 80, outerR = 40, innerR = 18, points = 5
  const verts: number[] = []
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR
    const angle = (Math.PI / 2) * -1 + (Math.PI / points) * i
    verts.push(cx + r * Math.cos(angle), cy + r * Math.sin(angle))
  }
  const polyPoints: Phaser.Geom.Point[] = []
  for (let i = 0; i < verts.length; i += 2) {
    polyPoints.push(new Phaser.Geom.Point(verts[i], verts[i + 1]))
  }
  gfx.fillPoints(polyPoints, true)
}

function drawDiamond(gfx: Phaser.GameObjects.Graphics, color: number) {
  gfx.fillStyle(color, 1)
  gfx.fillTriangle(70, 35, 30, 80, 70, 125)
  gfx.fillTriangle(70, 35, 110, 80, 70, 125)
}

function drawHeart(gfx: Phaser.GameObjects.Graphics, color: number) {
  gfx.fillStyle(color, 1)
  gfx.fillCircle(52, 65, 22)
  gfx.fillCircle(88, 65, 22)
  gfx.fillTriangle(30, 72, 110, 72, 70, 120)
}

function drawCross(gfx: Phaser.GameObjects.Graphics, color: number) {
  gfx.fillStyle(color, 1)
  gfx.fillRect(55, 40, 30, 80)
  gfx.fillRect(30, 65, 80, 30)
}

function drawHexagon(gfx: Phaser.GameObjects.Graphics, color: number) {
  gfx.fillStyle(color, 1)
  const cx = 70, cy = 80, r = 38
  const pts: Phaser.Geom.Point[] = []
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6
    pts.push(new Phaser.Geom.Point(cx + r * Math.cos(angle), cy + r * Math.sin(angle)))
  }
  gfx.fillPoints(pts, true)
}

interface Card {
  symbolIndex: number
  faceUp: boolean
  matched: boolean
  container: Phaser.GameObjects.Container
  backImage: Phaser.GameObjects.Image
  faceImage: Phaser.GameObjects.Image
}

class MemoryMatchScene extends Phaser.Scene {
  private cards: Card[] = []
  private flippedCards: Card[] = []
  private score = 0
  private moves = 0
  private matchCount = 0
  private startTime = 0
  private scoreText?: Phaser.GameObjects.Text
  private movesText?: Phaser.GameObjects.Text
  private timeText?: Phaser.GameObjects.Text
  private isLocked = false
  private timerEvent?: Phaser.Time.TimerEvent
  private gameComplete = false

  constructor() {
    super({ key: 'MemoryMatchScene' })
  }

  create() {
    this.cards = []
    this.flippedCards = []
    this.score = 0
    this.moves = 0
    this.matchCount = 0
    this.isLocked = false
    this.gameComplete = false
    this.startTime = this.time.now

    this.generateTextures()

    this.scoreText = this.add.text(20, 12, 'Score: 0', {
      fontSize: '22px',
      color: '#ffffff',
      fontStyle: 'bold',
    })

    this.movesText = this.add.text(400, 12, 'Moves: 0', {
      fontSize: '22px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0)

    this.timeText = this.add.text(780, 12, 'Time: 0s', {
      fontSize: '22px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(1, 0)

    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true,
    })

    this.createCards()
  }

  private generateTextures() {
    if (!this.textures.exists('card_back')) {
      const gfx = this.make.graphics({ x: 0, y: 0 })
      gfx.fillStyle(0x6a1b9a, 1)
      gfx.fillRoundedRect(0, 0, CARD_W, CARD_H, 12)
      gfx.lineStyle(3, 0xbb66ff, 1)
      gfx.strokeRoundedRect(2, 2, CARD_W - 4, CARD_H - 4, 12)

      const questionMark = this.add.text(CARD_W / 2, CARD_H / 2, '?', {
        fontSize: '64px',
        color: '#bb66ff',
        fontStyle: 'bold',
      }).setOrigin(0.5)

      const rt = this.add.renderTexture(0, 0, CARD_W, CARD_H)
      rt.draw(gfx, 0, 0)
      rt.draw(questionMark, 0, 0)
      rt.saveTexture('card_back')
      rt.destroy()
      questionMark.destroy()
      gfx.destroy()
    }

    for (const sym of SYMBOLS) {
      if (!this.textures.exists(sym.key)) {
        const gfx = this.make.graphics({ x: 0, y: 0 })
        gfx.fillStyle(0x2a2a4a, 1)
        gfx.fillRoundedRect(0, 0, CARD_W, CARD_H, 12)
        gfx.lineStyle(3, sym.color, 0.6)
        gfx.strokeRoundedRect(2, 2, CARD_W - 4, CARD_H - 4, 12)
        sym.draw(gfx, sym.color)
        gfx.generateTexture(sym.key, CARD_W, CARD_H)
        gfx.destroy()
      }
    }
  }

  private createCards() {
    const pairs: number[] = []
    for (let i = 0; i < SYMBOLS.length; i++) {
      pairs.push(i, i)
    }
    this.shuffle(pairs)

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const idx = r * COLS + c
        const symbolIndex = pairs[idx]
        const x = OFFSET_X + c * (CARD_W + GAP) + CARD_W / 2
        const y = OFFSET_Y + r * (CARD_H + GAP) + CARD_H / 2

        const backImage = this.add.image(0, 0, 'card_back')
        const faceImage = this.add.image(0, 0, SYMBOLS[symbolIndex].key)
        faceImage.setVisible(false)

        const container = this.add.container(x, y, [faceImage, backImage])
        container.setSize(CARD_W, CARD_H)
        container.setInteractive()

        const card: Card = {
          symbolIndex,
          faceUp: false,
          matched: false,
          container,
          backImage,
          faceImage,
        }

        container.on('pointerdown', () => this.onCardClick(card))
        container.on('pointerover', () => {
          if (!card.faceUp && !card.matched) {
            container.setScale(1.05)
          }
        })
        container.on('pointerout', () => {
          if (!card.matched) {
            container.setScale(1)
          }
        })

        this.cards.push(card)
      }
    }
  }

  private shuffle(arr: number[]) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]]
    }
  }

  private onCardClick(card: Card) {
    if (this.isLocked || card.faceUp || card.matched || this.gameComplete) return
    if (this.flippedCards.length >= 2) return

    this.flipCard(card, true)
    this.flippedCards.push(card)

    if (this.flippedCards.length === 2) {
      this.moves++
      this.movesText?.setText(`Moves: ${this.moves}`)

      const [first, second] = this.flippedCards

      if (first.symbolIndex === second.symbolIndex) {
        this.score += 100
        this.scoreText?.setText(`Score: ${this.score}`)
        this.matchCount++

        this.time.delayedCall(300, () => {
          this.addGlow(first)
          this.addGlow(second)
          this.flippedCards = []

          if (this.matchCount === SYMBOLS.length) {
            this.time.delayedCall(500, () => this.showComplete())
          }
        })
      } else {
        this.isLocked = true
        this.time.delayedCall(800, () => {
          this.flipCard(first, false)
          this.flipCard(second, false)
          this.flippedCards = []
          this.isLocked = false
        })
      }
    }
  }

  private flipCard(card: Card, toFaceUp: boolean) {
    this.tweens.add({
      targets: card.container,
      scaleX: 0,
      duration: 120,
      ease: 'Linear',
      onComplete: () => {
        card.faceUp = toFaceUp
        card.backImage.setVisible(!toFaceUp)
        card.faceImage.setVisible(toFaceUp)
        if (toFaceUp) card.matched = card.matched

        this.tweens.add({
          targets: card.container,
          scaleX: 1,
          duration: 120,
          ease: 'Linear',
        })
      },
    })
  }

  private addGlow(card: Card) {
    card.matched = true
    const color = SYMBOLS[card.symbolIndex].color

    const glow = this.add.graphics()
    const localX = -CARD_W / 2 - 4
    const localY = -CARD_H / 2 - 4
    glow.lineStyle(4, color, 0.8)
    glow.strokeRoundedRect(localX, localY, CARD_W + 8, CARD_H + 8, 14)
    card.container.add(glow)

    this.tweens.add({
      targets: glow,
      alpha: { from: 1, to: 0.3 },
      duration: 800,
      yoyo: true,
      repeat: -1,
    })
  }

  private updateTimer() {
    if (this.gameComplete) return
    const elapsed = Math.floor((this.time.now - this.startTime) / 1000)
    this.timeText?.setText(`Time: ${elapsed}s`)
  }

  private showComplete() {
    this.gameComplete = true
    this.timerEvent?.destroy()

    const elapsed = Math.floor((this.time.now - this.startTime) / 1000)
    const finalScore = Math.max(0, this.score - (this.moves * 5) - (elapsed * 2))

    const overlay = this.add.graphics()
    overlay.fillStyle(0x000000, 0.7)
    overlay.fillRect(0, 0, 800, 600)

    this.add.text(400, 200, 'All Pairs Found!', {
      fontSize: '44px',
      color: '#00ff88',
      fontStyle: 'bold',
    }).setOrigin(0.5)

    this.add.text(400, 270, `Moves: ${this.moves}`, {
      fontSize: '26px',
      color: '#ffffff',
    }).setOrigin(0.5)

    this.add.text(400, 310, `Time: ${elapsed}s`, {
      fontSize: '26px',
      color: '#ffffff',
    }).setOrigin(0.5)

    this.add.text(400, 360, `Final Score: ${finalScore}`, {
      fontSize: '32px',
      color: '#ffd700',
      fontStyle: 'bold',
    }).setOrigin(0.5)

    this.add.text(400, 430, 'Click to Play Again', {
      fontSize: '24px',
      color: '#aaaaaa',
    }).setOrigin(0.5)

    this.input.once('pointerdown', () => {
      this.scene.restart()
    })
  }
}

export default {
  metadata: {
    slug: 'memory-match',
    title: 'Memory Match',
    description: 'Test your memory! Flip cards to find matching pairs. Fewer moves = higher score!',
    thumbnailUrl: '/games/memory-match/thumbnail.png',
    category: 'Puzzle',
    tags: ['memory', 'puzzle', 'cards', 'brain'],
    developerName: 'Game Portal Team',
    packageName: 'memory-match',
    version: '1.0.0',
  },
  createGame: (containerId: string) => {
    return new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerId,
      width: 800,
      height: 600,
      backgroundColor: '#1a1a2e',
      scene: [MemoryMatchScene],
    })
  },
}
