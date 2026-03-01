import Link from 'next/link'
import { ExternalLink, Gavel, User, Calendar, Tag } from 'lucide-react'
import type { Precedente } from '@/types'
import { Badge } from '@/components/ui'

const CORP_COLOR: Record<string, 'navy' | 'red' | 'blue'> = {
  'Corte Constitucional': 'red',
  'Consejo de Estado': 'navy',
  'Corte Suprema de Justicia': 'blue',
}

interface Props { precedente: Precedente; index?: number }

export function PrecedenteCard({ precedente, index = 0 }: Props) {
  const corpColor = CORP_COLOR[precedente.corporacion] ?? 'navy'
  return (
    <article
      className="lex-card p-5 flex flex-col opacity-0 animate-fade-up"
      style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <Badge variant={corpColor}>{precedente.corporacion}</Badge>
        <span className="font-mono text-xs font-bold text-navy-700">{precedente.numero}</span>
      </div>

      {/* Title */}
      {precedente.tematico && (
        <h3 className="font-display font-semibold text-navy-900 text-sm leading-snug mb-2 line-clamp-2">
          {precedente.tematico}
        </h3>
      )}

      {/* Summary */}
      {precedente.resumen && (
        <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-3 flex-1">
          {precedente.resumen}
        </p>
      )}

      {/* Meta */}
      <div className="space-y-1 mb-3">
        {precedente.magistradoPonente && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <User size={11} />
            <span className="truncate">M.P. {precedente.magistradoPonente}</span>
          </div>
        )}
        {precedente.fecha && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Calendar size={11} />{precedente.fecha}
          </div>
        )}
      </div>

      {/* Keywords */}
      {precedente.palabrasClave && precedente.palabrasClave.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {precedente.palabrasClave.slice(0, 3).map(k => (
            <span key={k} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600">
              <Tag size={9} />{k}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        <Link href={`/precedentes/${precedente.id}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-navy-200 bg-navy-50 text-navy-800 text-xs font-semibold hover:bg-navy-100 transition-colors"
        >
          <Gavel size={12} />Ver sentencia
        </Link>
        {precedente.linkOficial && (
          <a href={precedente.linkOficial} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-slate-500 text-xs hover:bg-slate-50 transition-colors"
          >
            <ExternalLink size={12} />
          </a>
        )}
      </div>
    </article>
  )
}
