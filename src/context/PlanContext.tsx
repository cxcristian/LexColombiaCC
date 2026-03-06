'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { supabaseClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import {
  PLAN_LIMITS,
  type Plan, type Feature, type Subscription,
  type Firm, type FirmMember, type PlanLimits,
} from '@/types/plans'

// ── Contexto ──────────────────────────────────────────────────────────────────
interface PlanContextValue {
  // Estado
  subscription:   Subscription | null
  firm:           Firm | null
  firmRole:       'admin' | 'miembro' | null
  loading:        boolean

  // Plan actual y límites
  plan:           Plan
  limits:         PlanLimits
  isTrialActive:  boolean
  trialDaysLeft:  number

  // Helpers de control de acceso
  can:            (feature: Feature) => boolean
  canCreateCase:  (currentCount: number) => boolean
  canCreateNote:  (currentCount: number) => boolean
  canInviteMember:(currentCount: number) => boolean

  // Acciones
  refreshPlan:    () => Promise<void>
  startTrial:     () => Promise<void>
}

const PlanContext = createContext<PlanContextValue | null>(null)

// ── Provider ──────────────────────────────────────────────────────────────────
export function PlanProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [firm, setFirm]         = useState<Firm | null>(null)
  const [firmRole, setFirmRole] = useState<'admin' | 'miembro' | null>(null)
  const [loading, setLoading]   = useState(true)

  const fetchPlan = useCallback(async () => {
    if (!user) {
      setSubscription(null); setFirm(null); setFirmRole(null)
      setLoading(false); return
    }

    setLoading(true)
    try {
      // Cargar suscripción
      const { data: sub } = await supabaseClient
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single()

      setSubscription(sub ?? null)

      // Si tiene plan firma, cargar datos de la firma
      if (sub?.plan === 'firma') {
        const { data: member } = await supabaseClient
          .from('firm_members')
          .select('rol_firma, firms(*)')
          .eq('user_id', user.id)
          .eq('estado', 'activo')
          .single()

        if (member) {
          setFirm((member as unknown as { firms: Firm }).firms ?? null)
          setFirmRole(member.rol_firma as 'admin' | 'miembro')
        }
      } else {
        setFirm(null); setFirmRole(null)
      }
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { fetchPlan() }, [fetchPlan])

  // Escuchar cambios en tiempo real en la suscripción
  useEffect(() => {
    if (!user) return
    const channel = supabaseClient
      .channel('subscription-changes')
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'subscriptions',
        filter: `user_id=eq.${user.id}`,
      }, () => fetchPlan())
      .subscribe()
    return () => { supabaseClient.removeChannel(channel) }
  }, [user, fetchPlan])

  // ── Derivados ────────────────────────────────────────────────────────────────
  const plan = subscription?.plan ?? 'free'
  const limits = PLAN_LIMITS[plan]

  const isTrialActive = plan === 'trial' &&
    subscription?.trial_ends_at != null &&
    new Date(subscription.trial_ends_at) > new Date()

  const trialDaysLeft = isTrialActive && subscription?.trial_ends_at
    ? Math.max(0, Math.ceil(
        (new Date(subscription.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      ))
    : 0

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const can = useCallback((feature: Feature): boolean => {
    if (feature === 'invitar_miembros') {
      return limits.panel_firma && firmRole === 'admin'
    }
    return !!limits[feature as keyof PlanLimits]
  }, [limits, firmRole])

  const canCreateCase = useCallback((currentCount: number): boolean => {
    if (limits.max_casos === -1) return true
    return currentCount < limits.max_casos
  }, [limits])

  const canCreateNote = useCallback((currentCount: number): boolean => {
    if (limits.max_notas === -1) return true
    return currentCount < limits.max_notas
  }, [limits])

  const canInviteMember = useCallback((currentCount: number): boolean => {
    if (!limits.panel_firma) return false
    if (limits.max_miembros_firma === -1) return true
    return currentCount < limits.max_miembros_firma
  }, [limits])

  // ── Iniciar trial ─────────────────────────────────────────────────────────
  const startTrial = useCallback(async () => {
    if (!user || plan !== 'free') return
    const trialEnd = new Date()
    trialEnd.setDate(trialEnd.getDate() + 14)
    await supabaseClient
      .from('subscriptions')
      .update({
        plan: 'trial',
        trial_ends_at: trialEnd.toISOString(),
        periodo_inicio: new Date().toISOString(),
      })
      .eq('user_id', user.id)
    await fetchPlan()
  }, [user, plan, fetchPlan])

  return (
    <PlanContext.Provider value={{
      subscription, firm, firmRole, loading,
      plan, limits, isTrialActive, trialDaysLeft,
      can, canCreateCase, canCreateNote, canInviteMember,
      refreshPlan: fetchPlan,
      startTrial,
    }}>
      {children}
    </PlanContext.Provider>
  )
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function usePlan() {
  const ctx = useContext(PlanContext)
  if (!ctx) throw new Error('usePlan debe usarse dentro de PlanProvider')
  return ctx
}

// ── Hook de conveniencia: solo el plan y los límites ─────────────────────────
export function usePlanLimits() {
  const { plan, limits, can, canCreateCase, canCreateNote, loading } = usePlan()
  return { plan, limits, can, canCreateCase, canCreateNote, loading }
}
