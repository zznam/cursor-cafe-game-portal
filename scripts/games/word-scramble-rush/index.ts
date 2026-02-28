import * as Phaser from 'phaser'

class WordScrambleRushScene extends Phaser.Scene {
  constructor() {
    super({ key: 'word-scramble-rushScene' })
  }

  create() {
    this.add.text(400, 300, 'Word Scramble Rush\nComing Soon...', {
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
    slug: 'word-scramble-rush',
    title: 'Word Scramble Rush',
    description: '60-second typing and anagram puzzle.',
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
      backgroundColor: '#1a1a2e',
      physics: {
        default: 'arcade',
        arcade: { gravity: { x: 0, y: 0 }, debug: false }
      },
      scene: [WordScrambleRushScene]
    })
  }
}
