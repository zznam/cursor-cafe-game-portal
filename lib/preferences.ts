const SOUND_KEY = 'cafe:v1:sound'

/** Sound defaults to off; storage can be unavailable (private mode, quota). */
export function readSoundPreference(): boolean {
  try {
    return localStorage.getItem(SOUND_KEY) === 'on'
  } catch {
    return false
  }
}

export function writeSoundPreference(enabled: boolean) {
  try {
    localStorage.setItem(SOUND_KEY, enabled ? 'on' : 'off')
  } catch {
    /* Preference simply isn't remembered. */
  }
}
