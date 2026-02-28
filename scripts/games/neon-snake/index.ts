import * as Phaser from 'phaser'

class NeonSnakeScene extends Phaser.Scene {
  constructor() {
    super({ key: 'neon-snakeScene' })
  }

  create() {
    this.add.text(400, 300, 'Neon Snake\nComing Soon...', {
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
    slug: 'neon-snake',
    title: 'Neon Snake',
    description: 'A modern, neon-drenched take on the classic Snake game.',
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
      backgroundColor: '#1a1a2e',
      physics: {
        default: 'arcade',
        arcade: { gravity: { x: 0, y: 0 }, debug: false }
      },
      scene: [NeonSnakeScene]
    })
  }
}
