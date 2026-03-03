'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Briefcase, Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { createCase } from '@/lib/cases'
import { TIPO_PROCESO_LABELS, type TipoProceso } from '@/types/cases'

const TIPOS: TipoProceso[] = ['civil','penal','laboral','administrativo','familia','constitucional','comercial','otro']

export default function NuevoCasoPage() {
  const { user } = useAuth()
  const router   = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const [form, setForm] = useState({
    titulo: '', referencia: '', descripcion: '',
    cliente_nombre: '', cliente_contacto: '',
    juzgado: '', ciudad: '', despacho: '',
    tipo_proceso: 'civil' as TipoProceso,
    fecha_inicio: new Date().toISOString().split('T')[0],
    notas_generales: '',
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.titulo.trim())          { setError('El título es obligatorio'); return }
    if (!form.cliente_nombre.trim())  { setError('El nombre del cliente es obligatorio'); return }
    if (!user) return

    setLoading(true); setError('')
    try {
      const caso = await createCase({
        user_id: user.id,
        titulo: form.titulo.trim(),
        referencia: form.referencia.trim() || null,
        descripcion: form.descripcion.trim() || null,
        cliente_nombre: form.cliente_nombre.trim(),
        cliente_contacto: form.cliente_contacto.trim() || null,
        juzgado: form.juzgado.trim() || null,
        ciudad: form.ciudad.trim() || null,
        despacho: form.despacho.trim() || null,
        tipo_proceso: form.tipo_proceso,
        fecha_inicio: form.fecha_inicio,
        notas_generales: form.notas_generales.trim() || null,
      })
      router.push(`/casos/${caso.id}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al crear el caso')
      setLoading(false)
    }
  }

  const field = (label: string, key: string, placeholder = '', type = 'text', required = false) => (
    <div>
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
        {label}{required && ' *'}
      </label>
      <input type={type} value={form[key as keyof typeof form] as string}
        onChange={e => set(key, e.target.value)}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-200"
      />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <Link href="/casos" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-navy-800 mb-6 transition-colors">
        <ArrowLeft size={15} />Volver a mis casos
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-9 h-9 rounded-xl bg-navy-50 border border-navy-100 flex items-center justify-center">
          <Briefcase size={17} className="text-navy-700" />
        </div>
        <h1 className="font-display font-bold text-2xl text-navy-900">Nuevo caso</h1>
      </div>

      <div className="space-y-6">
        {/* Identificación */}
        <div className="lex-card p-6 space-y-4">
          <h2 className="font-display font-bold text-navy-900 text-base border-b border-slate-100 pb-3">Identificación del caso</h2>
          {field('Título del caso', 'titulo', 'Ej: Proceso ejecutivo vs. Juan Pérez', 'text', true)}
          <div className="grid grid-cols-2 gap-3">
            {field('Número de radicado', 'referencia', 'Ej: 2024-00123')}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Tipo de proceso *</label>
              <select value={form.tipo_proceso} onChange={e => set('tipo_proceso', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-200"
              >
                {TIPOS.map(t => <option key={t} value={t}>{TIPO_PROCESO_LABELS[t]}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Descripción</label>
            <textarea value={form.descripcion} onChange={e => set('descripcion', e.target.value)}
              rows={3} placeholder="Resumen del caso..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-200 resize-none"
            />
          </div>
        </div>

        {/* Cliente */}
        <div className="lex-card p-6 space-y-4">
          <h2 className="font-display font-bold text-navy-900 text-base border-b border-slate-100 pb-3">Cliente</h2>
          <div className="grid grid-cols-2 gap-3">
            {field('Nombre completo', 'cliente_nombre', 'Nombre del cliente', 'text', true)}
            {field('Teléfono o email', 'cliente_contacto', 'Contacto')}
          </div>
        </div>

        {/* Despacho judicial */}
        <div className="lex-card p-6 space-y-4">
          <h2 className="font-display font-bold text-navy-900 text-base border-b border-slate-100 pb-3">Despacho judicial</h2>
          <div className="grid grid-cols-2 gap-3">
            {field('Juzgado', 'juzgado', 'Ej: Juzgado 4 Civil del Circuito')}
            {field('Ciudad', 'ciudad', 'Ej: Medellín')}
          </div>
          {field('Despacho / Sala', 'despacho', 'Ej: Sala Civil del Tribunal Superior')}
          {field('Fecha de inicio', 'fecha_inicio', '', 'date')}
        </div>

        {/* Notas */}
        <div className="lex-card p-6">
          <h2 className="font-display font-bold text-navy-900 text-base border-b border-slate-100 pb-3 mb-4">Notas generales</h2>
          <textarea value={form.notas_generales} onChange={e => set('notas_generales', e.target.value)}
            rows={3} placeholder="Observaciones generales del caso..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-200 resize-none"
          />
        </div>

        {error && (
          <div className="p-4 rounded-xl text-sm text-red-700 bg-red-50 border border-red-100">{error}</div>
        )}

        <div className="flex gap-3">
          <Link href="/casos" className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors text-center">
            Cancelar
          </Link>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 btn-primary flex items-center justify-center gap-2 py-3 text-sm disabled:opacity-60"
          >
            {loading && <Loader2 size={15} className="animate-spin" />}
            Crear caso
          </button>
        </div>
      </div>
    </div>
  )
}
