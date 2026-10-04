import { createCafeGame } from '@/lib/games/cafe-scene'
import type { GameRuntime } from '@/lib/game-runtime'

const game = {
  metadata: {
    slug: 'coffee-connections',
    title: 'Coffee Connections',
    description:
      'Rotate the pipes to brew a path from the coffee machine to your cup. Take your time!',
    thumbnailUrl: '/games/coffee-connections/thumbnail.svg',
    category: 'Puzzle',
    tags: ['café', 'touch', 'daily'],
    developerName: 'Cursor Café',
    packageName: 'coffee-connections',
    version: '1.0.0',
    featured: true,
  },
  createGame: (containerId: string, runtime?: GameRuntime) =>
    createCafeGame(
      containerId,
      'coffee-connections',
      'Coffee Connections',
      runtime,
    ),
}

export default game
