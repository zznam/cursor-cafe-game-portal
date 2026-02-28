import { supabase } from './supabase'
import { AnalyticsEvent } from '@/types/game'
import { generateSessionId, getUserId } from './game-loader'

export class Analytics {
  private static sessionId: string | null = null

  static getSessionId(): string {
    if (!this.sessionId) {
      this.sessionId = generateSessionId()
    }
    return this.sessionId
  }

  static async trackEvent(event: Omit<AnalyticsEvent, 'userId' | 'sessionId'>) {
    try {
      // @ts-ignore - Supabase types are overly restrictive
      const { error } = await supabase.from('analytics').insert({
        game_id: event.gameId,
        event_type: event.eventType,
        user_id: getUserId(),
        session_id: this.getSessionId(),
        metadata: event.metadata || null
      })

      if (error) throw error
    } catch (error) {
      console.error('Analytics tracking error:', error)
    }
  }

  static async trackPlay(gameId: string) {
    await this.trackEvent({
      gameId,
      eventType: 'play'
    })
  }

  static async trackComplete(gameId: string, metadata?: Record<string, any>) {
    await this.trackEvent({
      gameId,
      eventType: 'complete',
      metadata
    })
  }

  static async trackQuit(gameId: string, metadata?: Record<string, any>) {
    await this.trackEvent({
      gameId,
      eventType: 'quit',
      metadata
    })
  }

  static async trackScoreSubmit(gameId: string, score: number, metadata?: Record<string, any>) {
    await this.trackEvent({
      gameId,
      eventType: 'score_submit',
      metadata: { score, ...metadata }
    })
  }

  static async incrementPlayCount(gameSlug: string) {
    try {
      // @ts-ignore - Supabase RPC types are overly restrictive
      const { error } = await supabase.rpc('increment_play_count', {
        game_slug: gameSlug
      })

      if (error) throw error
    } catch (error) {
      console.error('Failed to increment play count:', error)
    }
  }
}
