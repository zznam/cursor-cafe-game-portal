'use client'
import { useSyncExternalStore } from 'react'
const eventName = 'cafe-storage'
function subscribe(onChange: () => void) {
  window.addEventListener('storage', onChange)
  window.addEventListener(eventName, onChange)
  return () => {
    window.removeEventListener('storage', onChange)
    window.removeEventListener(eventName, onChange)
  }
}
export function notifyStorageChange() {
  window.dispatchEvent(new Event(eventName))
}
export function useBrowserStorage(key: string) {
  return useSyncExternalStore(
    subscribe,
    () => {
      try {
        return localStorage.getItem(key) || ''
      } catch {
        return ''
      }
    },
    () => '',
  )
}
