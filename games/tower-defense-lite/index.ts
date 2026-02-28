import * as Phaser from 'phaser'

class TowerDefenseLiteScene extends Phaser.Scene {
  constructor() {
    super({ key: 'tower-defense-liteScene' })
  }

  create() {
    this.add.text(400, 300, 'Tower Defense Lite\nComing Soon...', {
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
    slug: 'tower-defense-lite',
    title: 'Tower Defense Lite',
    description: 'Build towers along a path to stop waves of enemies.',
    thumbnailUrl: '/games/tower-defense-lite/thumbnail.png',
    category: 'Strategy',
    tags: ['defense', 'tactical'],
    developerName: 'Game Portal Team',
    packageName: 'tower-defense-lite',
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
      scene: [TowerDefenseLiteScene]
    })
  }
}
