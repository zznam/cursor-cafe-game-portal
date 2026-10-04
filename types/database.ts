export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      games: {
        Relationships: []
        Row: {
          id: string
          slug: string
          title: string
          description: string
          thumbnail_url: string
          banner_url: string | null
          mood: string | null
          session_minutes: number | null
          touch: boolean
          category: string
          tags: string[]
          developer_name: string
          developer_url: string | null
          package_name: string
          version: string
          play_count: number
          average_rating: number
          total_ratings: number
          featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          description: string
          thumbnail_url: string
          banner_url?: string | null
          category: string
          tags?: string[]
          developer_name: string
          developer_url?: string | null
          package_name: string
          version: string
          play_count?: number
          average_rating?: number
          total_ratings?: number
          featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          description?: string
          thumbnail_url?: string
          banner_url?: string | null
          category?: string
          tags?: string[]
          developer_name?: string
          developer_url?: string | null
          package_name?: string
          version?: string
          play_count?: number
          average_rating?: number
          total_ratings?: number
          featured?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      ratings: {
        Relationships: []
        Row: {
          id: string
          game_id: string
          user_id: string
          rating: number
          review: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          game_id: string
          user_id: string
          rating: number
          review?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          game_id?: string
          user_id?: string
          rating?: number
          review?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Relationships: []
        Row: {
          id: string
          game_id: string
          user_id: string
          username: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          game_id: string
          user_id: string
          username: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          game_id?: string
          user_id?: string
          username?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      leaderboards: {
        Relationships: []
        Row: {
          id: string
          game_id: string
          user_id: string
          username: string
          score: number
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          game_id: string
          user_id: string
          username: string
          score: number
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          game_id?: string
          user_id?: string
          username?: string
          score?: number
          metadata?: Json | null
          created_at?: string
        }
      }
      analytics: {
        Relationships: []
        Row: {
          id: string
          game_id: string
          event_type: string
          user_id: string | null
          session_id: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          game_id: string
          event_type: string
          user_id?: string | null
          session_id: string
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          game_id?: string
          event_type?: string
          user_id?: string | null
          session_id?: string
          metadata?: Json | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      production_ready: { Args: Record<string, never>; Returns: boolean }
      consume_rate_limit: { Args: { bucket_key: string; max_requests: number }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
