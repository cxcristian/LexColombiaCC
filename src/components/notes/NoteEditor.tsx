'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Save, X, Tag, Link2, Loader2, BookOpen, Gavel, Pin } from 'lucide-react'
import type { Note, NoteColor, NoteInsert, NoteUpdate } from '@/types/database'
import { createNote, updateNote } from '@/lib/notes'
import { cn } from '@/lib/utils'

interface Props {
  userId: string
  note?: Note
  defaultLawId?: string
  defaultLawTitle?: string
  defaultPrecedentId?: string
  defaultPrecedentNum?: string
}

const COLORS: Array<{ value: NoteColor; label: string; bg: string; border: string }> = [
  { value: 'default', label: 'Pergamino',  bg: '#faf7f2', border: '#ddd0b8' },
  { value: 'amber',   label: 'Ámbar',      bg: '#fffbeb', border: '#fde68a' },
  { value: 'red',     label: 'Escarlata',  bg: '#fff5f5', border: '#fecaca' },
  { value: 'blue',    label: 'Azul',       bg: '#eff6ff', border: '#bfdbfe' },
  { value: 'green',   label: 'Verde',      bg: '#f0fdf4', border: '#bbf7d0' },
  { value: 'purple',  label: 'Morado',     bg: '#faf5ff', border: '#e9d5ff' },
]

