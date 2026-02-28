import * as Phaser from 'phaser'

class MiniGolfCourseScene extends Phaser.Scene {
  constructor() {
    super({ key: 'mini-golf-courseScene' })
  }

  create() {
    this.add.text(400, 300, 'Mini Golf Course\nComing Soon...', {
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
    slug: 'mini-golf-course',
    title: 'Mini Golf Course',
    description: 'A drag-and-release physics game featuring mini-golf.',
    thumbnailUrl: '/games/mini-golf-course/thumbnail.png',
    category: 'Sports',
    tags: ['physics', 'golf'],
    developerName: 'Game Portal Team',
    packageName: 'mini-golf-course',
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
      scene: [MiniGolfCourseScene]
    })
  }
}
