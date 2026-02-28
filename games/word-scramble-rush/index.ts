import * as Phaser from 'phaser'

class WordScrambleScene extends Phaser.Scene {
  private words = [
    'PHASER', 'DRAGON', 'PORTAL', 'ARCADE', 'PUZZLE', 'KNIGHT', 'ROCKET',
    'GALAXY', 'PLANET', 'TURBO', 'BLAZE', 'STORM', 'PIXEL', 'QUEST',
    'CYBER', 'NINJA', 'MAGIC', 'FLAME', 'SWORD', 'TOWER', 'ARENA',
    'COMET', 'DRIFT', 'LEVEL', 'POWER', 'BONUS', 'COMBO', 'PRIME',
  ]
  private currentWord = ''
  private scrambled = ''
  private userInput = ''
  private score = 0
  private timeLeft = 60
  private scoreText?: Phaser.GameObjects.Text
  private timerText?: Phaser.GameObjects.Text
  private scrambledText?: Phaser.GameObjects.Text
  private inputText?: Phaser.GameObjects.Text
  private feedbackText?: Phaser.GameObjects.Text
  private gameOver = false
  private timerEvent?: Phaser.Time.TimerEvent

  constructor() {
    super({ key: 'WordScrambleScene' })
  }

  create() {
    this.score = 0
    this.timeLeft = 60
    this.userInput = ''
    this.gameOver = false

    this.add.text(400, 40, 'Word Scramble Rush', {
      fontSize: '32px', color: '#ff0', fontFamily: 'monospace',
    }).setOrigin(0.5)

    this.scoreText = this.add.text(650, 40, 'Score: 0', {
      fontSize: '22px', color: '#0ff', fontFamily: 'monospace',
    }).setOrigin(0.5)

    this.timerText = this.add.text(150, 40, 'Time: 60', {
      fontSize: '22px', color: '#f44', fontFamily: 'monospace',
    }).setOrigin(0.5)

    this.scrambledText = this.add.text(400, 220, '', {
      fontSize: '64px', color: '#fff', fontFamily: 'monospace', letterSpacing: 12,
    }).setOrigin(0.5)

    this.inputText = this.add.text(400, 350, '', {
      fontSize: '48px', color: '#0f0', fontFamily: 'monospace', letterSpacing: 8,
    }).setOrigin(0.5)

    this.feedbackText = this.add.text(400, 430, '', {
      fontSize: '24px', color: '#ff0', fontFamily: 'monospace',
    }).setOrigin(0.5)

    this.add.text(400, 520, 'Type the unscrambled word and press ENTER', {
      fontSize: '16px', color: '#888', fontFamily: 'monospace',
    }).setOrigin(0.5)
    this.add.text(400, 550, 'Press BACKSPACE to delete, TAB to skip', {
      fontSize: '14px', color: '#666', fontFamily: 'monospace',
    }).setOrigin(0.5)

    this.nextWord()

    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.timeLeft--
        this.timerText?.setText(`Time: ${this.timeLeft}`)
        if (this.timeLeft <= 10) this.timerText?.setColor('#ff0000')
        if (this.timeLeft <= 0) this.endGame()
      },
      loop: true,
    })

    this.setupKeyboard()
  }

  private setupKeyboard() {
    for (let i = 65; i <= 90; i++) {
      const letter = String.fromCharCode(i)
      this.input.keyboard?.on(`keydown-${letter}`, () => {
        if (this.gameOver) return
        if (this.userInput.length < this.currentWord.length) {
          this.userInput += letter
          this.inputText?.setText(this.userInput)
        }
      })
    }

    this.input.keyboard?.on('keydown-BACKSPACE', () => {
      if (this.gameOver) return
      this.userInput = this.userInput.slice(0, -1)
      this.inputText?.setText(this.userInput)
    })

    this.input.keyboard?.on('keydown-ENTER', () => {
      if (this.gameOver) {
        this.scene.restart()
        return
      }
      this.checkAnswer()
    })

    this.input.keyboard?.on('keydown-TAB', (e: KeyboardEvent) => {
      e.preventDefault()
      if (this.gameOver) return
      this.feedbackText?.setText(`Skipped! It was: ${this.currentWord}`).setColor('#ff8800')
      this.userInput = ''
      this.inputText?.setText('')
      this.time.delayedCall(800, () => this.nextWord())
    })
  }

  nextWord() {
    this.currentWord = Phaser.Utils.Array.GetRandom(this.words)
    this.scrambled = this.shuffleWord(this.currentWord)
    while (this.scrambled === this.currentWord) {
      this.scrambled = this.shuffleWord(this.currentWord)
    }
    this.scrambledText?.setText(this.scrambled)
    this.userInput = ''
    this.inputText?.setText('')
    this.feedbackText?.setText('')
  }

  shuffleWord(word: string): string {
    const arr = word.split('')
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
        ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr.join('')
  }

  checkAnswer() {
    if (this.userInput.toUpperCase() === this.currentWord) {
      this.score += 100
      this.scoreText?.setText(`Score: ${this.score}`)
      this.feedbackText?.setText('Correct!').setColor('#00ff00')
      this.time.delayedCall(500, () => this.nextWord())
    } else {
      this.feedbackText?.setText('Wrong! Try again.').setColor('#ff4444')
      this.userInput = ''
      this.inputText?.setText('')
    }
  }

  endGame() {
    this.gameOver = true
    this.timerEvent?.remove()
    this.add.text(400, 260, "Time's Up!", { fontSize: '48px', color: '#ff4444', fontStyle: 'bold' }).setOrigin(0.5)
    this.add.text(400, 320, `Final Score: ${this.score}`, { fontSize: '32px', color: '#fff' }).setOrigin(0.5)
    this.add.text(400, 380, 'Press ENTER to Restart', { fontSize: '20px', color: '#aaa' }).setOrigin(0.5)
  }
}

export default {
  metadata: {
    slug: 'word-scramble-rush',
    title: 'Word Scramble Rush',
    description: '60-second typing and anagram puzzle. Unscramble words as fast as you can!',
    thumbnailUrl: '/games/word-scramble-rush/thumbnail.png',
    category: 'Puzzle',
    tags: ['word', 'typing'],
    developerName: 'Game Portal Team',
    packageName: 'word-scramble-rush',
    version: '1.0.0',
  },
  createGame: (containerId: string) => {
    return new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerId,
      width: 800,
      height: 600,
      backgroundColor: '#1a0a2e',
      scene: [WordScrambleScene],
    })
  },
}
