'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Briefcase, Loader2, Plus, Clock, FileText,
  User, Building, Calendar, AlertTriangle, Edit2, Check, X
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import {
  getCaseById, getCaseEvents, getCaseNotes,
  createCaseEvent, toggleEventCompleted, deleteCaseEvent,
  updateCase,
} from '@/lib/cases'
import { createReminder } from '@/lib/reminders'
import { CaseEventItem } from '@/components/casos/CaseEventItem'
import { NewEventModal } from '@/components/casos/NewEventModal'
import { ExportExpediente } from '@/components/casos/ExportExpediente'
import {
  TIPO_PROCESO_LABELS, TIPO_PROCESO_COLORS,
  ESTADO_CASO_LABELS, ESTADO_CASO_COLORS,
  getDiasRestantes, getUrgenciaColor,
  type Case, type CaseEvent, type EstadoCaso, type CaseEventInsert,
} from '@/types/cases'
import type { Note } from '@/types/database'
import { cn } from '@/lib/utils'

type Tab = 'info' | 'actuaciones' | 'notas' | 'exportar'

const ESTADOS: EstadoCaso[] = ['activo', 'suspendido', 'cerrado', 'archivado']

export default function CasoDetailPage({ params }: { params: { id: string } }) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [caso, setCaso]     = useState<Case | null>(null)
  const [events, setEvents] = useState<CaseEvent[]>([])
  const [notes, setNotes]   = useState<Note[]>([])
  const [loading, setLoading]   = useState(true)
  const [tab, setTab]           = useState<Tab>('info')
  const [showModal, setShowModal] = useState(false)
  const [editingEstado, setEditingEstado] = useState(false)
  const [savingEstado, setSavingEstado]   = useState(false)

  useEffect(() => {
    if (!authLoading && !user) router.push('/')
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const [c, e, n] = await Promise.all([
        getCaseById(params.id),
        getCaseEvents(params.id),
        getCaseNotes(params.id),
      ])
      if (!c) { router.push('/casos'); return }
      setCaso(c); setEvents(e); setNotes(n)
      setLoading(false)
    }
    load()
  }, [user, params.id, router])

  const handleNewEvent = useCallback(async (eventData: CaseEventInsert) => {
    const created = await createCaseEvent(eventData)
    // Si tiene fecha límite y alertar → crear reminder en el calendario
    if (eventData.alertar && eventData.fecha_limite && user) {
      const diasRestantes = getDiasRestantes(eventData.fecha_limite)
      await createReminder({
        user_id: user.id,
        title: `[Caso] ${eventData.titulo}`,
        description: `Vencimiento procesal — ${caso?.titulo ?? ''}`,
        date: eventData.fecha_limite,
        color: diasRestantes <= 5 ? 'red' : 'navy',
      })
    }
    setEvents(prev => [created, ...prev])
  }, [user, caso])

  const handleToggle = useCallback(async (id: string, current: boolean) => {
    await toggleEventCompleted(id, current)
    setEvents(prev => prev.map(e => e.id === id ? { ...e, completado: !current } : e))
  }, [])

  const handleDelete = useCallback(async (id: string) => {
    await deleteCaseEvent(id)
    setEvents(prev => prev.filter(e => e.id !== id))
  }, [])

  const handleEstadoChange = async (newEstado: EstadoCaso) => {
    if (!caso) return
    setSavingEstado(true)
    const updated = await updateCase(caso.id, { estado: newEstado })
    setCaso(updated)
    setEditingEstado(false)
    setSavingEstado(false)
  }

  if (authLoading || loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 size={28} className="animate-spin text-navy-400" />
    </div>
  )
  if (!caso || !user) return null

  const tipoStyle   = TIPO_PROCESO_COLORS[caso.tipo_proceso]
  const estadoStyle = ESTADO_CASO_COLORS[caso.estado]
  const pendientes  = events.filter(e => !e.completado && e.fecha_limite)
  const proximos    = pendientes
    .sort((a, b) => (a.fecha_limite ?? '').localeCompare(b.fecha_limite ?? ''))
    .slice(0, 3)

  const TABS: { id: Tab; label: string; count?: number }[] = [
    { id: 'info',        label: 'Información' },
    { id: 'actuaciones', label: 'Actuaciones', count: events.length },
    { id: 'notas',       label: 'Notas',       count: notes.length },
    { id: 'exportar',    label: 'Exportar' },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Breadcrumb */}
      <Link href="/casos" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-navy-800 mb-6 transition-colors">
        <ArrowLeft size={15} />Volver a mis casos
      </Link>

      {/* Header del expediente */}
      <div className="lex-card overflow-hidden mb-6">
        <div className="h-2 w-full" style={{ background: `linear-gradient(90deg, ${tipoStyle.color}, ${tipoStyle.color}99)` }} />
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: tipoStyle.bg }}
              >
                <Briefcase size={20} style={{ color: tipoStyle.color }} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{ background: tipoStyle.bg, color: tipoStyle.color }}
                  >
                    {TIPO_PROCESO_LABELS[caso.tipo_proceso]}
                  </span>

                  {/* Estado editable */}
                  {editingEstado ? (
                    <div className="flex items-center gap-1">
                      <select autoFocus defaultValue={caso.estado}
                        onChange={e => handleEstadoChange(e.target.value as EstadoCaso)}
                        className="text-xs px-2 py-1 rounded-lg border border-navy-300 focus:outline-none focus:ring-2 focus:ring-navy-200"
                      >
                        {ESTADOS.map(s => (
                          <option key={s} value={s}>{ESTADO_CASO_LABELS[s]}</option>
                        ))}
                      </select>
                      {savingEstado
                        ? <Loader2 size={13} className="animate-spin text-navy-400" />
                        : <button onClick={() => setEditingEstado(false)} className="p-1 text-slate-400 hover:text-slate-600"><X size={13} /></button>
                      }
                    </div>
                  ) : (
                    <button onClick={() => setEditingEstado(true)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all hover:opacity-80 group"
                      style={{ background: estadoStyle.bg, color: estadoStyle.color }}
                    >
                      {ESTADO_CASO_LABELS[caso.estado]}
                      <Edit2 size={9} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  )}
                </div>
                <h1 className="font-display font-bold text-xl text-navy-900 leading-snug">{caso.titulo}</h1>
                {caso.referencia && <p className="text-xs text-slate-400 font-mono mt-0.5">Rad. {caso.referencia}</p>}
              </div>
            </div>
          </div>

          {/* Meta rápida */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <User size={14} className="text-slate-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-400">Cliente</p>
                <p className="text-sm font-semibold text-navy-900 truncate">{caso.cliente_nombre}</p>
              </div>
            </div>
            {caso.juzgado && (
              <div className="flex items-center gap-2">
                <Building size={14} className="text-slate-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-400">Juzgado</p>
                  <p className="text-sm font-semibold text-navy-900 truncate">{caso.juzgado}</p>
                </div>
              </div>
            )}
            {caso.ciudad && (
              <div className="flex items-center gap-2">
                <Building size={14} className="text-slate-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-400">Ciudad</p>
                  <p className="text-sm font-semibold text-navy-900">{caso.ciudad}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-slate-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-400">Inicio</p>
                <p className="text-sm font-semibold text-navy-900">
                  {new Date(caso.fecha_inicio + 'T12:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Alertas de vencimientos próximos */}
        {proximos.length > 0 && (
          <div className="border-t border-slate-100 px-6 py-3 bg-red-50">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={14} className="text-red-600" />
              <span className="text-xs font-semibold text-red-700">Términos próximos a vencer</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {proximos.map(e => {
                const dias = getDiasRestantes(e.fecha_limite!)
                const urg  = getUrgenciaColor(dias)
                return (
                  <div key={e.id} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ background: urg.bg, color: urg.color }}
                  >
                    <Clock size={10} />
                    {e.titulo} — {dias === 0 ? 'hoy' : `${dias}d`}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl border border-slate-200 bg-white mb-6 overflow-x-auto">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn('flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
              tab === t.id ? 'bg-navy-900 text-white' : 'text-slate-500 hover:bg-slate-50'
            )}
          >
            {t.label}
            {t.count !== undefined && (
              <span className={cn('inline-flex items-center px-1.5 py-0.5 rounded-full text-xs',
                tab === t.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              )}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'info' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {caso.descripcion && (
            <div className="lex-card p-5 sm:col-span-2">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Descripción</h3>
              <p className="text-sm text-slate-700 leading-relaxed">{caso.descripcion}</p>
            </div>
          )}
          {caso.cliente_contacto && (
            <div className="lex-card p-5">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Contacto cliente</h3>
              <p className="text-sm font-medium text-navy-900">{caso.cliente_contacto}</p>
            </div>
          )}
          {caso.despacho && (
            <div className="lex-card p-5">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Despacho / Sala</h3>
              <p className="text-sm font-medium text-navy-900">{caso.despacho}</p>
            </div>
          )}
          {caso.notas_generales && (
            <div className="lex-card p-5 sm:col-span-2 bg-amber-50 border-amber-100">
              <h3 className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">Notas generales</h3>
              <p className="text-sm text-amber-900 leading-relaxed">{caso.notas_generales}</p>
            </div>
          )}
        </div>
      )}

      {tab === 'actuaciones' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              <span className="font-semibold text-navy-900">{events.length}</span> actuaciones registradas
              {pendientes.length > 0 && <span className="ml-2 text-red-600 font-semibold">· {pendientes.length} pendientes</span>}
            </p>
            <button onClick={() => setShowModal(true)}
              className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
            >
              <Plus size={14} />Nueva actuación
            </button>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-16 lex-card">
              <Clock size={36} className="mx-auto mb-3 text-slate-200" />
              <p className="font-display font-semibold text-navy-900 mb-1">Sin actuaciones aún</p>
              <p className="text-sm text-slate-500 mb-4">Registra términos procesales o actuaciones del caso</p>
              <button onClick={() => setShowModal(true)}
                className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm"
              >
                <Plus size={14} />Agregar primera actuación
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {events.map(e => (
                <CaseEventItem key={e.id} event={e} onToggle={handleToggle} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'notas' && (
        <div className="space-y-4">
          {notes.length === 0 ? (
            <div className="text-center py-16 lex-card">
              <FileText size={36} className="mx-auto mb-3 text-slate-200" />
              <p className="font-display font-semibold text-navy-900 mb-1">Sin notas vinculadas</p>
              <p className="text-sm text-slate-500 mb-4">Las notas se vinculan al crear una nota nueva</p>
              <Link href="/notas/nueva" className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm">
                <Plus size={14} />Crear nota
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map(n => (
                <Link key={n.id} href={`/notas/${n.id}`}
                  className="lex-card flex items-start gap-4 p-5 hover:border-navy-200 transition-all group"
                >
                  <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                    style={{ background: n.is_pinned ? 'var(--navy-700)' : 'var(--slate-300)' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-navy-900 group-hover:text-navy-700 truncate">{n.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{n.content?.slice(0, 80) || 'Sin contenido'}</p>
                  </div>
                  <span className="text-xs text-slate-400 flex-shrink-0 mt-0.5">
                    {new Date(n.updated_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'exportar' && (
        <ExportExpediente caso={caso} events={events} notes={notes} />
      )}

      {showModal && (
        <NewEventModal
          caseId={caso.id}
          userId={user.id}
          onSave={handleNewEvent}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
