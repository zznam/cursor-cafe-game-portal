import * as Phaser from 'phaser'

class EndlessHighwayRiderScene extends Phaser.Scene {
  constructor() {
    super({ key: 'endless-highway-riderScene' })
  }

  create() {
    this.add.text(400, 300, 'Endless Highway Rider\nComing Soon...', {
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
    slug: 'endless-highway-rider',
    title: 'Endless Highway Rider',
    description: 'Outrun traffic on a motorcycle on an isometric highway.',
    thumbnailUrl: '/games/endless-highway-rider/thumbnail.png',
    category: 'Racing',
    tags: ['driving', 'retro'],
    developerName: 'Game Portal Team',
    packageName: 'endless-highway-rider',
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
      scene: [EndlessHighwayRiderScene]
    })
  }
}
