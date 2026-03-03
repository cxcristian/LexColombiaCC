'use client'

import { useState } from 'react'
import { Check, Trash2, Clock, Calendar, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'
import {
  TIPO_EVENTO_LABELS, TIPO_EVENTO_COLORS,
  getDiasRestantes, getDiasHabilesRestantes, getUrgenciaColor,
  type CaseEvent,
} from '@/types/cases'
import { cn } from '@/lib/utils'

interface Props {
  event: CaseEvent
  onToggle: (id: string, current: boolean) => void
  onDelete: (id: string) => void
}

export function CaseEventItem({ event, onToggle, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false)
  const tipoColor  = TIPO_EVENTO_COLORS[event.tipo]
  const diasCal    = event.fecha_limite ? getDiasRestantes(event.fecha_limite) : null
  const diasHab    = event.fecha_limite ? getDiasHabilesRestantes(event.fecha_limite) : null
  const urgencia   = diasCal !== null ? getUrgenciaColor(diasCal) : null

  return (
    <div className={cn(
      'border rounded-xl overflow-hidden transition-all',
      event.completado ? 'border-slate-200 bg-slate-50 opacity-60' : 'border-slate-200 bg-white hover:border-slate-300'
    )}>
      {/* Main row */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Complete toggle */}
        <button onClick={() => onToggle(event.id, event.completado)}
          className={cn(
            'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
            event.completado
              ? 'border-green-500 bg-green-500'
              : 'border-slate-300 hover:border-navy-400'
          )}
        >
          {event.completado && <Check size={10} className="text-white" />}
        </button>

        {/* Type dot */}
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: tipoColor }} />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn(
              'text-sm font-semibold text-navy-900',
              event.completado && 'line-through text-slate-400'
            )}>
              {event.titulo}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: `${tipoColor}15`, color: tipoColor }}
            >
              {TIPO_EVENTO_LABELS[event.tipo]}
            </span>
            {event.dias_habiles && (
              <span className="text-xs text-slate-400">{event.dias_habiles} d.h.</span>
            )}
          </div>

          {/* Fecha evento */}
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Calendar size={10} />
              {new Date(event.fecha_evento + 'T12:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
            {event.fecha_limite && urgencia && !event.completado && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: urgencia.bg, color: urgencia.color }}
              >
                {diasCal !== null && diasCal <= 3 && <AlertTriangle size={10} />}
                <Clock size={10} />
                {diasCal !== null && diasCal < 0
                  ? `Vencido hace ${Math.abs(diasCal)}d`
                  : diasCal === 0
                  ? 'Vence hoy'
                  : `${diasCal}d cal · ${diasHab}d háb`
                }
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {event.descripcion && (
            <button onClick={() => setExpanded(!expanded)}
              className="w-7 h-7 rounded flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
          <button onClick={() => onDelete(event.id)}
            className="w-7 h-7 rounded flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Expanded: fecha límite + descripción */}
      {expanded && event.descripcion && (
        <div className="px-4 pb-3 pt-0 border-t border-slate-100 bg-slate-50">
          {event.fecha_limite && (
            <div className="flex items-center gap-2 mb-2 pt-2">
              <Clock size={12} className="text-slate-400" />
              <span className="text-xs text-slate-500">
                Fecha límite: <strong className="text-navy-800">
                  {new Date(event.fecha_limite + 'T12:00').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </strong>
              </span>
            </div>
          )}
          <p className="text-xs text-slate-600 leading-relaxed">{event.descripcion}</p>
        </div>
      )}
    </div>
  )
}