export function NoteEditor({
  userId,
  note,
  defaultLawId,
  defaultLawTitle,
  defaultPrecedentId,
  defaultPrecedentNum,
}: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const tagInputRef = useRef<HTMLInputElement>(null)

  // Form state
  const [title, setTitle]             = useState(note?.title ?? '')
  const [content, setContent]         = useState(note?.content ?? '')
  const [tags, setTags]               = useState<string[]>(note?.tags ?? [])
  const [tagInput, setTagInput]       = useState('')
  const [color, setColor]             = useState<NoteColor>(note?.color ?? 'default')
  const [isPinned, setIsPinned]       = useState(note?.is_pinned ?? false)
  const [lawId, setLawId]             = useState(note?.related_law_id ?? defaultLawId ?? '')
  const [lawTitle, setLawTitle]       = useState(note?.related_law_title ?? defaultLawTitle ?? '')
  const [precId, setPrecId]           = useState(note?.related_precedent_id ?? defaultPrecedentId ?? '')
  const [precNum, setPrecNum]         = useState(note?.related_precedent_num ?? defaultPrecedentNum ?? '')

  const selectedColor = COLORS.find(c => c.value === color) ?? COLORS[0]

  const addTag = () => {
    const t = tagInput.trim().toLowerCase()
    if (t && !tags.includes(t) && tags.length < 8) {
      setTags([...tags, t])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => setTags(tags.filter(t => t !== tag))

  const handleSave = async () => {
    if (!title.trim()) { setError('El título es obligatorio'); return }
    setSaving(true)
    setError('')
    try {
      const payload = {
        user_id: userId,
        title: title.trim(),
        content,
        tags,
        color,
        is_pinned: isPinned,
        related_law_id: lawId || null,
        related_law_title: lawTitle || null,
        related_precedent_id: precId || null,
        related_precedent_num: precNum || null,
      }

      if (note) {
        await updateNote(note.id, payload as NoteUpdate)
      } else {
        await createNote(payload as NoteInsert)
      }
      router.push('/notas')
      router.refresh()
    } catch (e) {
      setError('Error al guardar. Intenta de nuevo.')
      setSaving(false)
    }
  }

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ borderColor: selectedColor.border, background: selectedColor.bg }}
    >
      {/* Colored top */}
      <div className="h-1" style={{ background: `linear-gradient(90deg, ${selectedColor.border}, transparent)` }} />

      <div className="p-6 sm:p-8 space-y-6">

        {/* Title */}
        <div>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Título de la nota..."
            className="w-full text-2xl font-display font-bold bg-transparent border-0 border-b-2 pb-2 focus:outline-none transition-colors placeholder-opacity-30"
            style={{
              borderBottomColor: title ? selectedColor.border : '#e5e7eb',
              color: 'var(--color-ink)',
            }}
          />
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>

        {/* Content textarea */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: 'var(--color-ink-faint)' }}>
            Contenido de la nota
          </label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Escribe aquí tus apuntes, análisis, referencias..."
            rows={10}
            className="w-full rounded-xl border p-4 text-sm leading-relaxed bg-white/70 focus:outline-none focus:ring-2 resize-none transition-all"
            style={{
              borderColor: selectedColor.border,
              color: 'var(--color-ink)',
              fontFamily: 'var(--font-body)',
            }}
          />
        </div>

        {/* Two-column: color + pin */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Color selector */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider block mb-2.5" style={{ color: 'var(--color-ink-faint)' }}>
              Color de la nota
            </label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  title={c.label}
                  className={cn(
                    'w-8 h-8 rounded-full border-2 transition-all hover:scale-110',
                    color === c.value ? 'scale-110 ring-2 ring-offset-2 ring-amber-400' : ''
                  )}
                  style={{ background: c.bg, borderColor: c.border }}
                />
              ))}
            </div>
          </div>

          {/* Pin toggle */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider block mb-2.5" style={{ color: 'var(--color-ink-faint)' }}>
              Opciones
            </label>
            <button
              onClick={() => setIsPinned(!isPinned)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all',
                isPinned ? 'bg-amber-50 border-amber-300 text-amber-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              )}
            >
              <Pin size={14} />
              {isPinned ? 'Anclada al inicio' : 'Anclar nota'}
            </button>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider block mb-2.5" style={{ color: 'var(--color-ink-faint)' }}>
            Etiquetas <span className="font-normal normal-case">(máx. 8)</span>
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map(tag => (
              <span key={tag}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm border"
                style={{ background: `${selectedColor.border}40`, borderColor: selectedColor.border, color: 'var(--color-ink)' }}
              >
                <Tag size={11} />
                {tag}
                <button onClick={() => removeTag(tag)} className="hover:text-red-500 ml-0.5">
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              ref={tagInputRef}
              type="text"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag() } }}
              placeholder="Escribe una etiqueta y presiona Enter..."
              className="flex-1 px-3 py-2 rounded-lg border text-sm bg-white/70 focus:outline-none focus:ring-2 focus:ring-amber-300/50"
              style={{ borderColor: selectedColor.border }}
              disabled={tags.length >= 8}
            />
            <button onClick={addTag} disabled={!tagInput.trim() || tags.length >= 8}
              className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors hover:bg-amber-50 disabled:opacity-40"
              style={{ borderColor: selectedColor.border, color: 'var(--color-gold)' }}
            >
              + Añadir
            </button>
          </div>
        </div>

        {/* References */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider block mb-2.5" style={{ color: 'var(--color-ink-faint)' }}>
            <Link2 size={12} className="inline mr-1" />
            Vincular a ley o precedente (opcional)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              className="rounded-xl border p-3 space-y-2"
              style={{ borderColor: selectedColor.border, background: 'white/50' }}
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: 'var(--color-gold)' }}>
                <BookOpen size={12} />
                Norma vinculada
              </div>
              <input type="text" value={lawId} onChange={e => setLawId(e.target.value)}
                placeholder="ID (ej: LEY-100-1993)"
                className="w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none bg-white"
                style={{ borderColor: '#e5e7eb' }}
              />
              <input type="text" value={lawTitle} onChange={e => setLawTitle(e.target.value)}
                placeholder="Título corto de la ley..."
                className="w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none bg-white"
                style={{ borderColor: '#e5e7eb' }}
              />
            </div>
            <div
              className="rounded-xl border p-3 space-y-2"
              style={{ borderColor: selectedColor.border }}
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: 'var(--color-seal)' }}>
                <Gavel size={12} />
                Precedente vinculado
              </div>
              <input type="text" value={precId} onChange={e => setPrecId(e.target.value)}
                placeholder="ID (ej: CC-T-760-2008)"
                className="w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none bg-white"
                style={{ borderColor: '#e5e7eb' }}
              />
              <input type="text" value={precNum} onChange={e => setPrecNum(e.target.value)}
                placeholder="Número (ej: T-760/08)"
                className="w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none bg-white"
                style={{ borderColor: '#e5e7eb' }}
              />
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: selectedColor.border }}>
          <button onClick={() => router.back()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-medium transition-all hover:bg-black/5"
            style={{ borderColor: selectedColor.border, color: 'var(--color-ink-muted)' }}
          >
            <X size={15} />
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving || !title.trim()}
            className="flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            style={{ background: 'var(--color-gold)', color: '#0f0b05' }}
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? 'Guardando…' : (note ? 'Guardar cambios' : 'Crear nota')}
          </button>
        </div>
      </div>
    </div>
  )
}
