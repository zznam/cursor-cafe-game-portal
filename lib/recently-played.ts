import { notifyStorageChange } from '@/hooks/use-browser-storage'
const STORAGE_KEY = 'recently_played'
const MAX_ITEMS = 20

export interface RecentlyPlayedItem {
  slug: string
  title: string
  playedAt: string
}

export function addRecentlyPlayed(slug: string, title: string): void {
  if (typeof window === 'undefined') return

  try {
    const items = getRecentlyPlayed()
    const filtered = items.filter((item) => item.slug !== slug)
    filtered.unshift({ slug, title, playedAt: new Date().toISOString() })
    const trimmed = filtered.slice(0, MAX_ITEMS)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
    notifyStorageChange()
  } catch {
    // localStorage may be unavailable (private browsing, quota exceeded)
  }
}

export function getRecentlyPlayed(): RecentlyPlayedItem[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(item => item && typeof item.slug === "string" && typeof item.title === "string" && !Number.isNaN(Date.parse(item.playedAt))) : []
  } catch {
    return []
  }
}

export function clearRecentlyPlayed(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // noop
  }
}
