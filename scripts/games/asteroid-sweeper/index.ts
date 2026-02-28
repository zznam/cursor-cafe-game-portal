import * as Phaser from 'phaser'

class AsteroidSweeperScene extends Phaser.Scene {
  constructor() {
    super({ key: 'asteroid-sweeperScene' })
  }

  create() {
    this.add.text(400, 300, 'Asteroid Sweeper\nComing Soon...', {
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
    slug: 'asteroid-sweeper',
    title: 'Asteroid Sweeper',
    description: 'Top-down shooter where players clear asteroid fields.',
    thumbnailUrl: '/games/asteroid-sweeper/thumbnail.png',
    category: 'Action',
    tags: ['arcade', 'space'],
    developerName: 'Game Portal Team',
    packageName: 'asteroid-sweeper',
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
      scene: [AsteroidSweeperScene]
    })
  }
}
