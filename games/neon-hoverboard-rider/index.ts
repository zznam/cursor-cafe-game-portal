import * as Phaser from 'phaser'

class NeonHoverboardRiderScene extends Phaser.Scene {
  constructor() {
    super({ key: 'neon-hoverboard-riderScene' })
  }

  create() {
    this.add.text(400, 300, 'Neon Hoverboard Rider\nComing Soon...', {
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
    slug: 'neon-hoverboard-rider',
    title: 'Neon Hoverboard Rider',
    description: 'Time your jumps to grind rails and avoid gaps.',
    thumbnailUrl: '/games/neon-hoverboard-rider/thumbnail.png',
    category: 'Racing',
    tags: ['side-scroller', 'racing'],
    developerName: 'Game Portal Team',
    packageName: 'neon-hoverboard-rider',
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
      scene: [NeonHoverboardRiderScene]
    })
  }
}
