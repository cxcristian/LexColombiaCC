// ── Tipos de planes y firmas ──────────────────────────────────────────────────

export type Plan = 'free' | 'trial' | 'independiente' | 'firma'
export type EstadoSub = 'activo' | 'vencido' | 'cancelado' | 'pausado'
export type RolFirma = 'admin' | 'miembro'
export type EstadoMiembro = 'activo' | 'suspendido'

// ── Subscription ──────────────────────────────────────────────────────────────
export interface Subscription {
  id: string
  user_id: string
  plan: Plan
  estado: EstadoSub
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

// ── Firm ──────────────────────────────────────────────────────────────────────
export interface Firm {
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

export interface FirmInsert {
  owner_id: string
  nombre: string
  nit?: string | null
  ciudad?: string | null
  telefono?: string | null
}

// ── FirmMember ────────────────────────────────────────────────────────────────
export interface FirmMember {
  id: string
  firm_id: string
  user_id: string
  rol_firma: RolFirma
  estado: EstadoMiembro
  joined_at: string
}

export interface FirmMemberWithProfile extends FirmMember {
  profiles: {
    full_name: string | null
    email: string
    avatar_url: string | null
  }
}

// ── FirmInvitation ────────────────────────────────────────────────────────────
export interface FirmInvitation {
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

// ── LÍMITES POR PLAN ──────────────────────────────────────────────────────────
// Fuente de verdad — un solo lugar para cambiar límites

export interface PlanLimits {
  max_casos: number           // -1 = ilimitado
  max_notas: number           // -1 = ilimitado
  max_miembros_firma: number  // -1 = ilimitado
  monitoreo_samai: boolean
  alertas_email: boolean
  exportar_expedientes: boolean
  calculadora_festivos: boolean
  panel_firma: boolean
  resumen_diario: boolean
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: {
    max_casos:              2,
    max_notas:              20,
    max_miembros_firma:     0,
    monitoreo_samai:        false,
    alertas_email:          false,
    exportar_expedientes:   false,
    calculadora_festivos:   true,
    panel_firma:            false,
    resumen_diario:         false,
  },
  trial: {
    // Trial = independiente completo por 14 días
    max_casos:              20,
    max_notas:              -1,
    max_miembros_firma:     0,
    monitoreo_samai:        true,
    alertas_email:          true,
    exportar_expedientes:   true,
    calculadora_festivos:   true,
    panel_firma:            false,
    resumen_diario:         false,
  },
  independiente: {
    max_casos:              20,
    max_notas:              -1,
    max_miembros_firma:     0,
    monitoreo_samai:        true,
    alertas_email:          true,
    exportar_expedientes:   true,
    calculadora_festivos:   true,
    panel_firma:            false,
    resumen_diario:         false,
  },
  firma: {
    max_casos:              -1,
    max_notas:              -1,
    max_miembros_firma:     6,
    monitoreo_samai:        true,
    alertas_email:          true,
    exportar_expedientes:   true,
    calculadora_festivos:   true,
    panel_firma:            true,
    resumen_diario:         true,
  },
}

// ── Features — keys para usePlan() ───────────────────────────────────────────
export type Feature =
  | 'monitoreo_samai'
  | 'alertas_email'
  | 'exportar_expedientes'
  | 'calculadora_festivos'
  | 'panel_firma'
  | 'resumen_diario'
  | 'invitar_miembros'

// ── Labels de plan para UI ────────────────────────────────────────────────────
export const PLAN_LABELS: Record<Plan, string> = {
  free:          'Biblioteca',
  trial:         'Prueba gratuita',
  independiente: 'Independiente',
  firma:         'Firma',
}

export const PLAN_COLORS: Record<Plan, { bg: string; color: string }> = {
  free:          { bg: '#f1f5f9', color: '#475569' },
  trial:         { bg: '#e0f2fe', color: '#0369a1' },
  independiente: { bg: '#e8edf5', color: '#1e3a6e' },
  firma:         { bg: '#fef3c7', color: '#92400e' },
}

export const PLAN_PRECIOS: Record<Plan, { mensual: number; anual: number }> = {
  free:          { mensual: 0,       anual: 0 },
  trial:         { mensual: 0,       anual: 0 },
  independiente: { mensual: 59000,   anual: 49000 },
  firma:         { mensual: 149000,  anual: 124000 },
}
