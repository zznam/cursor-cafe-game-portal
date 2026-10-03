import { submitEvent } from './api'
import type { AnalyticsEvent } from '@/types/game'
import type { Json } from '@/types/database'
import { generateSessionId } from './game-loader'
export class Analytics {
  private static sessionId: string | null = null
  static getSessionId() {
    return (this.sessionId ||= generateSessionId())
  }
  static async trackEvent(event: Omit<AnalyticsEvent, 'userId' | 'sessionId'>) {
    try {
      await submitEvent({ ...event, sessionId: this.getSessionId() })
    } catch {
      /* Telemetry must never prevent a game from starting. */
    }
  }
  static trackPlay(gameId: string) {
    return this.trackEvent({ gameId, eventType: 'play' })
  }
  static trackComplete(gameId: string, metadata?: Record<string, Json>) {
    return this.trackEvent({ gameId, eventType: 'complete', metadata })
  }
  static trackQuit(gameId: string, metadata?: Record<string, Json>) {
    return this.trackEvent({ gameId, eventType: 'quit', metadata })
  }
  static trackScoreSubmit(
    gameId: string,
    score: number,
    metadata?: Record<string, Json>,
  ) {
    return this.trackEvent({
      gameId,
      eventType: 'score_submit',
      metadata: { score, ...metadata },
    })
  }
}
