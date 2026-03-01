'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState, useTransition } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import type { TipoNorma, EstadoNorma } from '@/types'
import { TIPO_NORMA_LABELS, ANOS_DISPONIBLES, cn } from '@/lib/utils'

const TIPOS: Array<{ value: TipoNorma | ''; label: string }> = [
  { value: '', label: 'Todos los tipos' },
  { value: 'LEY', label: 'Leyes' },
  { value: 'DECRETO', label: 'Decretos' },
  { value: 'RESOLUCION', label: 'Resoluciones' },
  { value: 'CIRCULAR', label: 'Circulares' },
  { value: 'ORDENANZA', label: 'Ordenanzas' },
  { value: 'ACUERDO', label: 'Acuerdos' },
]

const ESTADOS: Array<{ value: EstadoNorma | ''; label: string }> = [
  { value: '', label: 'Todos los estados' },
  { value: 'VIGENTE', label: 'Vigente' },
  { value: 'DEROGADO', label: 'Derogado' },
  { value: 'MODIFICADO', label: 'Modificado' },
]

const selectClass =
  'w-full px-3 py-2.5 rounded-lg border text-sm appearance-none cursor-pointer bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400/50'
const selectStyle = { borderColor: 'var(--color-border)', color: 'var(--color-ink)' }

export function LawFilters() {
  const router = useRouter()
  const params = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [showFilters, setShowFilters] = useState(false)

  const current = {
    query: params.get('q') ?? '',
    tipo: (params.get('tipo') ?? '') as TipoNorma | '',
    anio: params.get('anio') ?? '',
    estado: (params.get('estado') ?? '') as EstadoNorma | '',
  }

  const [query, setQuery] = useState(current.query)

  const updateParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString())
      if (value) next.set(key, value)
      else next.delete(key)
      next.delete('page') // reset page on filter change
      startTransition(() => router.push(`/leyes?${next.toString()}`))
    },
    [params, router]
  )

  const handleSearch = () => updateParam('q', query)
  const clearAll = () => {
    setQuery('')
    startTransition(() => router.push('/leyes'))
  }

  const hasFilters = current.query || current.tipo || current.anio || current.estado

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: 'var(--color-ink-faint)' }}
        />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="Buscar por título, número o materia..."
          className="w-full pl-10 pr-28 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-400/40"
          style={{
            borderColor: 'var(--color-border)',
            background: 'white',
            color: 'var(--color-ink)',
          }}
        />
        <button
          onClick={handleSearch}
          disabled={isPending}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
          style={{ background: 'var(--color-gold)', color: '#0f0b05' }}
        >
          {isPending ? '...' : 'Buscar'}
        </button>
      </div>

      {/* Filter toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm border transition-all',
            showFilters ? 'bg-amber-50 border-amber-300 text-amber-800' : 'hover:bg-black/5'
          )}
          style={!showFilters ? { borderColor: 'var(--color-border)', color: 'var(--color-ink)' } : {}}
        >
          <SlidersHorizontal size={14} />
          Filtros avanzados
          {(current.tipo || current.anio || current.estado) && (
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: 'var(--color-seal)' }}
            />
          )}
        </button>

        {hasFilters && (
          <button
            onClick={clearAll}
            className="inline-flex items-center gap-1.5 text-xs transition-colors hover:text-red-600"
            style={{ color: 'var(--color-ink-faint)' }}
          >
            <X size={12} /> Limpiar todo
          </button>
        )}
      </div>

      {/* Advanced filters */}
      {showFilters && (
        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl border"
          style={{ borderColor: 'var(--color-border)', background: 'rgba(255,255,255,0.5)' }}
        >
          {/* Tipo */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--color-ink-faint)' }}>
              Tipo de norma
            </label>
            <select
              value={current.tipo}
              onChange={e => updateParam('tipo', e.target.value)}
              className={selectClass}
              style={selectStyle}
            >
              {TIPOS.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Año */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--color-ink-faint)' }}>
              Año
            </label>
            <select
              value={current.anio}
              onChange={e => updateParam('anio', e.target.value)}
              className={selectClass}
              style={selectStyle}
            >
              <option value="">Todos los años</option>
              {ANOS_DISPONIBLES.slice(0, 50).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Estado */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--color-ink-faint)' }}>
              Estado
            </label>
            <select
              value={current.estado}
              onChange={e => updateParam('estado', e.target.value)}
              className={selectClass}
              style={selectStyle}
            >
              {ESTADOS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Active filter pills */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2">
          {current.query && (
            <FilterPill label={`"${current.query}"`} onRemove={() => { setQuery(''); updateParam('q', '') }} />
          )}
          {current.tipo && (
            <FilterPill label={TIPO_NORMA_LABELS[current.tipo as TipoNorma]} onRemove={() => updateParam('tipo', '')} />
          )}
          {current.anio && (
            <FilterPill label={current.anio} onRemove={() => updateParam('anio', '')} />
          )}
          {current.estado && (
            <FilterPill label={current.estado} onRemove={() => updateParam('estado', '')} />
          )}
        </div>
      )}
    </div>
  )
}

function FilterPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border"
      style={{ background: 'rgba(200,144,10,0.08)', borderColor: 'rgba(200,144,10,0.25)', color: 'var(--color-gold)' }}
    >
      {label}
      <button onClick={onRemove} className="hover:text-amber-900 transition-colors">
        <X size={10} />
      </button>
    </span>
  )
}
