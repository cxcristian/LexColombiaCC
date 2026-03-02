import { supabaseClient } from '@/lib/supabase/client'
import type { Reminder, ReminderInsert, ReminderUpdate } from '@/types/database'

export async function getReminders(userId: string): Promise<Reminder[]> {
  const { data, error } = await supabaseClient
    .from('reminders')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true })
    .order('time', { ascending: true })
  if (error) throw error
  return (data ?? []) as Reminder[]
}

export async function getRemindersForMonth(
  userId: string,
  year: number,
  month: number // 1-12
): Promise<Reminder[]> {
  const from = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const to = `${year}-${String(month).padStart(2, '0')}-${lastDay}`

  const { data, error } = await supabaseClient
    .from('reminders')
    .select('*')
    .eq('user_id', userId)
    .gte('date', from)
    .lte('date', to)
    .order('date', { ascending: true })
  if (error) throw error
  return (data ?? []) as Reminder[]
}

export async function createReminder(reminder: ReminderInsert): Promise<Reminder> {
  const { data, error } = await supabaseClient
    .from('reminders')
    .insert(reminder)
    .select()
    .single()
  if (error) throw error
  return data as Reminder
}

export async function updateReminder(id: string, updates: ReminderUpdate): Promise<Reminder> {
  const { data, error } = await supabaseClient
    .from('reminders')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Reminder
}

export async function deleteReminder(id: string): Promise<void> {
  const { error } = await supabaseClient.from('reminders').delete().eq('id', id)
  if (error) throw error
}

export async function toggleCompleted(id: string, current: boolean): Promise<void> {
  const { error } = await supabaseClient
    .from('reminders')
    .update({ is_completed: !current })
    .eq('id', id)
  if (error) throw error
}
