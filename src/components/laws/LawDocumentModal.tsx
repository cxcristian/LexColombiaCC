'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, ExternalLink, FileText, Loader2, Download, Hash, Calendar, Building2, Tag } from 'lucide-react'
import type { Norma } from '@/types'

interface Props {
    norma: Norma
    onClose: () => void
}

export function LawDocumentModal({ norma, onClose }: Props) {
    const [pdfUrl, setPdfUrl] = useState<string | null>(null)
    const [proxyUrl, setProxyUrl] = useState<string | null>(null)
    const [docInfo, setDocInfo] = useState<{ titulo?: string; descripcion?: string } | null>(null)
    const [loading, setLoading] = useState(true)
    const [iframeLoaded, setIframeLoaded] = useState(false)
    const [iframeError, setIframeError] = useState(false)

    useEffect(() => {
        async function fetchPdfUrl() {
            try {
                const params = new URLSearchParams({
                    tipo: norma.tipo,
                    numero: norma.numero,
                    anio: norma.anio,
                })
                const res = await fetch(`/api/norma-pdf?${params}`)
                const data = await res.json()
                if (data?.url) {
                    setPdfUrl(data.url)
                    setDocInfo({ titulo: data.titulo, descripcion: data.descripcion })
                    // Use our proxy to bypass X-Frame-Options
                    setProxyUrl(`/api/pdf-proxy?url=${encodeURIComponent(data.url)}`)
                }
            } catch {
                // No PDF found
            } finally {
                setLoading(false)
            }
        }
        fetchPdfUrl()
    }, [norma.tipo, norma.numero, norma.anio])

    // Close on ESC key
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [onClose])

    // Prevent body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = '' }
    }, [])

    const handleBackdropClick = useCallback((e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose()
    }, [onClose])

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={handleBackdropClick}
        >
            <div
                className="relative w-full max-w-6xl rounded-2xl overflow-hidden flex flex-col shadow-2xl animate-fade-up"
                style={{
                    background: 'var(--color-bg-card, white)',
                    border: '1px solid var(--color-border, #e5e7eb)',
                    maxHeight: '94vh',
                    height: proxyUrl && !iframeError ? '94vh' : 'auto',
                }}
            >
                {/* Header */}
                <div
                    className="flex items-start justify-between gap-3 px-6 py-4 border-b flex-shrink-0"
                    style={{ borderColor: 'var(--color-border, #e5e7eb)', background: 'rgba(200,144,10,0.04)' }}
                >
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <FileText size={16} style={{ color: 'var(--color-gold, #c8900a)' }} />
                            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-ink-faint, #94a3b8)' }}>
                                {norma.tipo}
                            </span>
                        </div>
                        <h2
                            className="font-display font-bold text-lg leading-tight truncate"
                            style={{ color: 'var(--color-ink, #0f172a)' }}
                            title={docInfo?.titulo || norma.titulo}
                        >
                            {docInfo?.titulo || norma.titulo}
                        </h2>
                        {docInfo?.descripcion && (
                            <p className="text-xs mt-1 line-clamp-1" style={{ color: 'var(--color-ink-faint, #94a3b8)' }}>
                                {docInfo.descripcion}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {pdfUrl && (
                            <a
                                href={pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105"
                                style={{ background: 'var(--color-gold, #c8900a)', color: '#0f0b05' }}
                            >
                                <ExternalLink size={12} />
                                Fuente oficial
                            </a>
                        )}
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-black/10"
                            style={{ color: 'var(--color-ink-faint, #94a3b8)' }}
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-h-0 overflow-hidden">
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <Loader2 size={32} className="animate-spin" style={{ color: 'var(--color-gold, #c8900a)' }} />
                            <p className="text-sm" style={{ color: 'var(--color-ink-faint, #94a3b8)' }}>
                                Buscando documento...
                            </p>
                        </div>
                    )}

                    {/* PDF Viewer via Proxy */}
                    {!loading && proxyUrl && !iframeError && (
                        <div className="relative w-full h-full">
                            {!iframeLoaded && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                                    <Loader2 size={28} className="animate-spin" style={{ color: 'var(--color-gold, #c8900a)' }} />
                                    <p className="text-sm" style={{ color: 'var(--color-ink-faint, #94a3b8)' }}>
                                        Cargando PDF...
                                    </p>
                                </div>
                            )}
                            <iframe
                                src={proxyUrl}
                                className="w-full h-full border-0"
                                title={`Documento: ${norma.titulo}`}
                                onLoad={() => setIframeLoaded(true)}
                                onError={() => setIframeError(true)}
                            />
                        </div>
                    )}

                    {/* Fallback when iframe errors or no PDF found */}
                    {!loading && (iframeError || !proxyUrl) && (
                        <div className="px-6 py-8 overflow-y-auto">
                            <div className="max-w-2xl mx-auto">
                                <div className="text-center mb-6">
                                    <div
                                        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                                        style={{ background: 'rgba(200,144,10,0.1)' }}
                                    >
                                        {pdfUrl ? <Download size={28} style={{ color: 'var(--color-gold, #c8900a)' }} /> : <FileText size={28} style={{ color: 'var(--color-gold, #c8900a)' }} />}
                                    </div>
                                    <h3 className="font-display font-bold text-xl mb-2" style={{ color: 'var(--color-ink, #0f172a)' }}>
                                        {pdfUrl ? (docInfo?.titulo || norma.titulo) : 'Información de la Norma'}
                                    </h3>
                                    {docInfo?.descripcion && (
                                        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-ink-faint, #94a3b8)' }}>
                                            {docInfo.descripcion}
                                        </p>
                                    )}
                                    {!pdfUrl && (
                                        <p className="text-sm mt-2" style={{ color: 'var(--color-ink-faint, #94a3b8)' }}>
                                            No se encontró el documento PDF para esta norma.
                                        </p>
                                    )}
                                </div>

                                {pdfUrl && (
                                    <div className="flex justify-center mb-8">
                                        <a
                                            href={pdfUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105 shadow-lg"
                                            style={{ background: 'var(--color-gold, #c8900a)', color: '#0f0b05' }}
                                        >
                                            <ExternalLink size={16} />
                                            Ver documento PDF completo
                                        </a>
                                    </div>
                                )}

                                {/* Metadata grid */}
                                <div
                                    className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-xl"
                                    style={{ background: 'rgba(200,144,10,0.04)', border: '1px solid rgba(200,144,10,0.12)' }}
                                >
                                    <MetaItem icon={Hash} label="Número" value={norma.numero} />
                                    <MetaItem icon={Calendar} label="Año" value={norma.anio} />
                                    <MetaItem icon={Building2} label="Entidad" value={norma.entidad} />
                                    {norma.materia && <MetaItem icon={Tag} label="Materia" value={norma.materia} />}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function MetaItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string }) {
    if (!value) return null
    return (
        <div className="flex items-start gap-3">
            <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: 'rgba(200,144,10,0.1)' }}
            >
                <Icon size={14} style={{ color: 'var(--color-gold, #c8900a)' }} />
            </div>
            <div>
                <div className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'var(--color-ink-faint, #94a3b8)' }}>
                    {label}
                </div>
                <div className="text-sm font-medium" style={{ color: 'var(--color-ink, #0f172a)' }}>
                    {value}
                </div>
            </div>
        </div>
    )
}
