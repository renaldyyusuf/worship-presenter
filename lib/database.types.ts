// Auto-generated from Supabase schema. Run `supabase gen types typescript` to refresh.

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
      songs: {
        Row: {
          id: string
          title: string
          artist: string | null
          album: string | null
          year: number | null
          ccli_number: string | null
          copyright: string | null
          lyrics: string
          sections: Json
          slides: Json
          tags: string[]
          category: string | null
          favorite: boolean
          theme_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          artist?: string | null
          album?: string | null
          year?: number | null
          ccli_number?: string | null
          copyright?: string | null
          lyrics?: string
          sections?: Json
          slides?: Json
          tags?: string[]
          category?: string | null
          favorite?: boolean
          theme_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['songs']['Insert']>
      }
      bible_verses: {
        Row: {
          id: string
          translation: string
          book: string
          book_num: number
          chapter: number
          verse: number
          content: string
        }
        Insert: {
          id?: string
          translation: string
          book: string
          book_num: number
          chapter: number
          verse: number
          content: string
        }
        Update: Partial<Database['public']['Tables']['bible_verses']['Insert']>
      }
      media: {
        Row: {
          id: string
          name: string
          type: string
          storage_path: string
          cdn_url: string
          mime_type: string
          size_bytes: number
          tags: string[]
          thumbnail_url: string | null
          width: number | null
          height: number | null
          duration_sec: number | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          type: string
          storage_path: string
          cdn_url: string
          mime_type: string
          size_bytes: number
          tags?: string[]
          thumbnail_url?: string | null
          width?: number | null
          height?: number | null
          duration_sec?: number | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['media']['Insert']>
      }
      service_plans: {
        Row: {
          id: string
          title: string
          service_date: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          service_date: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['service_plans']['Insert']>
      }
      service_items: {
        Row: {
          id: string
          plan_id: string
          type: string
          ref_id: string | null
          title: string
          subtitle: string | null
          notes: string | null
          sort_order: number
          duration_min: number | null
          slides: Json | null
          thumbnail_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          plan_id: string
          type: string
          ref_id?: string | null
          title: string
          subtitle?: string | null
          notes?: string | null
          sort_order?: number
          duration_min?: number | null
          slides?: Json | null
          thumbnail_url?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['service_items']['Insert']>
      }
      themes: {
        Row: {
          id: string
          name: string
          font_family: string
          font_size: number
          font_weight: number
          text_align: string
          text_position: string
          text_color: string
          text_shadow: Json
          text_stroke: Json
          background_opacity: number
          line_height: number
          letter_spacing: number
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          font_family?: string
          font_size?: number
          font_weight?: number
          text_align?: string
          text_position?: string
          text_color?: string
          text_shadow?: Json
          text_stroke?: Json
          background_opacity?: number
          line_height?: number
          letter_spacing?: number
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['themes']['Insert']>
      }
    }
    Views: Record<string, never>
    Functions: {
      search_bible_fulltext: {
        Args: { query: string; translation: string; max_results: number }
        Returns: Database['public']['Tables']['bible_verses']['Row'][]
      }
    }
  }
}
