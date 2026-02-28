import * as Phaser from 'phaser'

class DriftKing2dScene extends Phaser.Scene {
  constructor() {
    super({ key: 'drift-king-2dScene' })
  }

  create() {
    this.add.text(400, 300, 'Drift King 2D\nComing Soon...', {
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
    slug: 'drift-king-2d',
    title: 'Drift King 2D',
    description: 'Top-down racing game focusing heavily on drifting.',
    thumbnailUrl: '/games/drift-king-2d/thumbnail.png',
    category: 'Racing',
    tags: ['driving', 'drifting'],
    developerName: 'Game Portal Team',
    packageName: 'drift-king-2d',
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
      scene: [DriftKing2dScene]
    })
  }
}
