import * as Phaser from 'phaser'

class NeonPongPvpScene extends Phaser.Scene {
  constructor() {
    super({ key: 'neon-pong-pvpScene' })
  }

  create() {
    this.add.text(400, 300, 'Neon Pong PvP\nComing Soon...', {
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
    slug: 'neon-pong-pvp',
    title: 'Neon Pong PvP',
    description: 'A competitive pong game featuring dynamic paddles.',
    thumbnailUrl: '/games/neon-pong-pvp/thumbnail.png',
    category: 'Sports',
    tags: ['arcade', 'pong'],
    developerName: 'Game Portal Team',
    packageName: 'neon-pong-pvp',
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
      scene: [NeonPongPvpScene]
    })
  }
}
