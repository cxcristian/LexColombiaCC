'use client'

import Link from 'next/link'
import { Calendar, User, Building, ChevronRight, Clock, AlertTriangle } from 'lucide-react'
import type { Case } from '@/types/cases'
import {
  TIPO_PROCESO_LABELS, TIPO_PROCESO_COLORS,
  ESTADO_CASO_LABELS, ESTADO_CASO_COLORS,
  getDiasRestantes, getUrgenciaColor,
} from '@/types/cases'
import { cn } from '@/lib/utils'

interface Props {
  caso: Case & { events_count?: number; next_deadline?: string | null }
  index?: number
}

export function CaseCard({ caso, index = 0 }: Props) {
  const tipoStyle   = TIPO_PROCESO_COLORS[caso.tipo_proceso]
  const estadoStyle = ESTADO_CASO_COLORS[caso.estado]
  const deadline    = caso.next_deadline
  const dias        = deadline ? getDiasRestantes(deadline) : null
  const urgencia    = dias !== null ? getUrgenciaColor(dias) : null

  return (
    <Link href={`/casos/${caso.id}`}
      className="lex-card flex flex-col p-5 opacity-0 animate-fade-up group"
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'forwards' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex gap-2 flex-wrap">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ background: tipoStyle.bg, color: tipoStyle.color }}
          >
            {TIPO_PROCESO_LABELS[caso.tipo_proceso]}
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ background: estadoStyle.bg, color: estadoStyle.color }}
          >
            {ESTADO_CASO_LABELS[caso.estado]}
          </span>
        </div>
        <ChevronRight size={16} className="text-slate-300 group-hover:text-navy-400 transition-colors flex-shrink-0 mt-0.5" />
      </div>

      {/* Título */}
      <h3 className="font-display font-semibold text-navy-900 text-base leading-snug mb-1 line-clamp-2 group-hover:text-navy-700 transition-colors">
        {caso.titulo}
      </h3>
      {caso.referencia && (
        <p className="text-xs text-slate-400 font-mono mb-3">Rad. {caso.referencia}</p>
      )}

      {/* Meta */}
      <div className="space-y-1.5 mb-4 flex-1">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <User size={12} className="flex-shrink-0" />
          <span className="truncate">{caso.cliente_nombre}</span>
        </div>
        {caso.juzgado && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Building size={12} className="flex-shrink-0" />
            <span className="truncate">{caso.juzgado}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Calendar size={12} className="flex-shrink-0" />
          <span>Inicio: {new Date(caso.fecha_inicio + 'T12:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Próximo vencimiento */}
      {urgencia && deadline && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl mt-auto"
          style={{ background: urgencia.bg }}
        >
          {dias !== null && dias <= 5
            ? <AlertTriangle size={13} style={{ color: urgencia.color }} />
            : <Clock size={13} style={{ color: urgencia.color }} />
          }
          <span className="text-xs font-semibold" style={{ color: urgencia.color }}>
            {dias !== null && dias < 0
              ? `Vencido hace ${Math.abs(dias)} días`
              : dias === 0
              ? 'Vence hoy'
              : `${dias} días para próximo vencimiento`
            }
          </span>
        </div>
      )}
    </Link>
  )
}
