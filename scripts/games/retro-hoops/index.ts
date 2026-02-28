import * as Phaser from 'phaser'

class RetroHoopsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'retro-hoopsScene' })
  }

  create() {
    this.add.text(400, 300, 'Retro Hoops\nComing Soon...', {
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
    slug: 'retro-hoops',
    title: 'Retro Hoops',
    description: 'Shoot a basketball into a moving hoop.',
    thumbnailUrl: '/games/retro-hoops/thumbnail.png',
    category: 'Sports',
    tags: ['physics', 'basketball'],
    developerName: 'Game Portal Team',
    packageName: 'retro-hoops',
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
      scene: [RetroHoopsScene]
    })
  }
}
