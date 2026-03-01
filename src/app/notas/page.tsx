'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, FileText, Search, X, Loader2, SlidersHorizontal } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { getNotes } from '@/lib/notes'
import { NoteCard } from '@/components/notes/NoteCard'
import { LawCardSkeleton } from '@/components/ui'
import type { Note, NoteColor } from '@/types/database'
import { cn } from '@/lib/utils'

const COLORS: Array<{ value: NoteColor | ''; label: string }> = [
  { value: '', label: 'Todos' },
  { value: 'default', label: 'Predeterminado' },
  { value: 'amber', label: 'Ámbar' },
  { value: 'red', label: 'Rojo' },
  { value: 'blue', label: 'Azul' },
  { value: 'green', label: 'Verde' },
  { value: 'purple', label: 'Morado' },
]

export default function NotasPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [notes, setNotes]             = useState<Note[]>([])
  const [loading, setLoading]         = useState(true)
  const [query, setQuery]             = useState('')
  const [colorFilter, setColorFilter] = useState<NoteColor | ''>('')
  const [showPinned, setShowPinned]   = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) router.push('/')
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return
    getNotes(user.id).then(setNotes).finally(() => setLoading(false))
  }, [user])

  const handleDeleted = (id: string) => setNotes(p => p.filter(n => n.id !== id))
  const handlePinToggled = (id: string, pinned: boolean) => {
    setNotes(prev => {
      const u = prev.map(n => n.id === id ? { ...n, is_pinned: pinned } : n)
      return [...u.filter(n => n.is_pinned), ...u.filter(n => !n.is_pinned)]
    })
  }

  const filtered = notes.filter(n => {
    if (showPinned && !n.is_pinned) return false
    if (colorFilter && n.color !== colorFilter) return false
    if (query.trim()) {
      const q = query.toLowerCase()
      return n.title.toLowerCase().includes(q) || n.content?.toLowerCase().includes(q) ||
             n.tags?.some(t => t.includes(q)) || n.related_law_title?.toLowerCase().includes(q)
    }
    return true
  })

  if (authLoading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 size={28} className="animate-spin text-navy-400" />
    </div>
  )
  if (!user) return null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-navy-900">Mis notas</h1>
          <p className="text-sm text-slate-500 mt-1">
            {notes.length === 0 ? 'Sin notas aún' : `${notes.length} nota${notes.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Link href="/notas/nueva"
          className="btn-primary flex items-center gap-2 px-4 py-2.5 text-sm"
        >
          <Plus size={15} />Nueva nota
        </Link>
      </div>

      {/* Search */}
      <div className="space-y-3 mb-6">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Buscar en tus notas..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-200 bg-white"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-slate-100">
              <X size={14} className="text-slate-400" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowFilters(!showFilters)}
            className={cn('inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-all',
              showFilters ? 'bg-navy-50 border-navy-200 text-navy-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            )}
          >
            <SlidersHorizontal size={13} />Filtros
          </button>
          <button onClick={() => setShowPinned(!showPinned)}
            className={cn('inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-all',
              showPinned ? 'bg-navy-50 border-navy-200 text-navy-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            )}
          >
            Solo ancladas
          </button>
          {(query || colorFilter || showPinned) && (
            <button onClick={() => { setQuery(''); setColorFilter(''); setShowPinned(false) }}
              className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1"
            >
              <X size={11} />Limpiar
            </button>
          )}
        </div>
        {showFilters && (
          <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50">
            {COLORS.map(c => (
              <button key={c.value} onClick={() => setColorFilter(c.value)}
                className={cn('px-3 py-1 rounded-lg text-xs border transition-all',
                  colorFilter === c.value ? 'bg-navy-900 text-white border-navy-900' : 'border-slate-200 text-slate-600 hover:bg-white'
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <LawCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-slate-200 bg-white">
          <FileText size={36} className="mx-auto mb-4 text-slate-300" />
          <h3 className="font-display font-semibold text-lg text-navy-900 mb-2">
            {notes.length === 0 ? 'Aún no tienes notas' : 'Sin resultados'}
          </h3>
          <p className="text-sm text-slate-500 mb-5">
            {notes.length === 0 ? 'Crea tu primera nota para organizar tu investigación' : 'Prueba con otros términos'}
          </p>
          {notes.length === 0 && (
            <Link href="/notas/nueva" className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm">
              <Plus size={14} />Crear primera nota
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((note, i) => (
            <NoteCard key={note.id} note={note} index={i} onDeleted={handleDeleted} onPinToggled={handlePinToggled} />
          ))}
        </div>
      )}
    </div>
  )
}
