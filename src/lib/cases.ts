import { supabaseClient } from '@/lib/supabase/client'
import type { Case, CaseInsert, CaseUpdate, CaseEvent, CaseEventInsert } from '@/types/cases'
import type { Note } from '@/types/database'

// ── Cases ─────────────────────────────────────────────────────────────────────

export async function getCases(userId: string): Promise<Case[]> {
  const { data, error } = await supabaseClient
    .from('cases')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Case[]
}

export async function getCaseById(id: string): Promise<Case | null> {
  const { data } = await supabaseClient
    .from('cases')
    .select('*')
    .eq('id', id)
    .single()
  return data as Case | null
}

export async function createCase(caso: CaseInsert): Promise<Case> {
  const { data, error } = await supabaseClient
    .from('cases')
    .insert(caso)
    .select()
    .single()
  if (error) throw error
  return data as Case
}

export async function updateCase(id: string, updates: CaseUpdate): Promise<Case> {
  const { data, error } = await supabaseClient
    .from('cases')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Case
}

export async function deleteCase(id: string): Promise<void> {
  const { error } = await supabaseClient.from('cases').delete().eq('id', id)
  if (error) throw error
}

// ── Case Events ───────────────────────────────────────────────────────────────

export async function getCaseEvents(caseId: string): Promise<CaseEvent[]> {
  const { data, error } = await supabaseClient
    .from('case_events')
    .select('*')
    .eq('case_id', caseId)
    .order('fecha_evento', { ascending: false })
  if (error) throw error
  return (data ?? []) as CaseEvent[]
}

export async function createCaseEvent(event: CaseEventInsert): Promise<CaseEvent> {
  const { data, error } = await supabaseClient
    .from('case_events')
    .insert(event)
    .select()
    .single()
  if (error) throw error
  return data as CaseEvent
}

export async function updateCaseEvent(id: string, updates: Partial<CaseEvent>): Promise<CaseEvent> {
  const { data, error } = await supabaseClient
    .from('case_events')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as CaseEvent
}

export async function deleteCaseEvent(id: string): Promise<void> {
  const { error } = await supabaseClient.from('case_events').delete().eq('id', id)
  if (error) throw error
}

export async function toggleEventCompleted(id: string, current: boolean): Promise<void> {
  const { error } = await supabaseClient
    .from('case_events')
    .update({ completado: !current })
    .eq('id', id)
  if (error) throw error
}

// ── Case Notes ────────────────────────────────────────────────────────────────

export async function getCaseNotes(caseId: string): Promise<Note[]> {
  const { data, error } = await supabaseClient
    .from('case_notes')
    .select('note_id, notes(*)')
    .eq('case_id', caseId)
  if (error) throw error
  return (data ?? []).map((r: { notes: Note }) => r.notes).filter(Boolean)
}

export async function linkNoteToCase(caseId: string, noteId: string): Promise<void> {
  const { error } = await supabaseClient
    .from('case_notes')
    .insert({ case_id: caseId, note_id: noteId })
  if (error && !error.message.includes('duplicate')) throw error
}

export async function unlinkNoteFromCase(caseId: string, noteId: string): Promise<void> {
  const { error } = await supabaseClient
    .from('case_notes')
    .delete()
    .eq('case_id', caseId)
    .eq('note_id', noteId)
  if (error) throw error
}

// ── Estadísticas rápidas ──────────────────────────────────────────────────────
export async function getCasesStats(userId: string) {
  const { data } = await supabaseClient
    .from('cases')
    .select('estado')
    .eq('user_id', userId)

  const cases = data ?? []
  return {
    total:      cases.length,
    activos:    cases.filter(c => c.estado === 'activo').length,
    suspendidos:cases.filter(c => c.estado === 'suspendido').length,
    cerrados:   cases.filter(c => c.estado === 'cerrado').length,
  }
}

// ── Próximos vencimientos (para dashboard) ────────────────────────────────────
export async function getProximosVencimientos(userId: string, limit = 5): Promise<CaseEvent[]> {
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabaseClient
    .from('case_events')
    .select('*')
    .eq('user_id', userId)
    .eq('completado', false)
    .gte('fecha_limite', today)
    .not('fecha_limite', 'is', null)
    .order('fecha_limite', { ascending: true })
    .limit(limit)
  if (error) throw error
  return (data ?? []) as CaseEvent[]
}
