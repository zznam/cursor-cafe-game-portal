import * as Phaser from 'phaser'

class PixelNinjaDashScene extends Phaser.Scene {
  constructor() {
    super({ key: 'pixel-ninja-dashScene' })
  }

  create() {
    this.add.text(400, 300, 'Pixel Ninja Dash\nComing Soon...', {
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
    slug: 'pixel-ninja-dash',
    title: 'Pixel Ninja Dash',
    description: 'Endless auto-runner with shurikens.',
    thumbnailUrl: '/games/pixel-ninja-dash/thumbnail.png',
    category: 'Action',
    tags: ['runner', 'ninja'],
    developerName: 'Game Portal Team',
    packageName: 'pixel-ninja-dash',
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
      scene: [PixelNinjaDashScene]
    })
  }
}
