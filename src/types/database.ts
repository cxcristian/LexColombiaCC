// Tipos generados para Supabase
// Para regenerar: npx supabase gen types typescript --project-id TU_PROJECT_ID

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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'admin' | 'user' | 'blocked'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'user' | 'blocked'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'user' | 'blocked'
          created_at?: string
          updated_at?: string
        }
      }
      notes: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          tags: string[]
          color: 'default' | 'amber' | 'red' | 'blue' | 'green' | 'purple'
          related_law_id: string | null
          related_law_title: string | null
          related_precedent_id: string | null
          related_precedent_num: string | null
          is_pinned: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content?: string
          tags?: string[]
          color?: 'default' | 'amber' | 'red' | 'blue' | 'green' | 'purple'
          related_law_id?: string | null
          related_law_title?: string | null
          related_precedent_id?: string | null
          related_precedent_num?: string | null
          is_pinned?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          tags?: string[]
          color?: 'default' | 'amber' | 'red' | 'blue' | 'green' | 'purple'
          related_law_id?: string | null
          related_law_title?: string | null
          related_precedent_id?: string | null
          related_precedent_num?: string | null
          is_pinned?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// Tipos derivados convenientes
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Note = Database['public']['Tables']['notes']['Row']
export type NoteInsert = Database['public']['Tables']['notes']['Insert']
export type NoteUpdate = Database['public']['Tables']['notes']['Update']
export type UserRole = 'admin' | 'user' | 'blocked'
export type NoteColor = 'default' | 'amber' | 'red' | 'blue' | 'green' | 'purple'

// ── Recordatorios (feature calendario) ───────────────────────────────────────
export type ReminderColor = 'blue' | 'red' | 'green' | 'amber' | 'purple' | 'navy'

export interface Reminder {
  id: string
  user_id: string
  title: string
  description: string | null
  date: string          // 'YYYY-MM-DD'
  time: string | null   // 'HH:MM'
  color: ReminderColor
  note_id: string | null
  is_completed: boolean
  created_at: string
  updated_at: string
}

export interface ReminderInsert {
  user_id: string
  title: string
  description?: string | null
  date: string
  time?: string | null
  color?: ReminderColor
  note_id?: string | null
  is_completed?: boolean
}

export interface ReminderUpdate {
  title?: string
  description?: string | null
  date?: string
  time?: string | null
  color?: ReminderColor
  note_id?: string | null
  is_completed?: boolean
}
