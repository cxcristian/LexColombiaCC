import Link from 'next/link'
import { ExternalLink, FileText, Calendar, Building } from 'lucide-react'
import type { Norma } from '@/types'
import { Badge } from '@/components/ui'
import { cn } from '@/lib/utils'

const TIPO_COLOR: Record<string, 'navy' | 'gold' | 'green' | 'red' | 'blue'> = {
  LEY: 'navy', DECRETO: 'blue', RESOLUCIÓN: 'green', CIRCULAR: 'gold',
  ORDENANZA: 'gold', ACUERDO: 'navy',
}
const ESTADO_COLOR: Record<string, 'green' | 'red' | 'gold'> = {
  VIGENTE: 'green', DEROGADO: 'red', MODIFICADO: 'gold',
}

interface Props { norma: Norma; index?: number }

export function LawCard({ norma, index = 0 }: Props) {
  return (
    <article
      className="lex-card p-5 flex flex-col opacity-0 animate-fade-up"
      style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex flex-wrap gap-1.5">
          <Badge variant={TIPO_COLOR[norma.tipo] ?? 'navy'}>{norma.tipo}</Badge>
          {norma.estado && <Badge variant={ESTADO_COLOR[norma.estado] ?? 'slate'}>{norma.estado}</Badge>}
        </div>
        <span className="font-mono text-xs text-slate-400 flex-shrink-0">{norma.anio}</span>
      </div>

      {/* Title */}
      <h3 className="font-display font-semibold text-navy-900 text-sm leading-snug mb-2 line-clamp-2 flex-1">
        {norma.titulo}
      </h3>

      {/* Meta */}
      <div className="space-y-1 mb-4">
        {norma.entidad && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Building size={11} />
            <span className="truncate">{norma.entidad}</span>
          </div>
        )}
        {norma.fecha && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Calendar size={11} />
            {norma.fecha}
          </div>
        )}
        {norma.materia && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <FileText size={11} />
            <span className="truncate">{norma.materia}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        <Link href={`/leyes/${norma.id}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-navy-200 bg-navy-50 text-navy-800 text-xs font-semibold hover:bg-navy-100 transition-colors"
        >
          <FileText size={12} />Ver documento
        </Link>
        {norma.linkOficial && (
          <a href={norma.linkOficial} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-slate-500 text-xs hover:bg-slate-50 transition-colors"
          >
            <ExternalLink size={12} />
          </a>
        )}
      </div>
    </article>
  )
}
