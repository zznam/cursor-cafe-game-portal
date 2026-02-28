import * as Phaser from 'phaser'

class PlatformJumperScene extends Phaser.Scene {
  constructor() {
    super({ key: 'platform-jumperScene' })
  }

  create() {
    this.add.text(400, 300, 'Platform Jumper\nComing Soon...', {
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
    slug: 'platform-jumper',
    title: 'Platform Jumper',
    description: 'Endless vertical jumping game.',
    thumbnailUrl: '/games/platform-jumper/thumbnail.png',
    category: 'Platformer',
    tags: ['arcade', 'jumping'],
    developerName: 'Game Portal Team',
    packageName: 'platform-jumper',
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
      scene: [PlatformJumperScene]
    })
  }
}
