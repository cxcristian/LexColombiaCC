'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Pin, PinOff, Trash2, Edit3, BookOpen, Gavel, Calendar, Tag } from 'lucide-react'
import type { Note } from '@/types/database'
import { togglePin, deleteNote } from '@/lib/notes'
import { cn } from '@/lib/utils'

interface Props {
  note: Note
  index?: number
  onDeleted: (id: string) => void
  onPinToggled: (id: string, pinned: boolean) => void
}

const COLOR_STYLES: Record<string, { bg: string; border: string; accent: string }> = {
  default: { bg: 'var(--color-bg-card)', border: 'var(--color-border)', accent: 'var(--color-gold)' },
  amber:   { bg: '#fffbeb', border: '#fde68a', accent: '#d97706' },
  red:     { bg: '#fff5f5', border: '#fecaca', accent: '#dc2626' },
  blue:    { bg: '#eff6ff', border: '#bfdbfe', accent: '#2563eb' },
  green:   { bg: '#f0fdf4', border: '#bbf7d0', accent: '#16a34a' },
  purple:  { bg: '#faf5ff', border: '#e9d5ff', accent: '#9333ea' },
}

export function NoteCard({ note, index = 0, onDeleted, onPinToggled }: Props) {
  const [pinning, setPinning] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const colors = COLOR_STYLES[note.color] ?? COLOR_STYLES.default

  const handlePin = async (e: React.MouseEvent) => {
    e.preventDefault()
    setPinning(true)
    try {
      await togglePin(note.id, note.is_pinned)
      onPinToggled(note.id, !note.is_pinned)
    } finally {
      setPinning(false)
    }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!confirmDelete) { setConfirmDelete(true); return }
    setDeleting(true)
    try {
      await deleteNote(note.id)
      onDeleted(note.id)
    } finally {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  const preview = note.content?.replace(/\n+/g, ' ').trim().slice(0, 120)

  return (
    <article
      className="law-card rounded-xl border group relative opacity-0 animate-fade-up flex flex-col"
      style={{
        background: colors.bg,
        borderColor: colors.border,
        animationDelay: `${index * 50}ms`,
        animationFillMode: 'forwards',
      }}
    >
      {/* Pin indicator bar */}
      {note.is_pinned && (
        <div className="h-0.5 w-full rounded-t-xl" style={{ background: colors.accent }} />
      )}

      <div className="p-5 flex flex-col flex-1">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3
            className="font-display font-semibold text-base leading-snug line-clamp-2 flex-1"
            style={{ color: 'var(--color-ink)' }}
          >
            {note.title}
          </h3>
          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handlePin}
              disabled={pinning}
              title={note.is_pinned ? 'Desanclar' : 'Anclar'}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-black/5"
              style={{ color: note.is_pinned ? colors.accent : 'var(--color-ink-faint)' }}
            >
              {note.is_pinned ? <PinOff size={14} /> : <Pin size={14} />}
            </button>
            <Link
              href={`/notas/${note.id}`}
              title="Editar"
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-black/5"
              style={{ color: 'var(--color-ink-faint)' }}
            >
              <Edit3 size={14} />
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleting}
              title={confirmDelete ? '¿Confirmar?' : 'Eliminar'}
              className={cn(
                'w-7 h-7 rounded-lg flex items-center justify-center transition-colors',
                confirmDelete ? 'bg-red-100 text-red-600' : 'hover:bg-black/5 text-[var(--color-ink-faint)]'
              )}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Content preview */}
        {preview && (
          <p className="text-xs leading-relaxed mb-3 flex-1 line-clamp-3" style={{ color: 'var(--color-ink-muted)' }}>
            {preview}{note.content.length > 120 && '…'}
          </p>
        )}

        {/* Related references */}
        {(note.related_law_title || note.related_precedent_num) && (
          <div className="space-y-1 mb-3">
            {note.related_law_title && (
              <div className="flex items-center gap-1.5 text-xs" style={{ color: colors.accent }}>
                <BookOpen size={11} />
                <span className="truncate">{note.related_law_title}</span>
              </div>
            )}
            {note.related_precedent_num && (
              <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--color-seal)' }}>
                <Gavel size={11} />
                <span>{note.related_precedent_num}</span>
              </div>
            )}
          </div>
        )}

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {note.tags.slice(0, 3).map(tag => (
              <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                style={{ background: `${colors.accent}15`, color: colors.accent, border: `1px solid ${colors.accent}30` }}
              >
                {tag}
              </span>
            ))}
            {note.tags.length > 3 && (
              <span className="text-xs" style={{ color: 'var(--color-ink-faint)' }}>+{note.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t mt-auto" style={{ borderColor: colors.border }}>
          <span className="text-xs flex items-center gap-1" style={{ color: 'var(--color-ink-faint)' }}>
            <Calendar size={11} />
            {new Date(note.updated_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
          {note.is_pinned && (
            <span className="text-xs flex items-center gap-1" style={{ color: colors.accent }}>
              <Pin size={10} />
              Anclada
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
