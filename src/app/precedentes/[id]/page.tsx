import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPrecedenteById, CORPORACION_LABELS, TIPO_PRECEDENTE_LABELS } from '@/lib/apis/precedentes'
import { formatDate, cn } from '@/lib/utils'
import { Badge } from '@/components/ui'
import { ArrowLeft, Calendar, User2, ExternalLink, Tag, Scale } from 'lucide-react'

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getPrecedenteById(decodeURIComponent(params.id))
  if (!p) return { title: 'Precedente no encontrado' }
  return {
    title: `Sentencia ${p.numero}`,
    description: p.tematico,
  }
}

const CORP_COLORS: Record<string, string> = {
  CORTE_CONSTITUCIONAL: 'bg-red-50 text-red-700 border-red-200',
  CONSEJO_DE_ESTADO: 'bg-blue-50 text-blue-700 border-blue-200',
  CORTE_SUPREMA_DE_JUSTICIA: 'bg-purple-50 text-purple-700 border-purple-200',
  CONSEJO_SUPERIOR_JUDICATURA: 'bg-green-50 text-green-700 border-green-200',
}

export default async function PrecedenteDetailPage({ params }: Props) {
  const id = decodeURIComponent(params.id)
  const precedente = await getPrecedenteById(id)
  if (!precedente) notFound()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Back */}
      <Link
        href="/precedentes"
        className="inline-flex items-center gap-2 text-sm mb-8 transition-colors hover:text-red-700"
        style={{ color: 'var(--color-ink-faint)' }}
      >
        <ArrowLeft size={15} />
        Volver a Precedentes
      </Link>

      <article
        className="rounded-2xl border overflow-hidden"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
      >
        {/* Red top bar */}
        <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, #a82020, #c73434)' }} />

        <div className="p-8 sm:p-10">
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-5">
            <Badge className={cn(CORP_COLORS[precedente.corporacion] ?? '', 'text-sm px-3 py-1')}>
              {CORPORACION_LABELS[precedente.corporacion]}
            </Badge>
            <Badge className="bg-gray-50 text-gray-700 border-gray-200 text-sm px-3 py-1">
              {TIPO_PRECEDENTE_LABELS[precedente.tipo]}
            </Badge>
          </div>

          {/* Number */}
          <div className="mb-2">
            <span
              className="font-mono font-black text-4xl"
              style={{ color: 'var(--color-seal)' }}
            >
              {precedente.numero}
            </span>
          </div>

          {/* Tematic */}
          {precedente.tematico && (
            <h1
              className="font-display font-bold text-2xl sm:text-3xl leading-tight mb-8"
              style={{ color: 'var(--color-ink)' }}
            >
              {precedente.tematico}
            </h1>
          )}

          {/* Meta grid */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-xl mb-8"
            style={{ background: 'rgba(168,32,32,0.04)', border: '1px solid rgba(168,32,32,0.1)' }}
          >
            <MetaItem icon={Calendar} label="Fecha" value={formatDate(precedente.fecha)} />
            <MetaItem icon={Scale} label="Corporación" value={CORPORACION_LABELS[precedente.corporacion]} />
            {precedente.magistradoPonente && (
              <MetaItem icon={User2} label="Magistrado Ponente" value={precedente.magistradoPonente} />
            )}
          </div>

          {/* Summary */}
          {precedente.resumen && (
            <div className="mb-8">
              <h2 className="font-display font-bold text-xl mb-4" style={{ color: 'var(--color-ink)' }}>
                Resumen de la sentencia
              </h2>
              <div
                className="p-5 rounded-xl border-l-4 text-base leading-relaxed"
                style={{
                  borderLeftColor: 'var(--color-seal)',
                  background: 'rgba(168,32,32,0.03)',
                  color: 'var(--color-ink)',
                }}
              >
                {precedente.resumen}
              </div>
            </div>
          )}

          {/* Keywords */}
          {precedente.palabrasClave && precedente.palabrasClave.length > 0 && (
            <div className="mb-8">
              <h2 className="font-display font-semibold text-lg mb-3" style={{ color: 'var(--color-ink)' }}>
                Palabras clave
              </h2>
              <div className="flex flex-wrap gap-2">
                {precedente.palabrasClave.map(k => (
                  <span
                    key={k}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border"
                    style={{ background: 'rgba(168,32,32,0.06)', color: 'var(--color-seal)', borderColor: 'rgba(168,32,32,0.15)' }}
                  >
                    <Tag size={11} />
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Link official */}
          {precedente.linkOficial && (
            <div className="mb-8">
              <h2 className="font-display font-semibold text-lg mb-3" style={{ color: 'var(--color-ink)' }}>
                Texto oficial
              </h2>
              <a
                href={precedente.linkOficial}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all hover:scale-105 hover:opacity-90"
                style={{ background: 'var(--color-seal)', color: 'white' }}
              >
                <ExternalLink size={15} />
                Ver sentencia completa en fuente oficial
              </a>
            </div>
          )}

          {/* Disclaimer */}
          <div
            className="text-xs p-4 rounded-lg border"
            style={{ borderColor: 'rgba(168,32,32,0.12)', background: 'rgba(168,32,32,0.03)', color: 'var(--color-ink-faint)' }}
          >
            El resumen es editorial y no reemplaza la lectura del texto completo de la sentencia.
            Para efectos jurídicos, consulta el texto oficial o a un profesional del derecho.
          </div>
        </div>
      </article>
    </div>
  )
}

function MetaItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: 'rgba(168,32,32,0.08)' }}
      >
        <Icon size={14} style={{ color: 'var(--color-seal)' }} />
      </div>
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'var(--color-ink-faint)' }}>{label}</div>
        <div className="text-sm font-medium" style={{ color: 'var(--color-ink)' }}>{value}</div>
      </div>
    </div>
  )
}
