import { createCafeGame } from '@/lib/games/cafe-scene'
import type { GameRuntime } from '@/lib/game-runtime'

const game = {
  metadata: {
    slug: 'pastry-blocks',
    title: 'Pastry Blocks',
    description:
      'Fit pastries onto the tray, clear rows and columns, and make room for the next treat.',
    thumbnailUrl: '/games/pastry-blocks/thumbnail.svg',
    category: 'Puzzle',
    tags: ['café', 'touch', 'daily'],
    developerName: 'Cursor Café',
    packageName: 'pastry-blocks',
    version: '1.0.0',
    featured: true,
  },
  createGame: (containerId: string, runtime?: GameRuntime) =>
    createCafeGame(containerId, 'pastry-blocks', 'Pastry Blocks', runtime),
}

export default game
