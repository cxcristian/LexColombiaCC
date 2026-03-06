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
    subscriptions: {
      Row: {
        id: string
        user_id: string
        plan: 'free' | 'trial' | 'independiente' | 'firma'
        estado: 'activo' | 'vencido' | 'cancelado' | 'pausado'
        trial_ends_at: string | null
        periodo_inicio: string | null
        periodo_fin: string | null
        wompi_subscription_id: string | null
        wompi_customer_id: string | null
        ultimo_pago_at: string | null
        proximo_cobro_at: string | null
        created_at: string
        updated_at: string
      }
      Insert: {
        id?: string
        user_id: string
        plan?: 'free' | 'trial' | 'independiente' | 'firma'
        estado?: 'activo' | 'vencido' | 'cancelado' | 'pausado'
        trial_ends_at?: string | null
        periodo_inicio?: string | null
        periodo_fin?: string | null
        wompi_subscription_id?: string | null
        wompi_customer_id?: string | null
        ultimo_pago_at?: string | null
        proximo_cobro_at?: string | null
        created_at?: string
        updated_at?: string
      }
      Update: {
        id?: string
        user_id?: string
        plan?: 'free' | 'trial' | 'independiente' | 'firma'
        estado?: 'activo' | 'vencido' | 'cancelado' | 'pausado'
        trial_ends_at?: string | null
        periodo_inicio?: string | null
        periodo_fin?: string | null
        wompi_subscription_id?: string | null
        wompi_customer_id?: string | null
        ultimo_pago_at?: string | null
        proximo_cobro_at?: string | null
        created_at?: string
        updated_at?: string
      }
    }
    firms: {
      Row: {
        id: string
        owner_id: string
        nombre: string
        nit: string | null
        ciudad: string | null
        telefono: string | null
        max_miembros: number
        created_at: string
        updated_at: string
      }
      Insert: {
        id?: string
        owner_id: string
        nombre: string
        nit?: string | null
        ciudad?: string | null
        telefono?: string | null
        max_miembros?: number
        created_at?: string
        updated_at?: string
      }
      Update: {
        id?: string
        owner_id?: string
        nombre?: string
        nit?: string | null
        ciudad?: string | null
        telefono?: string | null
        max_miembros?: number
        created_at?: string
        updated_at?: string
      }
    }
    firm_members: {
      Row: {
        id: string
        firm_id: string
        user_id: string
        rol_firma: 'admin' | 'miembro'
        estado: 'activo' | 'suspendido'
        joined_at: string
      }
      Insert: {
        id?: string
        firm_id: string
        user_id: string
        rol_firma?: 'admin' | 'miembro'
        estado?: 'activo' | 'suspendido'
        joined_at?: string
      }
      Update: {
        id?: string
        firm_id?: string
        user_id?: string
        rol_firma?: 'admin' | 'miembro'
        estado?: 'activo' | 'suspendido'
        joined_at?: string
      }
    }
    firm_invitations: {
      Row: {
        id: string
        firm_id: string
        invited_by: string
        email: string
        token: string
        estado: 'pendiente' | 'aceptada' | 'expirada' | 'cancelada'
        expires_at: string
        accepted_at: string | null
        created_at: string
      }
      Insert: {
        id?: string
        firm_id: string
        invited_by: string
        email: string
        token?: string
        estado?: 'pendiente' | 'aceptada' | 'expirada' | 'cancelada'
        expires_at?: string
        accepted_at?: string | null
        created_at?: string
      }
      Update: {
        id?: string
        firm_id?: string
        invited_by?: string
        email?: string
        token?: string
        estado?: 'pendiente' | 'aceptada' | 'expirada' | 'cancelada'
        expires_at?: string
        accepted_at?: string | null
        created_at?: string
      }
    }
    cases: {
      Row: {
        id: string
        user_id: string
        titulo: string
        referencia: string | null
        descripcion: string | null
        cliente_nombre: string
        cliente_contacto: string | null
        juzgado: string | null
        ciudad: string | null
        despacho: string | null
        tipo_proceso:
          | 'civil'
          | 'penal'
          | 'laboral'
          | 'administrativo'
          | 'familia'
          | 'constitucional'
          | 'comercial'
          | 'otro'
        estado: 'activo' | 'suspendido' | 'cerrado' | 'archivado'
        fecha_inicio: string
        fecha_cierre: string | null
        notas_generales: string | null
        monitoreo_activo: boolean
        firm_id: string | null
        assigned_to: string | null
        created_at: string
        updated_at: string
      }
      Insert: {
        id?: string
        user_id: string
        titulo: string
        referencia?: string | null
        descripcion?: string | null
        cliente_nombre: string
        cliente_contacto?: string | null
        juzgado?: string | null
        ciudad?: string | null
        despacho?: string | null
        tipo_proceso?:
          | 'civil'
          | 'penal'
          | 'laboral'
          | 'administrativo'
          | 'familia'
          | 'constitucional'
          | 'comercial'
          | 'otro'
        estado?: 'activo' | 'suspendido' | 'cerrado' | 'archivado'
        fecha_inicio?: string
        fecha_cierre?: string | null
        notas_generales?: string | null
        monitoreo_activo?: boolean
        firm_id?: string | null
        assigned_to?: string | null
        created_at?: string
        updated_at?: string
      }
      Update: {
        id?: string
        user_id?: string
        titulo?: string
        referencia?: string | null
        descripcion?: string | null
        cliente_nombre?: string
        cliente_contacto?: string | null
        juzgado?: string | null
        ciudad?: string | null
        despacho?: string | null
        tipo_proceso?:
          | 'civil'
          | 'penal'
          | 'laboral'
          | 'administrativo'
          | 'familia'
          | 'constitucional'
          | 'comercial'
          | 'otro'
        estado?: 'activo' | 'suspendido' | 'cerrado' | 'archivado'
        fecha_inicio?: string
        fecha_cierre?: string | null
        notas_generales?: string | null
        monitoreo_activo?: boolean
        firm_id?: string | null
        assigned_to?: string | null
        created_at?: string
        updated_at?: string
      }
    }
    case_events: {
      Row: {
        id: string
        case_id: string
        user_id: string
        tipo:
          | 'actuacion'
          | 'termino'
          | 'audiencia'
          | 'vencimiento'
          | 'nota'
          | 'documento'
        titulo: string
        descripcion: string | null
        fecha_evento: string
        fecha_limite: string | null
        dias_habiles: number | null
        termino_tipo:
          | 'traslado_demanda'
          | 'contestacion_demanda'
          | 'recurso_reposicion'
          | 'recurso_apelacion'
          | 'ejecutoria'
          | 'notificacion_personal'
          | 'termino_probatorio'
          | 'alegatos'
          | 'termino_sentencia'
          | 'custom'
          | null
        completado: boolean
        alertar: boolean
        reminder_id: string | null
        created_at: string
        updated_at: string
      }
      Insert: {
        id?: string
        case_id: string
        user_id: string
        tipo?:
          | 'actuacion'
          | 'termino'
          | 'audiencia'
          | 'vencimiento'
          | 'nota'
          | 'documento'
        titulo: string
        descripcion?: string | null
        fecha_evento?: string
        fecha_limite?: string | null
        dias_habiles?: number | null
        termino_tipo?:
          | 'traslado_demanda'
          | 'contestacion_demanda'
          | 'recurso_reposicion'
          | 'recurso_apelacion'
          | 'ejecutoria'
          | 'notificacion_personal'
          | 'termino_probatorio'
          | 'alegatos'
          | 'termino_sentencia'
          | 'custom'
          | null
        completado?: boolean
        alertar?: boolean
        reminder_id?: string | null
        created_at?: string
        updated_at?: string
      }
      Update: {
        id?: string
        case_id?: string
        user_id?: string
        tipo?:
          | 'actuacion'
          | 'termino'
          | 'audiencia'
          | 'vencimiento'
          | 'nota'
          | 'documento'
        titulo?: string
        descripcion?: string | null
        fecha_evento?: string
        fecha_limite?: string | null
        dias_habiles?: number | null
        termino_tipo?:
          | 'traslado_demanda'
          | 'contestacion_demanda'
          | 'recurso_reposicion'
          | 'recurso_apelacion'
          | 'ejecutoria'
          | 'notificacion_personal'
          | 'termino_probatorio'
          | 'alegatos'
          | 'termino_sentencia'
          | 'custom'
          | null
        completado?: boolean
        alertar?: boolean
        reminder_id?: string | null
        created_at?: string
        updated_at?: string
      }
    }
    case_notes: {
      Row: {
        case_id: string
        note_id: string
        created_at: string
      }
      Insert: {
        case_id: string
        note_id: string
        created_at?: string
      }
      Update: {
        case_id?: string
        note_id?: string
        created_at?: string
      }
    }
    reminders: {
      Row: {
        id: string
        user_id: string
        title: string
        description: string | null
        date: string
        time: string | null
        color: 'blue' | 'red' | 'green' | 'amber' | 'purple' | 'navy'
        note_id: string | null
        is_completed: boolean
        created_at: string
        updated_at: string
      }
      Insert: {
        id?: string
        user_id: string
        title: string
        description?: string | null
        date: string
        time?: string | null
        color?: 'blue' | 'red' | 'green' | 'amber' | 'purple' | 'navy'
        note_id?: string | null
        is_completed?: boolean
        created_at?: string
        updated_at?: string
      }
      Update: {
        id?: string
        user_id?: string
        title?: string
        description?: string | null
        date?: string
        time?: string | null
        color?: 'blue' | 'red' | 'green' | 'amber' | 'purple' | 'navy'
        note_id?: string | null
        is_completed?: boolean
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
