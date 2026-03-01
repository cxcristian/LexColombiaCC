'use client'

import Link from 'next/link'
import { FileText } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

interface Props {
  lawId?: string
  lawTitle?: string
  precedentId?: string
  precedentNum?: string
}

export function SaveNoteButton({ lawId, lawTitle, precedentId, precedentNum }: Props) {
  const { user } = useAuth()
  if (!user) return null

  const params = new URLSearchParams()
  if (lawId) params.set('ley', lawId)
  if (lawTitle) params.set('leyTitulo', lawTitle)
  if (precedentId) params.set('prec', precedentId)
  if (precedentNum) params.set('precNum', precedentNum)

  return (
    <Link
      href={`/notas/nueva?${params.toString()}`}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:scale-105"
      style={{ borderColor: 'rgba(200,144,10,0.4)', color: 'var(--color-gold)', background: 'rgba(200,144,10,0.06)' }}
    >
      <FileText size={15} />
      Crear nota sobre esto
    </Link>
  )
}
