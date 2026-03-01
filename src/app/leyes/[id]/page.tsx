import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getLeyById } from '@/lib/apis/suin'
import { formatDate, TIPO_NORMA_LABELS, ESTADO_NORMA_LABELS, TIPO_NORMA_COLORS, ESTADO_COLORS, cn } from '@/lib/utils'
import { Badge } from '@/components/ui'
import { ArrowLeft, Calendar, Building2, ExternalLink, Hash, Tag, CheckCircle2, XCircle, AlertCircle, HelpCircle } from 'lucide-react'
import type { EstadoNorma } from '@/types'

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const norma = await getLeyById(decodeURIComponent(params.id))
  if (!norma) return { title: 'Norma no encontrada' }
  return {
    title: `${TIPO_NORMA_LABELS[norma.tipo]} ${norma.numero} de ${norma.anio}`,
    description: norma.titulo,
  }
}

const ESTADO_ICONS: Record<EstadoNorma, React.ElementType> = {
  VIGENTE: CheckCircle2,
  DEROGADO: XCircle,
  MODIFICADO: AlertCircle,
  DESCONOCIDO: HelpCircle,
}

export default async function LeyDetailPage({ params }: Props) {
  const id = decodeURIComponent(params.id)
  const norma = await getLeyById(id)

  if (!norma) notFound()

  const EstadoIcon = ESTADO_ICONS[norma.estado]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Back */}
      <Link
        href="/leyes"
        className="inline-flex items-center gap-2 text-sm mb-8 transition-colors hover:text-amber-700"
        style={{ color: 'var(--color-ink-faint)' }}
      >
        <ArrowLeft size={15} />
        Volver a Leyes y Normas
      </Link>

      {/* Main card */}
      <article
        className="rounded-2xl border overflow-hidden"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
      >
        {/* Colored top bar by tipo */}
        <div
          className="h-1.5 w-full"
          style={{ background: 'linear-gradient(90deg, var(--color-gold), var(--color-gold-light, #e8b830))' }}
        />

        <div className="p-8 sm:p-10">
          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <Badge className={cn(TIPO_NORMA_COLORS[norma.tipo], 'text-sm px-3 py-1')}>
              {TIPO_NORMA_LABELS[norma.tipo]}
            </Badge>
            <Badge className={cn(ESTADO_COLORS[norma.estado], 'text-sm px-3 py-1 flex items-center gap-1.5')}>
              <EstadoIcon size={13} />
              {ESTADO_NORMA_LABELS[norma.estado]}
            </Badge>
          </div>

          {/* Title */}
          <h1
            className="font-display font-bold text-2xl sm:text-3xl leading-tight mb-8"
            style={{ color: 'var(--color-ink)' }}
          >
            {norma.titulo}
          </h1>

          {/* Metadata grid */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-6 rounded-xl mb-8"
            style={{ background: 'rgba(200,144,10,0.04)', border: '1px solid rgba(200,144,10,0.12)' }}
          >
            <MetaItem icon={Hash} label="Número" value={norma.numero} />
            <MetaItem icon={Calendar} label="Año" value={norma.anio} />
            {norma.fecha && (
              <MetaItem icon={Calendar} label="Fecha" value={formatDate(norma.fecha)} />
            )}
            <MetaItem icon={Building2} label="Entidad emisora" value={norma.entidad} />
            {norma.materia && (
              <MetaItem icon={Tag} label="Materia" value={norma.materia} />
            )}
          </div>

          {/* Link oficial */}
          {norma.linkOficial && (
            <div className="mb-8">
              <h2
                className="font-display font-semibold text-lg mb-3"
                style={{ color: 'var(--color-ink)' }}
              >
                Texto Oficial
              </h2>
              <a
                href={norma.linkOficial}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all hover:scale-105"
                style={{ background: 'var(--color-gold)', color: '#0f0b05' }}
              >
                <ExternalLink size={15} />
                Ver texto completo en fuente oficial
              </a>
            </div>
          )}

          {/* Disclaimer */}
          <div
            className="text-xs p-4 rounded-lg border"
            style={{
              borderColor: 'rgba(200,144,10,0.15)',
              background: 'rgba(200,144,10,0.04)',
              color: 'var(--color-ink-faint)',
            }}
          >
            Esta información proviene de la base de datos pública SUIN-Juriscol (datos.gov.co).
            Para consulta oficial, dirígete a la fuente original o a un profesional del derecho.
          </div>
        </div>
      </article>
    </div>
  )
}

function MetaItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value?: string
}) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: 'rgba(200,144,10,0.1)' }}
      >
        <Icon size={14} style={{ color: 'var(--color-gold)' }} />
      </div>
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'var(--color-ink-faint)' }}>
          {label}
        </div>
        <div className="text-sm font-medium" style={{ color: 'var(--color-ink)' }}>
          {value}
        </div>
      </div>
    </div>
  )
}
