import * as Phaser from 'phaser'

class SudokuZenScene extends Phaser.Scene {
  constructor() {
    super({ key: 'sudoku-zenScene' })
  }

  create() {
    this.add.text(400, 300, 'Sudoku Zen\nComing Soon...', {
      fontSize: '48px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5)
  }

  update() {
    // Game loop
  }
}

export default {
  metadata: {
    slug: 'sudoku-zen',
    title: 'Sudoku Zen',
    description: 'A relaxing Sudoku game with minimalist graphics.',
    thumbnailUrl: '/games/sudoku-zen/thumbnail.png',
    category: 'Puzzle',
    tags: ['logic', 'relaxing'],
    developerName: 'Game Portal Team',
    packageName: 'sudoku-zen',
    version: '1.0.0',
  },
  createGame: (containerId: string) => {
    return new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerId,
      width: 800,
      height: 600,
      backgroundColor: '#1a1a2e',
      physics: {
        default: 'arcade',
        arcade: { gravity: { x: 0, y: 0 }, debug: false }
      },
      scene: [SudokuZenScene]
    })
  }
}
