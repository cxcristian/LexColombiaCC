'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState, useTransition } from 'react'
import { Search, X } from 'lucide-react'
import type { TipoPrecedente, Corporacion } from '@/types'
import { CORPORACION_LABELS, TIPO_PRECEDENTE_LABELS } from '@/lib/apis/precedentes'
import { cn } from '@/lib/utils'

const CORPORACIONES = [
  { value: '' as const, label: 'Todas las corporaciones' },
  ...Object.entries(CORPORACION_LABELS).map(([value, label]) => ({ value: value as Corporacion, label })),
]

const TIPOS = [
  { value: '' as const, label: 'Todos los tipos' },
  ...Object.entries(TIPO_PRECEDENTE_LABELS).map(([value, label]) => ({ value: value as TipoPrecedente, label })),
]

const selectClass = 'w-full px-3 py-2.5 rounded-lg border text-sm appearance-none cursor-pointer bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-red-300/50'
const selectStyle = { borderColor: 'var(--color-border)', color: 'var(--color-ink)' }

export function PrecedenteFilters() {
  const router = useRouter()
  const params = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const current = {
    query: params.get('q') ?? '',
    tipo: (params.get('tipo') ?? '') as TipoPrecedente | '',
    corporacion: (params.get('corp') ?? '') as Corporacion | '',
    anio: params.get('anio') ?? '',
  }

  const [query, setQuery] = useState(current.query)

  const updateParam = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString())
      if (value) next.set(key, value)
      else next.delete(key)
      next.delete('page')
      startTransition(() => router.push(`/precedentes?${next.toString()}`))
    },
    [params, router]
  )

  const handleSearch = () => updateParam('q', query)
  const hasFilters = current.query || current.tipo || current.corporacion || current.anio

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-ink-faint)' }} />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="Buscar por número, tema, magistrado, palabras clave..."
          className="w-full pl-10 pr-28 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-red-300/40"
          style={{ borderColor: 'var(--color-border)', background: 'white', color: 'var(--color-ink)' }}
        />
        <button
          onClick={handleSearch}
          disabled={isPending}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-lg text-sm font-semibold"
          style={{ background: 'var(--color-seal)', color: 'white' }}
        >
          {isPending ? '...' : 'Buscar'}
        </button>
      </div>

      {/* Inline filters */}
      <div
        className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl border"
        style={{ borderColor: 'var(--color-border)', background: 'rgba(255,255,255,0.5)' }}
      >
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--color-ink-faint)' }}>Corporación</label>
          <select value={current.corporacion} onChange={e => updateParam('corp', e.target.value)} className={selectClass} style={selectStyle}>
            {CORPORACIONES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--color-ink-faint)' }}>Tipo de sentencia</label>
          <select value={current.tipo} onChange={e => updateParam('tipo', e.target.value)} className={selectClass} style={selectStyle}>
            {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--color-ink-faint)' }}>Año</label>
          <select value={current.anio} onChange={e => updateParam('anio', e.target.value)} className={selectClass} style={selectStyle}>
            <option value="">Todos los años</option>
            {['2023','2022','2021','2020','2019','2018','2017','2016','2015','2014','2013','2012','2011','2010','2009','2008','2006','2004','2001'].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Active pills */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          {current.query && (
            <Pill label={`"${current.query}"`} onRemove={() => { setQuery(''); updateParam('q', '') }} color="seal" />
          )}
          {current.corporacion && (
            <Pill label={CORPORACION_LABELS[current.corporacion as Corporacion]} onRemove={() => updateParam('corp', '')} color="seal" />
          )}
          {current.tipo && (
            <Pill label={TIPO_PRECEDENTE_LABELS[current.tipo as TipoPrecedente]} onRemove={() => updateParam('tipo', '')} color="seal" />
          )}
          {current.anio && (
            <Pill label={current.anio} onRemove={() => updateParam('anio', '')} color="seal" />
          )}
          <button
            onClick={() => { setQuery(''); startTransition(() => router.push('/precedentes')) }}
            className="text-xs transition-colors hover:text-red-700"
            style={{ color: 'var(--color-ink-faint)' }}
          >
            Limpiar todo
          </button>
        </div>
      )}
    </div>
  )
}

function Pill({ label, onRemove, color }: { label: string; onRemove: () => void; color: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border"
      style={{ background: 'rgba(168,32,32,0.07)', borderColor: 'rgba(168,32,32,0.2)', color: 'var(--color-seal)' }}
    >
      {label}
      <button onClick={onRemove} className="hover:opacity-70">
        <X size={10} />
      </button>
    </span>
  )
}
