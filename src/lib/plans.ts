import { supabaseClient } from '@/lib/supabase/client'
import type {
  Subscription, Firm, FirmInsert,
  FirmMember, FirmMemberWithProfile, FirmInvitation,
} from '@/types/plans'

// ── Subscriptions ─────────────────────────────────────────────────────────────

export async function getMySubscription(userId: string): Promise<Subscription | null> {
  const { data } = await supabaseClient
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()
  return data ?? null
}

// Solo el webhook de Wompi o el admin deberían actualizar el plan.
// Esta función es para el admin de la plataforma o para iniciar trial.
export async function updateSubscriptionPlan(
  userId: string,
  updates: Partial<Pick<Subscription, 'plan' | 'estado' | 'trial_ends_at' | 'periodo_inicio' | 'periodo_fin'>>
): Promise<void> {
  const { error } = await supabaseClient
    .from('subscriptions')
    .update(updates)
    .eq('user_id', userId)
  if (error) throw error
}

export async function startTrial(userId: string): Promise<void> {
  const trialEnd = new Date()
  trialEnd.setDate(trialEnd.getDate() + 14)
  await updateSubscriptionPlan(userId, {
    plan: 'trial',
    trial_ends_at: trialEnd.toISOString(),
    periodo_inicio: new Date().toISOString(),
  })
}

// ── Firms ─────────────────────────────────────────────────────────────────────

export async function getMyFirm(userId: string): Promise<Firm | null> {
  const { data } = await supabaseClient
    .from('firm_members')
    .select('firms(*)')
    .eq('user_id', userId)
    .eq('estado', 'activo')
    .single()
  return (data as unknown as { firms: Firm })?.firms ?? null
}

export async function createFirm(firmData: FirmInsert): Promise<Firm> {
  // 1. Crear la firma
  const { data: firm, error } = await supabaseClient
    .from('firms')
    .insert(firmData)
    .select()
    .single()
  if (error) throw error

  // 2. Agregar al owner como admin de la firma
  const { error: memberError } = await supabaseClient
    .from('firm_members')
    .insert({
      firm_id: firm.id,
      user_id: firmData.owner_id,
      rol_firma: 'admin',
      estado: 'activo',
    })
  if (memberError) throw memberError

  return firm as Firm
}

export async function updateFirm(firmId: string, updates: Partial<FirmInsert>): Promise<void> {
  const { error } = await supabaseClient
    .from('firms')
    .update(updates)
    .eq('id', firmId)
  if (error) throw error
}

// ── Firm Members ──────────────────────────────────────────────────────────────

export async function getFirmMembers(firmId: string): Promise<FirmMemberWithProfile[]> {
  const { data, error } = await supabaseClient
    .from('firm_members')
    .select(`
      *,
      profiles (
        full_name,
        email,
        avatar_url
      )
    `)
    .eq('firm_id', firmId)
    .order('joined_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as unknown as FirmMemberWithProfile[]
}

export async function removeFirmMember(memberId: string): Promise<void> {
  const { error } = await supabaseClient
    .from('firm_members')
    .update({ estado: 'suspendido' })
    .eq('id', memberId)
  if (error) throw error
}

export async function updateMemberRole(memberId: string, newRole: 'admin' | 'miembro'): Promise<void> {
  const { error } = await supabaseClient
    .from('firm_members')
    .update({ rol_firma: newRole })
    .eq('id', memberId)
  if (error) throw error
}

// ── Invitations ───────────────────────────────────────────────────────────────

export async function getFirmInvitations(firmId: string): Promise<FirmInvitation[]> {
  const { data, error } = await supabaseClient
    .from('firm_invitations')
    .select('*')
    .eq('firm_id', firmId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as FirmInvitation[]
}

export async function createInvitation(
  firmId: string,
  invitedBy: string,
  email: string
): Promise<FirmInvitation> {
  // Cancelar invitación anterior si existe
  await supabaseClient
    .from('firm_invitations')
    .update({ estado: 'cancelada' })
    .eq('firm_id', firmId)
    .eq('email', email)
    .eq('estado', 'pendiente')

  const { data, error } = await supabaseClient
    .from('firm_invitations')
    .insert({ firm_id: firmId, invited_by: invitedBy, email })
    .select()
    .single()
  if (error) throw error
  return data as FirmInvitation
}

export async function cancelInvitation(invitationId: string): Promise<void> {
  const { error } = await supabaseClient
    .from('firm_invitations')
    .update({ estado: 'cancelada' })
    .eq('id', invitationId)
  if (error) throw error
}

// Aceptar invitación por token (llamado desde la página /unirse/[token])
export async function acceptInvitation(token: string, userId: string): Promise<{
  success: boolean
  firmId?: string
  error?: string
}> {
  // 1. Verificar el token
  const { data: inv, error } = await supabaseClient
    .from('firm_invitations')
    .select('*')
    .eq('token', token)
    .eq('estado', 'pendiente')
    .single()

  if (error || !inv) return { success: false, error: 'Invitación no válida o ya usada' }
  if (new Date(inv.expires_at) < new Date()) return { success: false, error: 'Esta invitación ha expirado' }

  // 2. Agregar como miembro
  const { error: memberError } = await supabaseClient
    .from('firm_members')
    .insert({
      firm_id: inv.firm_id,
      user_id: userId,
      rol_firma: 'miembro',
      estado: 'activo',
    })
  if (memberError && !memberError.message.includes('duplicate')) {
    return { success: false, error: 'Error al unirse a la firma' }
  }

  // 3. Marcar invitación como aceptada
  await supabaseClient
    .from('firm_invitations')
    .update({ estado: 'aceptada', accepted_at: new Date().toISOString() })
    .eq('id', inv.id)

  // 4. Actualizar suscripción del nuevo miembro al plan firma
  await updateSubscriptionPlan(userId, { plan: 'firma', estado: 'activo' })

  return { success: true, firmId: inv.firm_id }
}

// ── Estadísticas para admin de la plataforma ──────────────────────────────────
export async function getSubscriptionStats() {
  const { data } = await supabaseClient
    .from('subscriptions')
    .select('plan, estado')

  const subs = data ?? []
  return {
    total:          subs.length,
    free:           subs.filter(s => s.plan === 'free').length,
    trial:          subs.filter(s => s.plan === 'trial').length,
    independiente:  subs.filter(s => s.plan === 'independiente').length,
    firma:          subs.filter(s => s.plan === 'firma').length,
    vencidos:       subs.filter(s => s.estado === 'vencido').length,
  }
}
