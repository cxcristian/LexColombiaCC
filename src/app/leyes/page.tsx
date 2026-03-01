import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getLeyes } from '@/lib/apis/suin'
import type { LeyesFilters, TipoNorma, EstadoNorma } from '@/types'
import { LawCard } from '@/components/laws/LawCard'
import { LawFilters } from '@/components/laws/LawFilters'
import { LawCardSkeleton, Pagination } from '@/components/ui'
import { BookOpen, Info } from 'lucide-react'
import LeyesClientPagination from './LeyesClientPagination'

export const metadata: Metadata = {
  title: 'Leyes y Normas de Colombia',
  description: 'Consulta todas las leyes, decretos, resoluciones y normas colombianas desde 1886. Búsqueda avanzada por tipo, año y estado.',
}

interface PageProps {
  searchParams: {
    q?: string
    tipo?: string
    anio?: string
    estado?: string
    page?: string
  }
}

export default async function LeyesPage({ searchParams }: PageProps) {
  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10))
  const filters: LeyesFilters = {
    query: searchParams.q ?? '',
    tipo: (searchParams.tipo as TipoNorma) || undefined,
    anio: searchParams.anio ?? '',
    estado: (searchParams.estado as EstadoNorma) || undefined,
    page,
    pageSize: 12,
  }

  const result = await getLeyes(filters)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(200,144,10,0.1)', border: '1px solid rgba(200,144,10,0.2)' }}
          >
            <BookOpen size={18} style={{ color: 'var(--navy-700)' }} />
          </div>
          <h1 className="font-display font-bold text-3xl" style={{ color: 'var(--navy-900)' }}>
            Leyes y Normas
          </h1>
        </div>
        <p className="text-sm" style={{ color: 'var(--slate-500)' }}>
          Normativa colombiana desde 1886 · Fuente: datos.gov.co / SUIN-Juriscol
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <Suspense>
          <LawFilters />
        </Suspense>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm" style={{ color: 'var(--slate-500)' }}>
          {result.total > 0 ? (
            <>
              <span className="font-semibold" style={{ color: 'var(--navy-900)' }}>
                {result.total.toLocaleString('es-CO')}
              </span>{' '}
              normas encontradas
              {filters.query && (
                <> para <span className="italic">"{filters.query}"</span></>
              )}
            </>
          ) : (
            'Sin resultados'
          )}
        </p>
        <p className="text-xs" style={{ color: 'var(--color-ink-faint)' }}>
          Pág. {page} de {Math.ceil(result.total / 12)}
        </p>
      </div>

      {/* Grid */}
      {result.data.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {result.data.map((norma, i) => (
            <LawCard key={norma.id} norma={norma} index={i} />
          ))}
        </div>
      ) : (
        <div
          className="text-center py-20 rounded-xl border"
          style={{ borderColor: 'var(--slate-200)', background: 'white' }}
        >
          <div className="mb-4" style={{ color: 'var(--color-ink-faint)' }}>
            <BookOpen size={40} className="mx-auto" />
          </div>
          <h3 className="font-display font-semibold text-xl mb-2">No encontramos normas</h3>
          <p className="text-sm" style={{ color: 'var(--slate-500)' }}>
            Intenta con otros términos o ajusta los filtros
          </p>
        </div>
      )}

      {/* Pagination */}
      <Suspense>
        <LeyesClientPagination
          page={page}
          total={result.total}
          pageSize={12}
          searchParams={searchParams}
        />
      </Suspense>

      {/* Disclaimer */}
      <div
        className="mt-10 flex items-start gap-3 p-4 rounded-xl border text-sm"
        style={{ borderColor: 'rgba(200,144,10,0.2)', background: 'rgba(200,144,10,0.04)', color: 'var(--slate-500)' }}
      >
        <Info size={16} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--navy-700)' }} />
        <p>
          Los datos provienen de la API pública de{' '}
          <a href="https://www.datos.gov.co" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-700">
            datos.gov.co
          </a>{' '}
          (SUIN-Juriscol). Para el texto completo de cada norma, sigue el enlace al texto oficial.
          Esta plataforma no ofrece asesoría jurídica.
        </p>
      </div>
    </div>
  )
}
