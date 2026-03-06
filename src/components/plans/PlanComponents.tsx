'use client'

import { useState } from 'react'
import { X, Zap, Shield, Users, Lock, AlertTriangle, Clock } from 'lucide-react'
import { usePlan } from '@/context/PlanContext'
import { PLAN_LABELS, PLAN_COLORS, type Plan } from '@/types/plans'
import { cn } from '@/lib/utils'

// ── UpgradeModal ──────────────────────────────────────────────────────────────
// Se muestra cuando el usuario intenta usar algo fuera de su plan

interface UpgradeModalProps {
  feature: string          // nombre legible del feature bloqueado
  reason?: string          // por qué está bloqueado
  requiredPlan?: Plan      // plan mínimo requerido
  onClose: () => void
}

export function UpgradeModal({ feature, reason, requiredPlan = 'independiente', onClose }: UpgradeModalProps) {
  const { plan, startTrial, loading } = usePlan()
  const [starting, setStarting] = useState(false)

  const handleTrial = async () => {
    setStarting(true)
    await startTrial()
    setStarting(false)
    onClose()
    window.location.reload()
  }

  const isOnFree = plan === 'free'

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(10,15,30,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-up">
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #0a0f1e, #1e2a45)' }} className="px-6 py-5 relative">
          <button onClick={onClose} className="absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors">
            <X size={15} />
          </button>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <Lock size={20} className="text-white" />
          </div>
          <h2 className="font-display font-bold text-white text-lg leading-snug">
            {feature} requiere un plan superior
          </h2>
          {reason && (
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{reason}</p>
          )}
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Plan requerido */}
          <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-navy-200 bg-navy-50 mb-5">
            <Shield size={18} className="text-navy-700 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Plan necesario</p>
              <p className="font-display font-bold text-navy-900">{PLAN_LABELS[requiredPlan]}</p>
            </div>
          </div>

          {/* Beneficios clave según plan requerido */}
          <div className="space-y-2 mb-6">
            {requiredPlan === 'independiente' || requiredPlan === 'trial' ? (
              <>
                {['Monitoreo automático SAMAI todos los días', 'Alertas email de nuevas actuaciones', 'Hasta 20 casos activos', 'Exportar expedientes completos'].map((b, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                    <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600 text-xs">✓</span>
                    </div>
                    {b}
                  </div>
                ))}
              </>
            ) : (
              <>
                {['Hasta 6 abogados con roles', 'Casos ilimitados para toda la firma', 'Panel unificado del equipo', 'Resumen diario por abogado'].map((b, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                    <div className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-amber-700 text-xs">✓</span>
                    </div>
                    {b}
                  </div>
                ))}
              </>
            )}
          </div>

          {/* CTAs */}
          {isOnFree ? (
            <div className="space-y-3">
              <button
                onClick={handleTrial}
                disabled={starting}
                className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #1e3a6e, #3b5280)' }}
              >
                {starting ? '...' : <><Zap size={15} />Comenzar 14 días gratis — sin tarjeta</>}
              </button>
              <button onClick={onClose} className="w-full py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-500 hover:bg-slate-50 transition-colors">
                Seguir en plan gratuito
              </button>
              <p className="text-center text-xs text-slate-400">Sin compromisos · Cancela cuando quieras</p>
            </div>
          ) : (
            <div className="space-y-3">
              <a
                href="/planes"
                className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #1e3a6e, #3b5280)' }}
              >
                <Zap size={15} />Ver planes disponibles
              </a>
              <button onClick={onClose} className="w-full py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-500 hover:bg-slate-50 transition-colors">
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── PlanBadge ─────────────────────────────────────────────────────────────────
// Muestra el plan activo del usuario con días de trial si aplica

export function PlanBadge({ className }: { className?: string }) {
  const { plan, isTrialActive, trialDaysLeft } = usePlan()
  const style = PLAN_COLORS[plan]

  return (
    <span
      className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold', className)}
      style={{ background: style.bg, color: style.color }}
    >
      {isTrialActive && <Clock size={10} />}
      {PLAN_LABELS[plan]}
      {isTrialActive && trialDaysLeft <= 5 && (
        <span className="ml-0.5 text-orange-600 font-bold">{trialDaysLeft}d</span>
      )}
    </span>
  )
}

// ── TrialBanner ───────────────────────────────────────────────────────────────
// Banner en la parte superior cuando el trial está por vencer

export function TrialBanner() {
  const { isTrialActive, trialDaysLeft } = usePlan()
  const [dismissed, setDismissed] = useState(false)

  if (!isTrialActive || trialDaysLeft > 7 || dismissed) return null

  const isUrgent = trialDaysLeft <= 3

  return (
    <div
      className="w-full px-4 py-2.5 flex items-center justify-between gap-3"
      style={{
        background: isUrgent
          ? 'linear-gradient(90deg, #dc2626, #b91c1c)'
          : 'linear-gradient(90deg, #1e3a6e, #2d4068)',
      }}
    >
      <div className="flex items-center gap-2 text-white text-sm">
        {isUrgent
          ? <AlertTriangle size={15} className="flex-shrink-0" />
          : <Clock size={15} className="flex-shrink-0" />
        }
        <span>
          Tu período de prueba vence en <strong>{trialDaysLeft} día{trialDaysLeft !== 1 ? 's' : ''}</strong>.
          {' '}No pierdas el monitoreo automático de tus casos.
        </span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <a
          href="/planes"
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-navy-900 hover:bg-slate-100 transition-colors"
        >
          Activar plan
        </a>
        <button
          onClick={() => setDismissed(true)}
          className="w-6 h-6 rounded flex items-center justify-center text-white/60 hover:text-white transition-colors"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  )
}

// ── LimitReachedInline ────────────────────────────────────────────────────────
// Aviso inline pequeño (ej: en botón "Nuevo caso" cuando el límite se alcanzó)

interface LimitReachedProps {
  feature: string
  className?: string
}

export function LimitReachedInline({ feature, className }: LimitReachedProps) {
  return (
    <div className={cn('flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200', className)}>
      <AlertTriangle size={14} className="text-amber-600 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-amber-800">Límite alcanzado</p>
        <p className="text-xs text-amber-700">Actualiza tu plan para {feature}</p>
      </div>
      <a href="/planes" className="text-xs font-semibold text-amber-900 hover:underline flex-shrink-0">
        Ver planes →
      </a>
    </div>
  )
}
