'use client'

import { useState, useCallback } from 'react'
import { Download, X, Loader2, Search, ExternalLink, Filter, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'
import { TIPO_SENTENCIA_OPTIONS } from '@/lib/apis/sentencias-scraper'
import type { Precedente } from '@/types'
import { CORPORACION_LABELS, TIPO_PRECEDENTE_LABELS } from '@/lib/apis/precedentes'

interface Props {
    onClose: () => void
}

interface ScrapeResult {
    data: Precedente[]
    total: number
    limit: number
    offset: number
}

export function ScrapingModal({ onClose }: Props) {
    const [tipo, setTipo] = useState('')
    const [anio, setAnio] = useState('')
    const [query, setQuery] = useState('')
    const [limit, setLimit] = useState(50)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<ScrapeResult | null>(null)
    const [error, setError] = useState('')
    const [showFilters, setShowFilters] = useState(true)

    const currentYear = new Date().getFullYear()
    const years = Array.from({ length: currentYear - 1991 }, (_, i) => String(currentYear - i))

    const handleScrape = useCallback(async () => {
        setLoading(true)
        setError('')
        setResult(null)

        try {
            const params = new URLSearchParams()
            if (tipo) params.set('tipo', tipo)
            if (anio) params.set('anio', anio)
            if (query.trim()) params.set('q', query.trim())
            params.set('limit', String(limit))
            params.set('offset', '0')

            const res = await fetch(`/api/scrape-sentencias?${params.toString()}`)
            if (!res.ok) throw new Error(`Error ${res.status}`)
            const data = await res.json()
            setResult(data)
            setShowFilters(false)
        } catch (err) {
            setError('Error al conectar con la fuente de datos. Intenta de nuevo.')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }, [tipo, anio, query, limit])

    const handleLoadMore = useCallback(async () => {
        if (!result) return
        setLoading(true)
        setError('')

        try {
            const params = new URLSearchParams()
            if (tipo) params.set('tipo', tipo)
            if (anio) params.set('anio', anio)
            if (query.trim()) params.set('q', query.trim())
            params.set('limit', String(limit))
            params.set('offset', String(result.data.length))

            const res = await fetch(`/api/scrape-sentencias?${params.toString()}`)
            if (!res.ok) throw new Error(`Error ${res.status}`)
            const data: ScrapeResult = await res.json()
            setResult(prev => prev ? {
                ...data,
                data: [...prev.data, ...data.data],
            } : data)
        } catch (err) {
            setError('Error al cargar más resultados.')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }, [result, tipo, anio, query, limit])

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full max-w-2xl max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-slide-down">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100"
                    style={{ background: 'linear-gradient(135deg, var(--navy-950), var(--navy-800))' }}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                            style={{ background: 'rgba(255,255,255,0.1)' }}
                        >
                            <Download size={18} className="text-white" />
                        </div>
                        <div>
                            <h2 className="font-display font-bold text-white text-lg">Web Scraping</h2>
                            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                                Sentencias · Corte Constitucional · datos.gov.co
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Filters toggle */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 text-sm font-medium text-navy-700 mb-4 hover:text-navy-900 transition-colors"
                    >
                        <Filter size={14} />
                        Filtros de búsqueda
                        {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {/* Filters */}
                    {showFilters && (
                        <div className="space-y-4 mb-6 p-4 rounded-xl bg-slate-50 border border-slate-100">
                            {/* Search query */}
                            <div>
                                <label className="block text-xs font-semibold text-navy-800 mb-1.5">Buscar por texto</label>
                                <div className="relative">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        value={query}
                                        onChange={e => setQuery(e.target.value)}
                                        placeholder="Magistrado, proceso, número de sentencia..."
                                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-navy-400 focus:ring-1 focus:ring-navy-200 transition-all bg-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                {/* Tipo */}
                                <div>
                                    <label className="block text-xs font-semibold text-navy-800 mb-1.5">Tipo</label>
                                    <select
                                        value={tipo}
                                        onChange={e => setTipo(e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-navy-400 focus:ring-1 focus:ring-navy-200 transition-all bg-white"
                                    >
                                        {TIPO_SENTENCIA_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Año */}
                                <div>
                                    <label className="block text-xs font-semibold text-navy-800 mb-1.5">Año</label>
                                    <select
                                        value={anio}
                                        onChange={e => setAnio(e.target.value)}
                                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-navy-400 focus:ring-1 focus:ring-navy-200 transition-all bg-white"
                                    >
                                        <option value="">Todos los años</option>
                                        {years.map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Cantidad */}
                                <div>
                                    <label className="block text-xs font-semibold text-navy-800 mb-1.5">Cantidad</label>
                                    <select
                                        value={limit}
                                        onChange={e => setLimit(Number(e.target.value))}
                                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-navy-400 focus:ring-1 focus:ring-navy-200 transition-all bg-white"
                                    >
                                        <option value={25}>25 sentencias</option>
                                        <option value={50}>50 sentencias</option>
                                        <option value={100}>100 sentencias</option>
                                        <option value={200}>200 sentencias</option>
                                    </select>
                                </div>
                            </div>

                            {/* Scrape button */}
                            <button
                                onClick={handleScrape}
                                disabled={loading}
                                className="w-full btn-primary flex items-center justify-center gap-2 py-3 text-sm disabled:opacity-60"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Consultando datos.gov.co...
                                    </>
                                ) : (
                                    <>
                                        <Download size={16} />
                                        Iniciar Scraping
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {/* Results */}
                    {result && (
                        <div>
                            {/* Stats */}
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm text-slate-500">
                                    <span className="font-semibold text-navy-900">{result.data.length}</span> de{' '}
                                    <span className="font-semibold text-navy-900">{result.total.toLocaleString()}</span>{' '}
                                    sentencias cargadas
                                </p>
                                <button
                                    onClick={handleScrape}
                                    className="flex items-center gap-1.5 text-xs font-medium text-navy-600 hover:text-navy-800 transition-colors"
                                >
                                    <RefreshCw size={12} />
                                    Recargar
                                </button>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full h-1.5 bg-slate-100 rounded-full mb-5 overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: `${Math.min(100, (result.data.length / result.total) * 100)}%`,
                                        background: 'linear-gradient(90deg, var(--navy-600), var(--navy-400))',
                                    }}
                                />
                            </div>

                            {/* Sentencias list */}
                            <div className="space-y-2">
                                {result.data.map((s, i) => (
                                    <div key={`${s.id}-${i}`}
                                        className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:border-navy-200 hover:bg-slate-50/50 transition-all group"
                                    >
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold"
                                            style={{
                                                background: s.tipo === 'SENTENCIA_T' ? 'rgba(30,58,110,0.1)' :
                                                    s.tipo === 'SENTENCIA_C' ? 'rgba(168,32,32,0.1)' :
                                                        s.tipo === 'SENTENCIA_SU' ? 'rgba(217,119,6,0.1)' : 'rgba(100,116,139,0.1)',
                                                color: s.tipo === 'SENTENCIA_T' ? 'var(--navy-700)' :
                                                    s.tipo === 'SENTENCIA_C' ? '#a82020' :
                                                        s.tipo === 'SENTENCIA_SU' ? '#d97706' : '#64748b',
                                            }}
                                        >
                                            {s.numero.split('-')[0] || 'S'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="text-sm font-semibold text-navy-900 truncate">{s.numero}</p>
                                                <span className="text-xs text-slate-400 flex-shrink-0">{s.fecha}</span>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-0.5 truncate">
                                                {s.magistradoPonente || 'Magistrado no especificado'}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <span className="badge badge-navy text-[10px]">
                                                    {TIPO_PRECEDENTE_LABELS[s.tipo] ?? s.tipo}
                                                </span>
                                                {s.tematico && (
                                                    <span className="text-[10px] text-slate-400 truncate">{s.tematico}</span>
                                                )}
                                            </div>
                                        </div>
                                        {s.linkOficial && (
                                            <a href={s.linkOficial} target="_blank" rel="noopener noreferrer"
                                                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-navy-600 hover:bg-navy-50 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
                                            >
                                                <ExternalLink size={13} />
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Load more */}
                            {result.data.length < result.total && (
                                <button
                                    onClick={handleLoadMore}
                                    disabled={loading}
                                    className="w-full mt-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-navy-700 hover:bg-navy-50 hover:border-navy-200 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 size={14} className="animate-spin" />
                                            Cargando más...
                                        </>
                                    ) : (
                                        <>
                                            Cargar más sentencias ({result.total - result.data.length} restantes)
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Empty state */}
                    {!result && !loading && !error && (
                        <div className="text-center py-8">
                            <Download size={36} className="mx-auto mb-3 text-slate-300" />
                            <p className="text-sm font-medium text-navy-900 mb-1">Listo para buscar</p>
                            <p className="text-xs text-slate-500">
                                Configura los filtros y haz clic en "Iniciar Scraping" para consultar sentencias de la Corte Constitucional.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50">
                    <p className="text-[10px] text-slate-400 text-center">
                        Fuente: datos.gov.co · Sentencias proferidas por la Corte Constitucional · ~29.210 registros desde 1992
                    </p>
                </div>
            </div>
        </div>
    )
}
