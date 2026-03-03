'use client'

import { useState } from 'react'
import { Download, Loader2, FileText, CheckCircle } from 'lucide-react'
import type { Case, CaseEvent } from '@/types/cases'
import type { Note } from '@/types/database'
import {
  TIPO_PROCESO_LABELS, ESTADO_CASO_LABELS,
  TIPO_EVENTO_LABELS,
} from '@/types/cases'

interface Props {
  caso: Case
  events: CaseEvent[]
  notes: Note[]
}

export function ExportExpediente({ caso, events, notes }: Props) {
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)

  const handleExport = () => {
    setLoading(true)

    const fecha = new Date().toLocaleDateString('es-CO', {
      day: '2-digit', month: 'long', year: 'numeric'
    })

    const eventsHtml = events.length === 0
      ? '<p style="color:#94a3b8;font-size:13px">Sin actuaciones registradas</p>'
      : events.map(e => `
        <div style="border:1px solid #e2e8f0;border-radius:8px;padding:12px;margin-bottom:8px;">
          <div style="display:flex;gap:8px;align-items:center;margin-bottom:4px">
            <span style="font-weight:700;font-size:13px;color:#0f172a">${e.titulo}</span>
            <span style="font-size:11px;color:#64748b;background:#f1f5f9;padding:2px 8px;border-radius:20px">${TIPO_EVENTO_LABELS[e.tipo]}</span>
            ${e.completado ? '<span style="font-size:11px;color:#16a34a;background:#dcfce7;padding:2px 8px;border-radius:20px">✓ Completado</span>' : ''}
          </div>
          <p style="margin:0;font-size:12px;color:#64748b">
            Fecha: ${new Date(e.fecha_evento + 'T12:00').toLocaleDateString('es-CO')}
            ${e.fecha_limite ? ` · Límite: ${new Date(e.fecha_limite + 'T12:00').toLocaleDateString('es-CO')}` : ''}
            ${e.dias_habiles ? ` · ${e.dias_habiles} días hábiles` : ''}
          </p>
          ${e.descripcion ? `<p style="margin:4px 0 0;font-size:12px;color:#475569">${e.descripcion}</p>` : ''}
        </div>
      `).join('')

    const notesHtml = notes.length === 0
      ? '<p style="color:#94a3b8;font-size:13px">Sin notas vinculadas</p>'
      : notes.map(n => `
        <div style="border:1px solid #e2e8f0;border-radius:8px;padding:12px;margin-bottom:8px;">
          <p style="font-weight:700;font-size:13px;color:#0f172a;margin:0 0 4px">${n.title}</p>
          <p style="font-size:12px;color:#64748b;margin:0">${n.content?.slice(0, 200) ?? ''}${(n.content?.length ?? 0) > 200 ? '...' : ''}</p>
          <p style="font-size:11px;color:#94a3b8;margin:4px 0 0">${new Date(n.updated_at).toLocaleDateString('es-CO')}</p>
        </div>
      `).join('')

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Expediente - ${caso.titulo}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', sans-serif; color: #0f172a; padding: 40px; max-width: 800px; margin: 0 auto; }
    h1 { font-size: 24px; font-weight: 800; margin-bottom: 4px; }
    h2 { font-size: 15px; font-weight: 700; color: #1e3a6e; margin: 24px 0 12px; padding-bottom: 6px; border-bottom: 2px solid #e8edf5; }
    .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .meta-item { background: #f8fafc; border-radius: 8px; padding: 10px 14px; }
    .meta-label { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px; }
    .meta-value { font-size: 13px; font-weight: 600; color: #0f172a; }
    .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;padding-bottom:16px;border-bottom:3px solid #1e3a6e">
    <div style="width:40px;height:40px;background:#1e3a6e;border-radius:10px;display:flex;align-items:center;justify-content:center">
      <span style="color:white;font-weight:900;font-size:16px">B</span>
    </div>
    <div>
      <div style="font-size:11px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.05em">BiblioLex · Expediente Digital</div>
      <h1>${caso.titulo}</h1>
    </div>
  </div>

  <h2>Información general</h2>
  <div class="meta">
    ${caso.referencia ? `<div class="meta-item"><div class="meta-label">Radicado</div><div class="meta-value">${caso.referencia}</div></div>` : ''}
    <div class="meta-item"><div class="meta-label">Tipo de proceso</div><div class="meta-value">${TIPO_PROCESO_LABELS[caso.tipo_proceso]}</div></div>
    <div class="meta-item"><div class="meta-label">Estado</div><div class="meta-value">${ESTADO_CASO_LABELS[caso.estado]}</div></div>
    <div class="meta-item"><div class="meta-label">Cliente</div><div class="meta-value">${caso.cliente_nombre}</div></div>
    ${caso.cliente_contacto ? `<div class="meta-item"><div class="meta-label">Contacto</div><div class="meta-value">${caso.cliente_contacto}</div></div>` : ''}
    ${caso.juzgado ? `<div class="meta-item"><div class="meta-label">Juzgado</div><div class="meta-value">${caso.juzgado}</div></div>` : ''}
    ${caso.ciudad ? `<div class="meta-item"><div class="meta-label">Ciudad</div><div class="meta-value">${caso.ciudad}</div></div>` : ''}
    <div class="meta-item"><div class="meta-label">Fecha inicio</div><div class="meta-value">${new Date(caso.fecha_inicio + 'T12:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}</div></div>
    ${caso.fecha_cierre ? `<div class="meta-item"><div class="meta-label">Fecha cierre</div><div class="meta-value">${new Date(caso.fecha_cierre + 'T12:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}</div></div>` : ''}
  </div>

  ${caso.descripcion ? `<div style="margin-top:12px;padding:12px;background:#f8fafc;border-radius:8px;font-size:13px;color:#475569">${caso.descripcion}</div>` : ''}
  ${caso.notas_generales ? `<div style="margin-top:8px;padding:12px;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;font-size:13px;color:#92400e"><strong>Notas generales:</strong> ${caso.notas_generales}</div>` : ''}

  <h2>Actuaciones y términos procesales (${events.length})</h2>
  ${eventsHtml}

  <h2>Notas del caso (${notes.length})</h2>
  ${notesHtml}

  <div class="footer">
    Exportado el ${fecha} · BiblioLex — Biblioteca Jurídica Digital Colombia
  </div>
</body>
</html>`

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `expediente-${caso.titulo.replace(/\s+/g, '-').toLowerCase()}.html`
    a.click()
    URL.revokeObjectURL(url)

    setLoading(false)
    setDone(true)
    setTimeout(() => setDone(false), 3000)
  }

  return (
    <div className="lex-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-navy-50 border border-navy-100 flex items-center justify-center">
          <FileText size={17} className="text-navy-700" />
        </div>
        <div>
          <h3 className="font-display font-bold text-navy-900 text-base">Exportar expediente</h3>
          <p className="text-xs text-slate-500">Descarga el expediente completo como HTML imprimible</p>
        </div>
      </div>

      <div className="space-y-2 mb-5">
        {[
          `Información del caso y cliente`,
          `${events.length} actuaciones y términos procesales`,
          `${notes.length} notas vinculadas`,
          'Listo para imprimir o guardar como PDF',
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
            <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
            {item}
          </div>
        ))}
      </div>

      <button onClick={handleExport} disabled={loading}
        className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-sm disabled:opacity-60"
      >
        {loading
          ? <><Loader2 size={15} className="animate-spin" />Generando...</>
          : done
          ? <><CheckCircle size={15} />¡Descargado!</>
          : <><Download size={15} />Descargar expediente</>
        }
      </button>
    </div>
  )
}
