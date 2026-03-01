'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { NoteEditor } from '@/components/notes/NoteEditor'
import { ArrowLeft, FileText, Loader2 } from 'lucide-react'

export default function NuevaNotaPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    if (!loading && !user) router.push('/')
  }, [user, loading, router])

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 size={28} className="animate-spin text-navy-400" /></div>
  if (!user) return null

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <Link href="/notas" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-navy-800 mb-5 transition-colors">
          <ArrowLeft size={15} />Volver a mis notas
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-navy-50 border border-navy-100">
            <FileText size={17} className="text-navy-700" />
          </div>
          <h1 className="font-display font-bold text-2xl text-navy-900">Nueva nota judicial</h1>
        </div>
      </div>
      <NoteEditor
        userId={user.id}
        defaultLawId={params.get('ley') ?? undefined}
        defaultLawTitle={params.get('leyTitulo') ?? undefined}
        defaultPrecedentId={params.get('prec') ?? undefined}
        defaultPrecedentNum={params.get('precNum') ?? undefined}
      />
    </div>
  )
}
