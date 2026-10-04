import { createCafeGame } from '@/lib/games/cafe-scene'
import type { GameRuntime } from '@/lib/game-runtime'

const game = {
  metadata: {
    slug: 'cup-stack',
    title: 'Cup Stack',
    description:
      'Time each placement to build a colorful café tower. Keep the overlap to keep climbing!',
    thumbnailUrl: '/games/cup-stack/thumbnail.svg',
    category: 'Arcade',
    tags: ['café', 'touch', 'daily'],
    developerName: 'Cursor Café',
    packageName: 'cup-stack',
    version: '1.0.0',
    featured: true,
  },
  createGame: (containerId: string, runtime?: GameRuntime) =>
    createCafeGame(containerId, 'cup-stack', 'Cup Stack', runtime),
}

export default game
