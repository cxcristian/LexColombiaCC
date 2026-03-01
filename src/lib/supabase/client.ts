import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Cliente singleton — se reutiliza en toda la app para mantener la sesión activa
export const supabaseClient = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  }
)
