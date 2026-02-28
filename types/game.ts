import * as Phaser from 'phaser'

export interface GameMetadata {
  id: string
  slug: string
  title: string
  description: string
  thumbnailUrl: string
  bannerUrl?: string
  category: string
  tags: string[]
  developerName: string
  developerUrl?: string
  packageName: string
  version: string
  playCount: number
  averageRating: number
  totalRatings: number
  featured: boolean
  createdAt: string
  updatedAt: string
}

export interface GameConfig {
  metadata: GameMetadata
  phaserConfig: Phaser.Types.Core.GameConfig
}

export interface PhaserGameModule {
  default: {
    metadata: Omit<GameMetadata, 'id' | 'playCount' | 'averageRating' | 'totalRatings' | 'createdAt' | 'updatedAt'>
    createGame: (containerId: string) => Phaser.Game
  }
}

export interface LeaderboardEntry {
  id: string
  gameId: string
  userId: string
  username: string
  score: number
  metadata?: Record<string, any>
  createdAt: string
}

export interface Rating {
  id: string
  gameId: string
  userId: string
  rating: number
  review?: string
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: string
  gameId: string
  userId: string
  username: string
  content: string
  createdAt: string
  updatedAt: string
}

export interface AnalyticsEvent {
  gameId: string
  eventType: 'play' | 'complete' | 'quit' | 'score_submit'
  userId?: string
  sessionId: string
  metadata?: Record<string, any>
}

export const GAME_CATEGORIES = [
  'Action',
  'Arcade',
  'Puzzle',
  'Strategy',
  'Adventure',
  'Platformer',
  'Shooter',
  'Racing',
  'Sports',
  'Other'
] as const

export type GameCategory = typeof GAME_CATEGORIES[number]
