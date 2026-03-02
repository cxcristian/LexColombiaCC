'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Calendar } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { CalendarioView } from '@/components/calendario/CalendarioView'
import { getReminders } from '@/lib/reminders'
import type { Reminder } from '@/types/database'

export default function CalendarioPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    if (!authLoading && !user) router.push('/')
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return
    getReminders(user.id)
      .then(setReminders)
      .finally(() => setLoading(false))
  }, [user])

  if (authLoading || loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 size={28} className="animate-spin text-navy-400" />
    </div>
  )
  if (!user) return null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-navy-50 border border-navy-100">
            <Calendar size={17} className="text-navy-700" />
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-navy-900">
            Mi calendario
          </h1>
        </div>
        <p className="text-sm text-slate-500 ml-12">
          Gestiona tus recordatorios y fechas importantes
        </p>
      </div>

      <CalendarioView userId={user.id} initialReminders={reminders} />
    </div>
  )
}
