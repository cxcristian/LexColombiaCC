import { supabaseClient } from '@/lib/supabase/client'
import type { Note, NoteInsert, NoteUpdate } from '@/types/database'

export async function getNotes(userId: string): Promise<Note[]> {
  const { data, error } = await supabaseClient
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .order('is_pinned', { ascending: false })
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getNoteById(id: string, userId: string): Promise<Note | null> {
  const { data } = await supabaseClient
    .from('notes')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()
  return data
}

export async function createNote(note: NoteInsert): Promise<Note> {
  const { data, error } = await supabaseClient
    .from('notes')
    .insert(note)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateNote(id: string, updates: NoteUpdate): Promise<Note> {
  const { data, error } = await supabaseClient
    .from('notes')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteNote(id: string): Promise<void> {
  const { error } = await supabaseClient.from('notes').delete().eq('id', id)
  if (error) throw error
}

export async function togglePin(id: string, currentValue: boolean): Promise<void> {
  const { error } = await supabaseClient
    .from('notes')
    .update({ is_pinned: !currentValue })
    .eq('id', id)
  if (error) throw error
}
