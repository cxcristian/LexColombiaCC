'use client'

import { useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Plus, Check, Trash2, Pencil, Clock } from 'lucide-react'
import { ReminderModal } from './ReminderModal'
import { createReminder, updateReminder, deleteReminder, toggleCompleted } from '@/lib/reminders'
import type { Reminder, ReminderInsert } from '@/types/database'
import { cn } from '@/lib/utils'

const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

const COLOR_DOT: Record<string, string> = {
  blue: '#2563eb', red: '#dc2626', green: '#16a34a',
  amber: '#d97706', purple: '#7c3aed', navy: '#1e3a6e',
}
const COLOR_BG: Record<string, string> = {
  blue: '#dbeafe', red: '#fee2e2', green: '#dcfce7',
  amber: '#fef3c7', purple: '#ede9fe', navy: '#e8edf5',
}

interface Props {
  userId: string
  initialReminders: Reminder[]
}

export function CalendarioView({ userId, initialReminders }: Props) {
  const today = new Date()
  const [year, setYear]   = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth()) // 0-11
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [showModal, setShowModal]     = useState(false)
  const [editingReminder, setEditingReminder] = useState<Reminder | undefined>()
  const [newReminderDate, setNewReminderDate] = useState<string>('')

  // Navegar meses
  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  // Construir grilla del mes
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  // Completar última fila
  while (cells.length % 7 !== 0) cells.push(null)

  const toDateStr = (day: number) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  const remindersForDay = (day: number) =>
    reminders.filter(r => r.date === toDateStr(day))

  const selectedDayReminders = selectedDay
    ? reminders.filter(r => r.date === selectedDay).sort((a, b) => (a.time ?? '').localeCompare(b.time ?? ''))
    : []

  // CRUD handlers
  const handleSave = useCallback(async (data: ReminderInsert | Partial<Reminder>) => {
    if (editingReminder) {
      const updated = await updateReminder(editingReminder.id, data as Partial<Reminder>)
      setReminders(prev => prev.map(r => r.id === updated.id ? updated : r))
    } else {
      const created = await createReminder(data as ReminderInsert)
      setReminders(prev => [...prev, created])
    }
    setEditingReminder(undefined)
  }, [editingReminder])

  const handleDelete = async (id: string) => {
    await deleteReminder(id)
    setReminders(prev => prev.filter(r => r.id !== id))
  }

  const handleToggle = async (r: Reminder) => {
    await toggleCompleted(r.id, r.is_completed)
    setReminders(prev => prev.map(x => x.id === r.id ? { ...x, is_completed: !x.is_completed } : x))
  }

  const openNew = (dateStr: string) => {
    setNewReminderDate(dateStr)
    setEditingReminder(undefined)
    setShowModal(true)
  }

  const openEdit = (r: Reminder) => {
    setEditingReminder(r)
    setShowModal(true)
  }

  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* ── Calendario ── */}
      <div className="lg:col-span-2 lex-card overflow-hidden">
        {/* Header del mes */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <button onClick={prevMonth}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-600"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="text-center">
            <h2 className="font-display font-bold text-lg text-navy-900">
              {MESES[month]} {year}
            </h2>
          </div>
          <button onClick={nextMonth}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-600"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Días de la semana */}
        <div className="grid grid-cols-7 border-b border-slate-100">
          {DIAS.map(d => (
            <div key={d} className="py-2 text-center text-xs font-semibold text-slate-400 uppercase tracking-wide">
              {d}
            </div>
          ))}
        </div>

        {/* Grilla de días */}
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} className="h-24 border-b border-r border-slate-100 bg-slate-50/40" />

            const dateStr    = toDateStr(day)
            const dayReminders = remindersForDay(day)
            const isToday    = dateStr === todayStr
            const isSelected = dateStr === selectedDay
            const isWeekend  = (i % 7 === 0 || i % 7 === 6)

            return (
              <div key={dateStr}
                onClick={() => setSelectedDay(isSelected ? null : dateStr)}
                className={cn(
                  'h-24 p-1.5 border-b border-r border-slate-100 cursor-pointer transition-colors relative group',
                  isSelected  ? 'bg-navy-50'  :
                  isWeekend   ? 'bg-slate-50/60' : 'hover:bg-slate-50'
                )}
              >
                {/* Número del día */}
                <div className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold mb-1',
                  isToday ? 'bg-navy-900 text-white' : isSelected ? 'text-navy-700' : 'text-slate-600'
                )}>
                  {day}
                </div>

                {/* Puntos de recordatorios */}
                <div className="space-y-0.5">
                  {dayReminders.slice(0, 3).map(r => (
                    <div key={r.id}
                      className="text-xs px-1 py-0.5 rounded truncate leading-tight"
                      style={{
                        background: COLOR_BG[r.color] ?? '#dbeafe',
                        color: COLOR_DOT[r.color] ?? '#2563eb',
                        textDecoration: r.is_completed ? 'line-through' : 'none',
                        opacity: r.is_completed ? 0.6 : 1,
                      }}
                    >
                      {r.title}
                    </div>
                  ))}
                  {dayReminders.length > 3 && (
                    <div className="text-xs text-slate-400 px-1">+{dayReminders.length - 3} más</div>
                  )}
                </div>

                {/* Botón rápido agregar */}
                <button
                  onClick={e => { e.stopPropagation(); openNew(dateStr) }}
                  className="absolute top-1 right-1 w-5 h-5 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-navy-100 text-navy-600 hover:bg-navy-200"
                >
                  <Plus size={10} />
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Panel lateral ── */}
      <div className="space-y-4">
        {/* Botón nuevo recordatorio */}
        <button
          onClick={() => openNew(selectedDay ?? todayStr)}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-sm"
        >
          <Plus size={15} />Nuevo recordatorio
        </button>

        {/* Recordatorios del día seleccionado */}
        <div className="lex-card overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
            <h3 className="font-display font-semibold text-navy-900 text-sm">
              {selectedDay
                ? new Date(selectedDay + 'T12:00').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
                : 'Selecciona un día'
              }
            </h3>
          </div>

          {!selectedDay ? (
            <div className="text-center py-8">
              <p className="text-sm text-slate-400">Haz clic en un día para ver sus recordatorios</p>
            </div>
          ) : selectedDayReminders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-slate-400 mb-3">Sin recordatorios</p>
              <button onClick={() => openNew(selectedDay)}
                className="text-xs font-medium text-navy-700 hover:text-navy-900 flex items-center gap-1 mx-auto"
              >
                <Plus size={12} />Agregar uno
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {selectedDayReminders.map(r => (
                <div key={r.id} className="px-5 py-3 flex items-start gap-3 group hover:bg-slate-50 transition-colors">
                  {/* Color dot + complete toggle */}
                  <button onClick={() => handleToggle(r)}
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
                    style={{
                      borderColor: COLOR_DOT[r.color],
                      background: r.is_completed ? COLOR_DOT[r.color] : 'transparent',
                    }}
                  >
                    {r.is_completed && <Check size={10} className="text-white" />}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-sm font-medium text-navy-900 truncate',
                      r.is_completed && 'line-through text-slate-400'
                    )}>
                      {r.title}
                    </p>
                    {r.time && (
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock size={10} />{r.time}
                      </p>
                    )}
                    {r.description && (
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{r.description}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(r)}
                      className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-navy-700 hover:bg-navy-50 transition-colors"
                    >
                      <Pencil size={11} />
                    </button>
                    <button onClick={() => handleDelete(r.id)}
                      className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Próximos recordatorios */}
        <div className="lex-card overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
            <h3 className="font-display font-semibold text-navy-900 text-sm">Próximos</h3>
          </div>
          {reminders
            .filter(r => r.date >= todayStr && !r.is_completed)
            .slice(0, 5)
            .map(r => (
              <div key={r.id} className="flex items-center gap-3 px-5 py-2.5 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLOR_DOT[r.color] }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-navy-900 truncate">{r.title}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(r.date + 'T12:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
                    {r.time && ` · ${r.time}`}
                  </p>
                </div>
              </div>
            ))
          }
          {reminders.filter(r => r.date >= todayStr && !r.is_completed).length === 0 && (
            <div className="text-center py-6">
              <p className="text-xs text-slate-400">Sin recordatorios próximos</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <ReminderModal
          userId={userId}
          date={newReminderDate || selectedDay || todayStr}
          reminder={editingReminder}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingReminder(undefined) }}
        />
      )}
    </div>
  )
}
