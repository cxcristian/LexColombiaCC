'use client'

import { useState } from 'react'
import { X, Loader2, Clock, Calendar, FileText, Zap } from 'lucide-react'
import {
  TERMINOS_COLOMBIA, TIPO_EVENTO_LABELS, addDiasHabiles,
  type TipoEvento, type TerminoTipo, type CaseEventInsert,
} from '@/types/cases'
import { cn } from '@/lib/utils'

interface Props {
  caseId: string
  userId: string
  onSave: (event: CaseEventInsert) => Promise<void>
  onClose: () => void
}

type Mode = 'termino' | 'manual'

const TIPOS_MANUALES: TipoEvento[] = ['actuacion', 'audiencia', 'nota', 'documento']

export function NewEventModal({ caseId, userId, onSave, onClose }: Props) {
  const [mode, setMode]               = useState<Mode>('termino')
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')

  // Modo término predefinido
  const [terminoSelec, setTerminoSelec] = useState<TerminoTipo | ''>('')
  const [diasCustom, setDiasCustom]   = useState('')
  const [fechaBase, setFechaBase]     = useState(new Date().toISOString().split('T')[0])
  const [alertar, setAlertar]         = useState(true)

  // Modo manual
  const [tipo, setTipo]               = useState<TipoEvento>('actuacion')
  const [titulo, setTitulo]           = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [fechaEvento, setFechaEvento] = useState(new Date().toISOString().split('T')[0])
  const [fechaLimite, setFechaLimite] = useState('')

  const terminoInfo = TERMINOS_COLOMBIA.find(t => t.tipo === terminoSelec)

  const calcFechaLimite = (): string => {
    if (!terminoInfo) return ''
    const dias = terminoSelec === 'custom' ? parseInt(diasCustom) || 0 : terminoInfo.dias_habiles
    return dias > 0 ? addDiasHabiles(fechaBase, dias) : fechaBase
  }

  const handleSave = async () => {
    setError('')
    let event: CaseEventInsert

    if (mode === 'termino') {
      if (!terminoSelec) { setError('Selecciona un término'); return }
      if (terminoSelec === 'custom' && !diasCustom) { setError('Ingresa los días hábiles'); return }
      const fl = calcFechaLimite()
      const dias = terminoSelec === 'custom' ? parseInt(diasCustom) : terminoInfo!.dias_habiles
      event = {
        case_id: caseId, user_id: userId,
        tipo: terminoInfo!.tipo_evento,
        titulo: terminoInfo!.label,
        descripcion: terminoInfo!.descripcion,
        fecha_evento: fechaBase,
        fecha_limite: fl,
        dias_habiles: dias,
        termino_tipo: terminoSelec as TerminoTipo,
        alertar,
      }
    } else {
      if (!titulo.trim()) { setError('El título es obligatorio'); return }
      event = {
        case_id: caseId, user_id: userId,
        tipo, titulo: titulo.trim(),
        descripcion: descripcion.trim() || null,
        fecha_evento: fechaEvento,
        fecha_limite: fechaLimite || null,
        alertar,
      }
    }

    setLoading(true)
    try {
      await onSave(event)
      onClose()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al guardar')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(10,15,30,0.6)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-navy-900">
              <Clock size={14} className="text-white" />
            </div>
            <h2 className="font-display font-bold text-navy-900 text-base">Nueva actuación</h2>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors">
            <X size={15} />
          </button>
        </div>

        {/* Mode tabs */}
        <div className="flex gap-1 p-3 border-b border-slate-100 bg-white">
          <button onClick={() => setMode('termino')}
            className={cn('flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all',
              mode === 'termino' ? 'bg-navy-900 text-white' : 'text-slate-500 hover:bg-slate-100'
            )}
          >
            <Zap size={14} />Término procesal
          </button>
          <button onClick={() => setMode('manual')}
            className={cn('flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all',
              mode === 'manual' ? 'bg-navy-900 text-white' : 'text-slate-500 hover:bg-slate-100'
            )}
          >
            <FileText size={14} />Actuación manual
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {mode === 'termino' ? (
            <>
              {/* Selector de término */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">
                  Tipo de término *
                </label>
                <div className="space-y-2">
                  {TERMINOS_COLOMBIA.map(t => (
                    <button key={t.tipo} onClick={() => setTerminoSelec(t.tipo)}
                      className={cn(
                        'w-full flex items-start gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all',
                        terminoSelec === t.tipo
                          ? 'border-navy-500 bg-navy-50'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-navy-900">{t.label}</span>
                          {t.tipo !== 'custom' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700">
                              {t.dias_habiles} días hábiles
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{t.descripcion}</p>
                      </div>
                      {terminoSelec === t.tipo && <span className="text-navy-500 font-bold text-sm flex-shrink-0">✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Días custom */}
              {terminoSelec === 'custom' && (
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
                    Días hábiles *
                  </label>
                  <input type="number" value={diasCustom} onChange={e => setDiasCustom(e.target.value)}
                    placeholder="Ej: 15"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-200"
                  />
                </div>
              )}

              {/* Fecha de inicio del término */}
              {terminoSelec && (
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
                    <Calendar size={11} className="inline mr-1" />Fecha inicio del término *
                  </label>
                  <input type="date" value={fechaBase} onChange={e => setFechaBase(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-200"
                  />
                  {calcFechaLimite() && (
                    <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-100">
                      <Clock size={13} className="text-red-600 flex-shrink-0" />
                      <span className="text-xs font-semibold text-red-700">
                        Vence el {new Date(calcFechaLimite() + 'T12:00').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Tipo de actuación */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">Tipo</label>
                <div className="flex gap-2 flex-wrap">
                  {TIPOS_MANUALES.map(t => (
                    <button key={t} onClick={() => setTipo(t)}
                      className={cn('px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                        tipo === t ? 'bg-navy-900 text-white border-navy-900' : 'border-slate-200 text-slate-600 hover:border-navy-300'
                      )}
                    >
                      {TIPO_EVENTO_LABELS[t]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Título */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Título *</label>
                <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)}
                  placeholder="Ej: Presentación memorial de alegatos"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-200"
                  autoFocus
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Descripción</label>
                <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)}
                  rows={3} placeholder="Detalles de la actuación..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-200 resize-none"
                />
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
                    <Calendar size={11} className="inline mr-1" />Fecha actuación
                  </label>
                  <input type="date" value={fechaEvento} onChange={e => setFechaEvento(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
                    <Clock size={11} className="inline mr-1" />Fecha límite
                  </label>
                  <input type="date" value={fechaLimite} onChange={e => setFechaLimite(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-200"
                  />
                </div>
              </div>
            </>
          )}

          {/* Alertar toggle */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <button onClick={() => setAlertar(!alertar)}
              className={cn('w-10 h-5 rounded-full transition-all flex-shrink-0 relative',
                alertar ? 'bg-navy-700' : 'bg-slate-300'
              )}
            >
              <span className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all',
                alertar ? 'left-5' : 'left-0.5'
              )} />
            </button>
            <span className="text-sm text-slate-700">Crear recordatorio en el calendario</span>
          </div>

          {error && (
            <div className="p-3 rounded-xl text-sm text-red-700 bg-red-50 border border-red-100">{error}</div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </button>
          <button onClick={handleSave} disabled={loading}
            className="flex-1 btn-primary flex items-center justify-center gap-2 py-2.5 text-sm disabled:opacity-60"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}
