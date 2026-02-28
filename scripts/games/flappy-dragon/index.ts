import * as Phaser from 'phaser'

class FlappyDragonScene extends Phaser.Scene {
  constructor() {
    super({ key: 'flappy-dragonScene' })
  }

  create() {
    this.add.text(400, 300, 'Flappy Dragon\nComing Soon...', {
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
    slug: 'flappy-dragon',
    title: 'Flappy Dragon',
    description: 'Navigate a flying dragon through volcanic pillars.',
    thumbnailUrl: '/games/flappy-dragon/thumbnail.png',
    category: 'Platformer',
    tags: ['arcade', 'flying'],
    developerName: 'Game Portal Team',
    packageName: 'flappy-dragon',
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
      scene: [FlappyDragonScene]
    })
  }
}
