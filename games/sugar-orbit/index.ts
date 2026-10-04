import { createCafeGame } from '@/lib/games/cafe-scene'
import type { GameRuntime } from '@/lib/game-runtime'

const game = {
  metadata: {
    slug: 'sugar-orbit',
    title: 'Sugar Orbit',
    description:
      'Circle your coffee cup and tap to reverse direction. Dodge the incoming sugar cubes!',
    thumbnailUrl: '/games/sugar-orbit/thumbnail.svg',
    category: 'Arcade',
    tags: ['café', 'touch', 'daily'],
    developerName: 'Cursor Café',
    packageName: 'sugar-orbit',
    version: '1.0.0',
    featured: true,
  },
  createGame: (containerId: string, runtime?: GameRuntime) =>
    createCafeGame(containerId, 'sugar-orbit', 'Sugar Orbit', runtime),
}

export default game
