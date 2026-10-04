import * as Phaser from 'phaser'
import type { CafeGame, GameResult } from '@/lib/daily'
import { hashSeed, seededRandom } from '@/lib/daily'
import { INPUT_CANCEL_EVENT, type GameRuntime } from '@/lib/game-runtime'
import {
  createPipes,
  rotatePipe,
  pipesConnected,
  pieceAt,
  placePiece,
  hasPlacement,
  stackOverlap,
  orbitObstacle,
  orbitRunResult,
} from '@/lib/cafe-rules'

const INK = '#52352b',
  CREAM = 0xfff6df,
  COFFEE = 0x70452e,
  PEACH = 0xeaae8d,
  MINT = 0x68a899
export function createCafeGame(
  containerId: string,
  slug: CafeGame,
  title: string,
  runtime: GameRuntime = {},
) {
  const seed = runtime.daily?.seed ?? hashSeed(`${Date.now()}:${Math.random()}`)
  class CafeScene extends Phaser.Scene {
    private art!: Phaser.GameObjects.Graphics
    private status!: Phaser.GameObjects.Text
    private hint!: Phaser.GameObjects.Text
    private active = false
    private ended = false
    private elapsed = 0
    private accumulator = 0
    private selected = 0
    private moves = 0
    private pipes = createPipes(seed)
    private board = Array<number>(64).fill(0)
    private pieceIndex = 0
    private dragging = false
    private dragX = 300
    private dragY = 550
    private score = 0
    private tower = [{ center: 300, width: 300 }]
    private cupX = 150
    private direction = 1
    private orbitAngle = -Math.PI / 2
    private orbitDirection = 1
    private obstacles: { angle: number; radius: number; speed: number }[] = []
    private spawned = 0
    private audioContext?: AudioContext
    constructor() {
      super({ key: 'CafeScene' })
    }
    create() {
      this.cameras.main.setBackgroundColor(CREAM)
      this.art = this.add.graphics()
      this.add
        .text(300, 25, title, {
          fontFamily: 'Georgia, serif',
          fontSize: '34px',
          color: INK,
          fontStyle: 'bold',
        })
        .setOrigin(0.5)
      this.status = this.add
        .text(300, 72, '', { fontSize: '22px', color: INK })
        .setOrigin(0.5)
      this.hint = this.add
        .text(300, 600, '', {
          fontSize: '20px',
          color: INK,
          align: 'center',
          wordWrap: { width: 550 },
        })
        .setOrigin(0.5)
      const cancelDrag = () => {
        this.dragging = false
        if (!this.ended) this.renderBoard()
      }
      this.input.on(INPUT_CANCEL_EVENT, cancelDrag)
      this.input.on('pointerupoutside', cancelDrag)
      this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
        if (slug === 'coffee-connections') {
          const col = Math.floor((p.x - 100) / 80),
            row = Math.floor((p.y - 135) / 80)
          if (col >= 0 && col < 5 && row >= 0 && row < 5) {
            this.selected = row * 5 + col
            this.action()
          }
        } else if (slug === 'pastry-blocks') {
          this.dragging = p.y > 530
          this.dragX = p.x
          this.dragY = p.y
        } else this.action()
      })
      this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
        if (this.dragging && !this.ended) {
          this.dragX = p.x
          this.dragY = p.y
          this.renderBoard()
        }
      })
      this.input.on('pointerup', (p: Phaser.Input.Pointer) => {
        if (slug !== 'pastry-blocks' || this.ended) return
        if (p.wasCanceled) {
          cancelDrag()
          return
        }
        this.dragging = false
        this.renderBoard()
        const col = Math.floor((p.x - 100) / 50),
          row = Math.floor((p.y - 120) / 50)
        if (col >= 0 && col < 8 && row >= 0 && row < 8) {
          this.selected = row * 8 + col
          this.action()
        }
      })
      this.input.keyboard?.on('keydown', (e: KeyboardEvent) => {
        if (e.repeat || this.ended) return
        const size = slug === 'coffee-connections' ? 5 : 8
        if (
          ['coffee-connections', 'pastry-blocks'].includes(slug) &&
          e.key.startsWith('Arrow')
        ) {
          const x = this.selected % size,
            y = Math.floor(this.selected / size)
          this.selected =
            Phaser.Math.Clamp(
              y + (e.key === 'ArrowUp' ? -1 : e.key === 'ArrowDown' ? 1 : 0),
              0,
              size - 1,
            ) *
              size +
            Phaser.Math.Clamp(
              x + (e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : 0),
              0,
              size - 1,
            )
          this.renderBoard()
        }
        if (e.key === ' ' || e.key === 'Enter') this.action()
      })
      this.events.once('shutdown', () => {
        void this.audioContext?.close()
      })
      this.renderBoard()
      runtime.onReady?.()
    }
    private chime() {
      if (!runtime.soundEnabled?.()) return
      try {
        this.audioContext ??= new AudioContext()
        void this.audioContext.resume()
        const oscillator = this.audioContext.createOscillator(),
          gain = this.audioContext.createGain()
        oscillator.type = 'sine'
        oscillator.frequency.value = 440 + (this.moves % 4) * 110
        gain.gain.setValueAtTime(0.035, this.audioContext.currentTime)
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          this.audioContext.currentTime + 0.12,
        )
        oscillator.connect(gain)
        gain.connect(this.audioContext.destination)
        oscillator.start()
        oscillator.stop(this.audioContext.currentTime + 0.12)
      } catch {
        /* Sound is optional; gameplay never depends on audio availability. */
      }
    }
    private begin() {
      if (!this.active) {
        this.active = true
        runtime.onInteraction?.()
      }
    }
    private finish(result: GameResult) {
      if (this.ended) return
      this.ended = true
      this.status.setText(result.label)
      this.hint.setText('Round complete! Use Play again below.')
      runtime.onResult?.(result)
    }
    private action() {
      if (this.ended) return
      const wasActive = this.active
      this.begin()
      this.chime()
      if (slug === 'coffee-connections') {
        this.pipes.tiles[this.selected] = rotatePipe(
          this.pipes.tiles[this.selected],
        )
        this.moves++
        this.renderBoard()
        if (
          pipesConnected(this.pipes.tiles, 5, this.pipes.start, this.pipes.end)
        )
          this.finish({
            score: this.moves,
            label: `Coffee served in ${this.moves} rotations`,
          })
      } else if (slug === 'pastry-blocks') {
        const result = placePiece(
          this.board,
          pieceAt(seed, this.pieceIndex),
          this.selected % 8,
          Math.floor(this.selected / 8),
        )
        if (!result) {
          this.hint.setText('That piece needs more room. Try another spot.')
          return
        }
        this.board = result.board
        this.score += result.score
        this.pieceIndex++
        this.renderBoard()
        if (
          (runtime.daily && this.pieceIndex >= 30) ||
          !hasPlacement(this.board, pieceAt(seed, this.pieceIndex))
        )
          this.finish({
            score: this.score,
            label: `${this.score} points · ${this.pieceIndex} pastries placed`,
          })
      } else if (slug === 'cup-stack') {
        if (!wasActive) {
          this.renderBoard()
          return
        }
        const previous = this.tower[this.tower.length - 1]
        const placed = stackOverlap(this.cupX, previous.center, previous.width)
        if (placed.width <= 0) {
          this.finish({
            score: this.tower.length - 1,
            secondary: previous.width,
            label: `${this.tower.length - 1} layers · ${Math.round(previous.width)} width`,
          })
          return
        }
        const trimmed = previous.width - placed.width
        if (
          trimmed > 0 &&
          !window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ) {
          const side = this.cupX < previous.center ? -1 : 1
          const fragment = this.add.rectangle(
            this.cupX + (side * (previous.width - trimmed)) / 2,
            544 - Math.min(this.tower.length, 10) * 34,
            trimmed,
            29,
            COFFEE,
          )
          this.tweens.add({
            targets: fragment,
            y: fragment.y + 240,
            angle: side * 35,
            alpha: 0,
            duration: 600,
            ease: 'Quad.easeIn',
            onComplete: () => fragment.destroy(),
          })
        }
        this.tower.push(placed)
        this.cupX = placed.width / 2
        this.direction = 1
        this.renderBoard()
        if (runtime.daily && this.tower.length === 31)
          this.finish({
            score: 30,
            secondary: placed.width,
            label: `30 layers · ${Math.round(placed.width)} width`,
          })
      } else {
        if (wasActive) this.orbitDirection *= -1
        this.renderBoard()
      }
    }
    update(_time: number, delta: number) {
      if (
        !this.active ||
        this.ended ||
        !['cup-stack', 'sugar-orbit'].includes(slug)
      )
        return
      this.accumulator += Math.min(delta, 100)
      while (this.accumulator >= 1000 / 60 && !this.ended) {
        this.step(1 / 60)
        this.accumulator -= 1000 / 60
      }
      if (!this.ended) this.renderBoard()
    }
    private step(dt: number) {
      this.elapsed += dt
      if (slug === 'cup-stack') {
        const width = this.tower[this.tower.length - 1].width
        const speed = 130 + seededRandom(seed + this.tower.length)() * 120
        this.cupX += this.direction * speed * dt
        if (this.cupX > 570 - width / 2) {
          this.cupX = 570 - width / 2
          this.direction = -1
        }
        if (this.cupX < 30 + width / 2) {
          this.cupX = 30 + width / 2
          this.direction = 1
        }
      } else {
        const completed = orbitRunResult(this.elapsed, false, !!runtime.daily)
        if (completed) {
          this.elapsed = 90
          this.finish(completed)
          return
        }
        this.orbitAngle += this.orbitDirection * 1.8 * dt
        const next = orbitObstacle(seed, this.spawned)
        if (this.elapsed >= next.spawn) {
          this.obstacles.push({ ...next, radius: 310 })
          this.spawned++
        }
        for (const item of this.obstacles) {
          item.radius -= item.speed * dt
          const distance = Math.hypot(
            Math.cos(item.angle) * item.radius -
              Math.cos(this.orbitAngle) * 145,
            Math.sin(item.angle) * item.radius -
              Math.sin(this.orbitAngle) * 145,
          )
          if (distance < 24) {
            this.finish(orbitRunResult(this.elapsed, true, !!runtime.daily)!)
            return
          }
        }
        this.obstacles = this.obstacles.filter((o) => o.radius > 70)
      }
    }
    private cup(x: number, y: number, size: number) {
      const g = this.art
      g.lineStyle(6, COFFEE, 0.6)
      g.strokeCircle(x + size * 0.42, y, size * 0.22)
      g.fillStyle(0xffffff)
      g.fillRoundedRect(x - size / 2, y - size * 0.4, size, size * 0.8, 12)
      g.fillStyle(COFFEE)
      g.fillEllipse(x, y - size * 0.28, size * 0.8, size * 0.2)
    }
    private renderBoard() {
      const g = this.art
      g.clear()
      g.fillStyle(0xf2dfc2)
      g.fillRoundedRect(24, 105, 552, 457, 26)
      if (slug === 'coffee-connections') {
        this.status.setText(`${this.moves} rotations · take your time`)
        this.hint.setText('Tap a tile to rotate · arrows + Enter also work')
        this.pipes.tiles.forEach((mask, i) => {
          const x = 100 + (i % 5) * 80,
            y = 135 + Math.floor(i / 5) * 80
          g.fillStyle(i === this.selected ? 0xecc58d : 0xfff8ec)
          g.fillRoundedRect(x + 3, y + 3, 74, 74, 12)
          g.lineStyle(12, COFFEE)
          g.beginPath()
          for (const [bit, dx, dy] of [
            [1, 0, -40],
            [2, 40, 0],
            [4, 0, 40],
            [8, -40, 0],
          ])
            if (mask & bit) {
              g.moveTo(x + 40, y + 40)
              g.lineTo(x + 40 + dx, y + 40 + dy)
            }
          g.strokePath()
          g.fillStyle(COFFEE)
          g.fillCircle(x + 40, y + 40, 9)
        })
        g.fillStyle(MINT)
        g.fillRoundedRect(40, 150 + this.pipes.start * 80, 52, 48, 10)
        this.cup(537, 175 + this.pipes.end * 80, 46)
      } else if (slug === 'pastry-blocks') {
        this.status.setText(
          `${this.score} points · piece ${this.pieceIndex + 1}${runtime.daily ? '/30' : ''}`,
        )
        this.hint
          .setPosition(300, 694)
          .setFontSize(18)
          .setText('Tap a cell or drag the pastry · arrows + Enter')
        this.board.forEach((filled, i) => {
          const x = 100 + (i % 8) * 50,
            y = 120 + Math.floor(i / 8) * 50
          g.fillStyle(
            filled ? PEACH : i === this.selected ? 0xc3dcd0 : 0xfff8ec,
          )
          g.fillRoundedRect(x + 2, y + 2, 46, 46, 8)
          if (filled) {
            g.lineStyle(2, COFFEE, 0.5)
            g.strokeRoundedRect(x + 8, y + 8, 34, 34, 6)
          }
        })
        g.fillStyle(0xf2dfc2)
        g.fillRoundedRect(80, 530, 440, 140, 16)
        if (this.dragging) {
          const col = Math.floor((this.dragX - 100) / 50),
            row = Math.floor((this.dragY - 120) / 50)
          g.fillStyle(MINT, 0.6)
          for (const [dx, dy] of pieceAt(seed, this.pieceIndex)) {
            if (col + dx >= 0 && col + dx < 8 && row + dy >= 0 && row + dy < 8)
              g.fillRoundedRect(
                102 + (col + dx) * 50,
                122 + (row + dy) * 50,
                46,
                46,
                8,
              )
          }
        }
        for (const [dx, dy] of pieceAt(seed, this.pieceIndex)) {
          g.fillStyle(PEACH)
          g.fillRoundedRect(248 + dx * 42, 536 + dy * 42, 38, 38, 8)
        }
      } else if (slug === 'cup-stack') {
        this.status.setText(
          `${this.tower.length - 1} layers${runtime.daily ? ' / 30' : ''}`,
        )
        this.hint.setText(
          this.active
            ? 'Tap / Space to stack · keep the overlap!'
            : 'Tap / Space to start the stack',
        )
        const visible = this.tower.slice(-10)
        visible.forEach((cup, i) => {
          g.fillStyle(i % 2 ? PEACH : MINT)
          g.fillRoundedRect(
            cup.center - cup.width / 2,
            530 - i * 34,
            cup.width,
            29,
            5,
          )
          g.lineStyle(2, 0xffffff, 0.8)
          g.lineBetween(
            cup.center - cup.width / 2 + 4,
            535 - i * 34,
            cup.center + cup.width / 2 - 4,
            535 - i * 34,
          )
        })
        const width = this.tower[this.tower.length - 1].width
        g.fillStyle(COFFEE)
        g.fillRoundedRect(
          this.cupX - width / 2,
          530 - visible.length * 34,
          width,
          29,
          5,
        )
      } else {
        this.status.setText(
          `${this.elapsed.toFixed(1)} seconds${runtime.daily ? ' / 90' : ''}`,
        )
        this.hint.setText(
          this.active
            ? 'Tap / Space to reverse · dodge the sugar cubes'
            : 'Tap / Space to begin your orbit',
        )
        g.lineStyle(3, MINT, 0.6)
        g.strokeCircle(300, 330, 145)
        this.cup(300, 330, 130)
        for (const o of this.obstacles) {
          const x = 300 + Math.cos(o.angle) * o.radius,
            y = 330 + Math.sin(o.angle) * o.radius
          g.fillStyle(0xbe735c)
          g.fillRoundedRect(x - 12, y - 12, 24, 24, 4)
        }
        g.fillStyle(MINT)
        g.fillCircle(
          300 + Math.cos(this.orbitAngle) * 145,
          330 + Math.sin(this.orbitAngle) * 145,
          13,
        )
        g.fillStyle(0xffffff)
        g.fillCircle(
          297 + Math.cos(this.orbitAngle) * 145,
          327 + Math.sin(this.orbitAngle) * 145,
          4,
        )
      }
    }
  }
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent: containerId,
    width: 600,
    height: slug === 'pastry-blocks' ? 720 : 640,
    backgroundColor: CREAM,
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [CafeScene],
    audio: { noAudio: true },
  })
}
