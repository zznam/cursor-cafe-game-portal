import * as Phaser from 'phaser'

class DungeonCrawlerMinerScene extends Phaser.Scene {
  constructor() {
    super({ key: 'dungeon-crawler-minerScene' })
  }

  create() {
    this.add.text(400, 300, 'Dungeon Crawler Miner\nComing Soon...', {
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
    slug: 'dungeon-crawler-miner',
    title: 'Dungeon Crawler Miner',
    description: 'Dig down into a grid-based mine.',
    thumbnailUrl: '/games/dungeon-crawler-miner/thumbnail.png',
    category: 'Adventure',
    tags: ['rpg', 'mining'],
    developerName: 'Game Portal Team',
    packageName: 'dungeon-crawler-miner',
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
      scene: [DungeonCrawlerMinerScene]
    })
  }
}
