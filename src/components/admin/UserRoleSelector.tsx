'use client'

import { useState, useTransition } from 'react'
import { Shield, User, UserX, ChevronDown, Loader2, Check } from 'lucide-react'
import { changeUserRole } from '@/app/admin/actions'
import type { UserRole } from '@/types/database'
import { cn } from '@/lib/utils'

interface Props {
  userId: string
  currentRole: UserRole
  isSelf: boolean
}

const ROLES: Array<{ value: UserRole; label: string; icon: React.ElementType; color: string; bg: string; border: string }> = [
  { value: 'user',    label: 'Usuario',    icon: User,   color: 'var(--color-ink-muted)', bg: 'white',               border: 'var(--color-border)' },
  { value: 'admin',   label: 'Admin',      icon: Shield, color: '#c8900a',                bg: 'rgba(200,144,10,0.06)', border: 'rgba(200,144,10,0.3)' },
  { value: 'blocked', label: 'Bloqueado',  icon: UserX,  color: '#a82020',                bg: 'rgba(168,32,32,0.06)', border: 'rgba(168,32,32,0.3)' },
]

export function UserRoleSelector({ userId, currentRole, isSelf }: Props) {
  const [open, setOpen] = useState(false)
  const [role, setRole] = useState<UserRole>(currentRole)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const current = ROLES.find(r => r.value === role) ?? ROLES[0]

  const handleChange = (newRole: UserRole) => {
    if (newRole === role) { setOpen(false); return }
    setOpen(false)
    setError('')
    startTransition(async () => {
      try {
        await changeUserRole(userId, newRole)
        setRole(newRole)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      } catch (e: any) {
        setError(e.message ?? 'Error al cambiar rol')
      }
    })
  }

  if (isSelf) {
    return (
      <span className="text-xs px-3 py-1.5 rounded-full border font-medium flex items-center gap-1.5"
        style={{ background: 'rgba(200,144,10,0.08)', borderColor: 'rgba(200,144,10,0.25)', color: '#c8900a' }}
      >
        <Shield size={11} />
        Admin (tú)
      </span>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={isPending}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all hover:shadow-sm disabled:opacity-60"
        style={{ background: current.bg, borderColor: current.border, color: current.color }}
      >
        {isPending ? (
          <Loader2 size={11} className="animate-spin" />
        ) : saved ? (
          <Check size={11} />
        ) : (
          <current.icon size={11} />
        )}
        {current.label}
        <ChevronDown size={11} className={cn('transition-transform', open && 'rotate-180')} />
      </button>

      {error && (
        <p className="absolute top-full left-0 mt-1 text-xs text-red-500 whitespace-nowrap">{error}</p>
      )}

      {open && (
        <div
          className="absolute right-0 top-full mt-1.5 w-40 rounded-xl border overflow-hidden shadow-xl z-30 animate-fade-in"
          style={{ background: 'white', borderColor: 'var(--color-border)' }}
        >
          {ROLES.map(r => (
            <button
              key={r.value}
              onClick={() => handleChange(r.value)}
              className={cn(
                'w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-black/5',
                role === r.value && 'font-semibold'
              )}
              style={{ color: r.color }}
            >
              <r.icon size={13} />
              {r.label}
              {role === r.value && <Check size={11} className="ml-auto" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
