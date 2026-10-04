'use client'
import { useSyncExternalStore } from 'react'
import {
  activitySchema,
  summarizeActivities,
  type Activity,
} from '@/lib/passport'

const PREFIX = 'cafe:v1:activity:'
const listeners = new Set<() => void>()
const fallback = new Map<string, Activity>()
let snapshot = { ...summarizeActivities([]), unavailable: false, loaded: false }
const serverSnapshot = snapshot
function refresh() {
  const records = new Map(fallback)
  let unavailable = false
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key?.startsWith(PREFIX)) continue
      try {
        const parsed = activitySchema.safeParse(
          JSON.parse(localStorage.getItem(key) || 'null'),
        )
        if (parsed.success) records.set(parsed.data.id, parsed.data)
      } catch {
        /* Ignore an invalid record without losing valid history. */
      }
    }
    // Reads can succeed even when writes are prohibited.
    const probe = `${PREFIX}probe`
    localStorage.setItem(probe, '1')
    localStorage.removeItem(probe)
  } catch {
    unavailable = true
  }
  snapshot = {
    ...summarizeActivities([...records.values()]),
    unavailable,
    loaded: true,
  }
  for (const listener of listeners) listener()
}
function storageChanged(event: StorageEvent) {
  if (
    !event.key ||
    (event.key.startsWith(PREFIX) && event.key !== `${PREFIX}probe`)
  )
    refresh()
}
function subscribe(listener: () => void) {
  if (!listeners.size) {
    window.addEventListener('storage', storageChanged)
    refresh()
  }
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
    if (!listeners.size) window.removeEventListener('storage', storageChanged)
  }
}
export function saveActivity(activity: Activity) {
  const valid = activitySchema.parse(activity)
  // Each immutable event has its own key, so tabs cannot overwrite each other's runs.
  try {
    localStorage.setItem(PREFIX + valid.id, JSON.stringify(valid))
  } catch {
    fallback.set(valid.id, valid)
  }
  refresh()
}
export function usePassport() {
  return useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => serverSnapshot,
  )
}
