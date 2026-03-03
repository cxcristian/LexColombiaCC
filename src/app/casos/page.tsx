'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Search, X, Briefcase, Loader2, Filter } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { getCases } from '@/lib/cases'
import { CaseCard } from '@/components/casos/CaseCard'
import type { Case, EstadoCaso, TipoProceso } from '@/types/cases'
import { TIPO_PROCESO_LABELS, ESTADO_CASO_LABELS } from '@/types/cases'
import { cn } from '@/lib/utils'

export default function CasosPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [cases, setCases]   = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery]   = useState('')
  const [estado, setEstado] = useState<EstadoCaso | ''>('')
  const [tipo, setTipo]     = useState<TipoProceso | ''>('')

  useEffect(() => {
    if (!authLoading && !user) router.push('/')
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return
    getCases(user.id).then(setCases).finally(() => setLoading(false))
  }, [user])

  if (authLoading || loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 size={28} className="animate-spin text-navy-400" />
    </div>
  )
  if (!user) return null

  const filtered = cases.filter(c => {
    if (estado && c.estado !== estado) return false
    if (tipo && c.tipo_proceso !== tipo) return false
    if (query.trim()) {
      const q = query.toLowerCase()
      return (
        c.titulo.toLowerCase().includes(q) ||
        c.cliente_nombre.toLowerCase().includes(q) ||
        c.referencia?.toLowerCase().includes(q) ||
        c.juzgado?.toLowerCase().includes(q)
      )
    }
    return true
  })

  const counts = {
    activos:     cases.filter(c => c.estado === 'activo').length,
    suspendidos: cases.filter(c => c.estado === 'suspendido').length,
    cerrados:    cases.filter(c => c.estado === 'cerrado').length,
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-navy-50 border border-navy-100">
              <Briefcase size={17} className="text-navy-700" />
            </div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-navy-900">Mis casos</h1>
          </div>
          <p className="text-sm text-slate-500 ml-12">{cases.length} caso{cases.length !== 1 ? 's' : ''} registrado{cases.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/casos/nuevo" className="btn-primary flex items-center gap-2 px-4 py-2.5 text-sm">
          <Plus size={15} />Nuevo caso
        </Link>
      </div>

      {/* Stats rápidas */}
      {cases.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Activos',     value: counts.activos,     color: '#16a34a', bg: '#dcfce7', filter: 'activo' as EstadoCaso },
            { label: 'Suspendidos', value: counts.suspendidos, color: '#d97706', bg: '#fef3c7', filter: 'suspendido' as EstadoCaso },
            { label: 'Cerrados',    value: counts.cerrados,    color: '#475569', bg: '#f1f5f9', filter: 'cerrado' as EstadoCaso },
          ].map(s => (
            <button key={s.label} onClick={() => setEstado(estado === s.filter ? '' : s.filter)}
              className={cn('lex-card p-4 text-center transition-all', estado === s.filter && 'ring-2 ring-navy-400')}
            >
              <div className="font-display font-black text-2xl mb-0.5" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </button>
          ))}
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por título, cliente, radicado..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-200 bg-white"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-slate-100">
              <X size={13} className="text-slate-400" />
            </button>
          )}
        </div>
        <select value={tipo} onChange={e => setTipo(e.target.value as TipoProceso | '')}
          className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-200 bg-white text-slate-600"
        >
          <option value="">Todos los tipos</option>
          {(Object.entries(TIPO_PROCESO_LABELS) as [TipoProceso, string][]).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <Briefcase size={40} className="mx-auto mb-4 text-slate-200" />
          <p className="font-display font-semibold text-navy-900 text-lg mb-2">
            {cases.length === 0 ? 'Aún no tienes casos registrados' : 'Sin resultados'}
          </p>
          <p className="text-sm text-slate-500 mb-6">
            {cases.length === 0
              ? 'Crea tu primer expediente digital'
              : 'Intenta con otros filtros de búsqueda'
            }
          </p>
          {cases.length === 0 && (
            <Link href="/casos/nuevo" className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm">
              <Plus size={15} />Crear primer caso
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c, i) => <CaseCard key={c.id} caso={c} index={i} />)}
        </div>
      )}
    </div>
  )
}
