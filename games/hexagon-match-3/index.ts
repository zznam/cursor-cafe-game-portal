import * as Phaser from 'phaser'

class HexagonMatch3Scene extends Phaser.Scene {
  constructor() {
    super({ key: 'hexagon-match-3Scene' })
  }

  create() {
    this.add.text(400, 300, 'Hexagon Match 3\nComing Soon...', {
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
    slug: 'hexagon-match-3',
    title: 'Hexagon Match 3',
    description: 'A Match-3 game played on a hexagonal grid.',
    thumbnailUrl: '/games/hexagon-match-3/thumbnail.png',
    category: 'Puzzle',
    tags: ['casual', 'matching'],
    developerName: 'Game Portal Team',
    packageName: 'hexagon-match-3',
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
      scene: [HexagonMatch3Scene]
    })
  }
}
