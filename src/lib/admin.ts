import { createClient } from '@/lib/supabase/server'
import type { Profile, UserRole } from '@/types/database'

export interface UserWithStats extends Profile {
  notes_count: number
}

// ── Obtener todos los usuarios con conteo de notas ────────────────────────────
export async function getAllUsers(): Promise<UserWithStats[]> {
  const supabase = createClient()

  // Profiles
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error || !profiles) return []

  // Conteo de notas por usuario
  const { data: noteCounts } = await supabase
    .from('notes')
    .select('user_id')

  const countMap: Record<string, number> = {}
  noteCounts?.forEach(n => {
    countMap[n.user_id] = (countMap[n.user_id] ?? 0) + 1
  })

  return profiles.map(p => ({
    ...p,
    notes_count: countMap[p.id] ?? 0,
  }))
}

// ── Cambiar rol de usuario ────────────────────────────────────────────────────
export async function updateUserRole(userId: string, role: UserRole): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)
  if (error) throw error
}

// ── Estadísticas globales ─────────────────────────────────────────────────────
export interface AppStats {
  totalUsers: number
  totalAdmins: number
  totalBlocked: number
  totalNotes: number
  newUsersThisMonth: number
  newNotesThisMonth: number
}

export async function getAppStats(): Promise<AppStats> {
  const supabase = createClient()

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const [
    { count: totalUsers },
    { count: totalAdmins },
    { count: totalBlocked },
    { count: totalNotes },
    { count: newUsersThisMonth },
    { count: newNotesThisMonth },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'admin'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'blocked'),
    supabase.from('notes').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth.toISOString()),
    supabase.from('notes').select('*', { count: 'exact', head: true }).gte('created_at', startOfMonth.toISOString()),
  ])

  return {
    totalUsers:         totalUsers ?? 0,
    totalAdmins:        totalAdmins ?? 0,
    totalBlocked:       totalBlocked ?? 0,
    totalNotes:         totalNotes ?? 0,
    newUsersThisMonth:  newUsersThisMonth ?? 0,
    newNotesThisMonth:  newNotesThisMonth ?? 0,
  }
}
