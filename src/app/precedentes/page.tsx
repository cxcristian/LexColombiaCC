import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getPrecedentes } from '@/lib/apis/precedentes'
import type { PrecedentesFilters, TipoPrecedente, Corporacion } from '@/types'
import { PrecedenteCard } from '@/components/laws/PrecedenteCard'
import { PrecedenteFilters } from '@/components/laws/PrecedenteFilters'
import { Gavel, Info } from 'lucide-react'
import PrecedentesClientPagination from './PrecedentesClientPagination'

export const metadata: Metadata = {
  title: 'Precedentes Judiciales de Colombia',
  description: 'Sentencias históricas de la Corte Constitucional, Consejo de Estado y Corte Suprema de Justicia de Colombia.',
}

interface PageProps {
  searchParams: {
    q?: string
    tipo?: string
    corp?: string
    anio?: string
    page?: string
  }
}

export default async function PrecedentesPage({ searchParams }: PageProps) {
  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10))
  const filters: PrecedentesFilters = {
    query: searchParams.q ?? '',
    tipo: (searchParams.tipo as TipoPrecedente) || undefined,
    corporacion: (searchParams.corp as Corporacion) || undefined,
    anio: searchParams.anio ?? '',
    page,
    pageSize: 9,
  }

  const result = await getPrecedentes(filters)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(168,32,32,0.1)', border: '1px solid rgba(168,32,32,0.2)' }}
          >
            <Gavel size={18} style={{ color: 'var(--color-seal)' }} />
          </div>
          <h1 className="font-display font-bold text-3xl" style={{ color: 'var(--navy-900)' }}>
            Precedentes Judiciales
          </h1>
        </div>
        <p className="text-sm" style={{ color: 'var(--slate-500)' }}>
          Sentencias históricas · Corte Constitucional · Consejo de Estado · Corte Suprema
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <Suspense>
          <PrecedenteFilters />
        </Suspense>
      </div>

      {/* Count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm" style={{ color: 'var(--slate-500)' }}>
          <span className="font-semibold" style={{ color: 'var(--navy-900)' }}>
            {result.total}
          </span>{' '}
          precedentes encontrados
        </p>
        <p className="text-xs" style={{ color: 'var(--color-ink-faint)' }}>
          Pág. {page} de {Math.ceil(result.total / 9) || 1}
        </p>
      </div>

      {/* Grid */}
      {result.data.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {result.data.map((p, i) => (
            <PrecedenteCard key={p.id} precedente={p} index={i} />
          ))}
        </div>
      ) : (
        <div
          className="text-center py-20 rounded-xl border"
          style={{ borderColor: 'var(--slate-200)', background: 'white' }}
        >
          <Gavel size={40} className="mx-auto mb-4" style={{ color: 'var(--color-ink-faint)' }} />
          <h3 className="font-display font-semibold text-xl mb-2">Sin precedentes</h3>
          <p className="text-sm" style={{ color: 'var(--slate-500)' }}>
            Intenta con otros términos o ajusta los filtros
          </p>
        </div>
      )}

      {/* Pagination */}
      <Suspense>
        <PrecedentesClientPagination
          page={page}
          total={result.total}
          pageSize={9}
          searchParams={searchParams}
        />
      </Suspense>

      {/* Info */}
      <div
        className="mt-10 flex items-start gap-3 p-4 rounded-xl border text-sm"
        style={{ borderColor: 'rgba(168,32,32,0.15)', background: 'rgba(168,32,32,0.03)', color: 'var(--slate-500)' }}
      >
        <Info size={16} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--color-seal)' }} />
        <p>
          Sentencias obtenidas de la base de datos oficial de datos.gov.co (Corte Constitucional).
          Para consulta oficial, usa el enlace al texto original en la relatoría de la Corte.
        </p>
      </div>
    </div>
  )
}
