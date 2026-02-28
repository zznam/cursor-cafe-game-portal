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
        Row: {
          id: string
          slug: string
          title: string
          description: string
          thumbnail_url: string
          banner_url: string | null
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
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
