import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Database types
export interface Database {
  public: {
    Tables: {
      rooms: {
        Row: {
          id: string
          host_id: string
          current_song: any | null
          is_playing: boolean
          queue: any[]
          participants: number
          created_at: string
          updated_at: string
          current_time: number
        }
        Insert: {
          id: string
          host_id: string
          current_song?: any | null
          is_playing?: boolean
          queue?: any[]
          participants?: number
          created_at?: string
          updated_at?: string
          current_time?: number
        }
        Update: {
          id?: string
          host_id?: string
          current_song?: any | null
          is_playing?: boolean
          queue?: any[]
          participants?: number
          created_at?: string
          updated_at?: string
          current_time?: number
        }
      }
      participants: {
        Row: {
          id: number
          room_id: string
          user_name: string
          joined_at: string
          is_active: boolean
        }
        Insert: {
          room_id: string
          user_name: string
          joined_at?: string
          is_active?: boolean
        }
        Update: {
          id?: number
          room_id?: string
          user_name?: string
          joined_at?: string
          is_active?: boolean
        }
      }
    }
  }
}
