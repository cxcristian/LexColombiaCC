'use client'

import { useState } from 'react'
import { X, Loader2, Calendar, Clock, FileText, Palette } from 'lucide-react'
import type { Reminder, ReminderColor, ReminderInsert } from '@/types/database'
import { cn } from '@/lib/utils'

interface Props {
  userId: string
  date?: string        // fecha pre-seleccionada 'YYYY-MM-DD'
  reminder?: Reminder  // si viene, es edición
  onSave: (data: ReminderInsert | Partial<Reminder>) => Promise<void>
  onClose: () => void
}

const COLORS: Array<{ value: ReminderColor; label: string; bg: string; border: string; dot: string }> = [
  { value: 'blue',   label: 'Azul',    bg: '#dbeafe', border: '#93c5fd', dot: '#2563eb' },
  { value: 'red',    label: 'Rojo',    bg: '#fee2e2', border: '#fca5a5', dot: '#dc2626' },
  { value: 'green',  label: 'Verde',   bg: '#dcfce7', border: '#86efac', dot: '#16a34a' },
  { value: 'amber',  label: 'Ámbar',   bg: '#fef3c7', border: '#fcd34d', dot: '#d97706' },
  { value: 'purple', label: 'Morado',  bg: '#ede9fe', border: '#c4b5fd', dot: '#7c3aed' },
  { value: 'navy',   label: 'Marino',  bg: '#e8edf5', border: '#8ba4c8', dot: '#1e3a6e' },
]

export function ReminderModal({ userId, date, reminder, onSave, onClose }: Props) {
  const [title, setTitle]           = useState(reminder?.title ?? '')
  const [description, setDescription] = useState(reminder?.description ?? '')
  const [selectedDate, setSelectedDate] = useState(reminder?.date ?? date ?? new Date().toISOString().split('T')[0])
  const [time, setTime]             = useState(reminder?.time ?? '')
  const [color, setColor]           = useState<ReminderColor>(reminder?.color ?? 'blue')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')

  const handleSave = async () => {
    if (!title.trim()) { setError('El título es obligatorio'); return }
    if (!selectedDate)  { setError('La fecha es obligatoria'); return }
    setLoading(true); setError('')
    try {
      await onSave({
        user_id:     userId,
        title:       title.trim(),
        description: description.trim() || null,
        date:        selectedDate,
        time:        time || null,
        color,
      })
      onClose()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al guardar')
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(10,15,30,0.6)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100"
          style={{ background: 'var(--navy-50)' }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--navy-900)' }}
            >
              <Calendar size={14} className="text-white" />
            </div>
            <h2 className="font-display font-bold text-navy-900 text-base">
              {reminder ? 'Editar recordatorio' : 'Nuevo recordatorio'}
            </h2>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
              Título *
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ej: Audiencia en juzgado"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-200"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
              <FileText size={11} className="inline mr-1" />Descripción
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Detalles del recordatorio..."
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-200 resize-none"
            />
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
                <Calendar size={11} className="inline mr-1" />Fecha *
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-200"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
                <Clock size={11} className="inline mr-1" />Hora
              </label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-200"
              />
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">
              <Palette size={11} className="inline mr-1" />Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button key={c.value} onClick={() => setColor(c.value)}
                  title={c.label}
                  className={cn(
                    'w-7 h-7 rounded-full border-2 transition-all hover:scale-110',
                    color === c.value ? 'scale-110 ring-2 ring-offset-2 ring-slate-400' : ''
                  )}
                  style={{ background: c.dot, borderColor: color === c.value ? c.dot : 'transparent' }}
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl text-sm text-red-700 bg-red-50 border border-red-100">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </button>
          <button onClick={handleSave} disabled={loading}
            className="flex-1 btn-primary flex items-center justify-center gap-2 py-2.5 text-sm disabled:opacity-60"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {reminder ? 'Guardar cambios' : 'Crear recordatorio'}
          </button>
        </div>
      </div>
    </div>
  )
}
