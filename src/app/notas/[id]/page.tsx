'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { NoteEditor } from '@/components/notes/NoteEditor'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { supabaseClient } from '@/lib/supabase/client'
import type { Note } from '@/types/database'

export default function EditNotePage({ params }: { params: { id: string } }) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [note, setNote]   = useState<Note | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) router.push('/')
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return
    supabaseClient.from('notes').select('*')
      .eq('id', params.id).eq('user_id', user.id).single()
      .then(({ data }) => { setNote(data ?? null); setLoading(false) })
  }, [user, params.id])

  if (authLoading || loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 size={28} className="animate-spin text-navy-400" />
    </div>
  )
  if (!note) return (
    <div className="text-center py-20">
      <p className="text-slate-500 mb-4">Nota no encontrada</p>
      <Link href="/notas" className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm">Volver</Link>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <Link href="/notas" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-navy-800 mb-5 transition-colors">
          <ArrowLeft size={15} />Volver a mis notas
        </Link>
        <h1 className="font-display font-bold text-2xl text-navy-900">Editar nota</h1>
      </div>
      <NoteEditor userId={user!.id} note={note} />
    </div>
  )
}
