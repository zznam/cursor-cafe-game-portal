import { PhaserGameModule } from '@/types/game'

export class GameLoader {
  private static loadedGames = new Map<string, PhaserGameModule['default']>()

  static async loadGame(packageName: string): Promise<PhaserGameModule['default']> {
    if (typeof window === 'undefined') {
      throw new Error('GameLoader can only be used in the browser')
    }

    if (this.loadedGames.has(packageName)) {
      return this.loadedGames.get(packageName)!
    }

    try {
      const gameModule = await import(`@/games/${packageName}`) as PhaserGameModule
      this.loadedGames.set(packageName, gameModule.default)
      return gameModule.default
    } catch (error) {
      console.error(`Failed to load game: ${packageName}`, error)
      throw new Error(`Game "${packageName}" not found`)
    }
  }

  static unloadGame(packageName: string) {
    this.loadedGames.delete(packageName)
  }

  static clearCache() {
    this.loadedGames.clear()
  }
}

export function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function getUserId(): string {
  if (typeof window === 'undefined') return ''
  
  let userId = localStorage.getItem('user_id')
  if (!userId) {
    userId = `anon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('user_id', userId)
  }
  return userId
}

export function getFavorites(): string[] {
  if (typeof window === 'undefined') return []
  
  const favorites = localStorage.getItem('favorites')
  return favorites ? JSON.parse(favorites) : []
}

export function toggleFavorite(gameId: string): boolean {
  const favorites = getFavorites()
  const index = favorites.indexOf(gameId)
  
  if (index > -1) {
    favorites.splice(index, 1)
  } else {
    favorites.push(gameId)
  }
  
  localStorage.setItem('favorites', JSON.stringify(favorites))
  return index === -1
}

export function isFavorite(gameId: string): boolean {
  return getFavorites().includes(gameId)
}
