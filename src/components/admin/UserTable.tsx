'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { Search, X, Users, FileText, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { UserRoleSelector } from './UserRoleSelector'
import type { UserWithStats } from '@/lib/admin'
import type { UserRole } from '@/types/database'
import { cn } from '@/lib/utils'

interface Props {
  users: UserWithStats[]
  currentUserId: string
}

type SortKey = 'full_name' | 'created_at' | 'notes_count' | 'role'
type SortDir = 'asc' | 'desc'

const ROLE_FILTERS: Array<{ value: UserRole | ''; label: string }> = [
  { value: '', label: 'Todos' },
  { value: 'user', label: 'Usuarios' },
  { value: 'admin', label: 'Admins' },
  { value: 'blocked', label: 'Bloqueados' },
]

const ROLE_ORDER: Record<UserRole, number> = { admin: 0, user: 1, blocked: 2 }

export function UserTable({ users, currentUserId }: Props) {
  const [query, setQuery]         = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('')
  const [sortKey, setSortKey]     = useState<SortKey>('created_at')
  const [sortDir, setSortDir]     = useState<SortDir>('desc')

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const filtered = useMemo(() => {
    let result = [...users]

    if (query.trim()) {
      const q = query.toLowerCase()
      result = result.filter(u =>
        u.full_name?.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      )
    }

    if (roleFilter) {
      result = result.filter(u => u.role === roleFilter)
    }

    result.sort((a, b) => {
      let va: string | number = '', vb: string | number = ''
      if (sortKey === 'full_name')    { va = (a.full_name ?? a.email).toLowerCase(); vb = (b.full_name ?? b.email).toLowerCase() }
      if (sortKey === 'created_at')   { va = a.created_at; vb = b.created_at }
      if (sortKey === 'notes_count')  { va = a.notes_count; vb = b.notes_count }
      if (sortKey === 'role')         { va = ROLE_ORDER[a.role]; vb = ROLE_ORDER[b.role] }
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [users, query, roleFilter, sortKey, sortDir])

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--color-ink-faint)' }}
          />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por nombre o email..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-amber-300/50 bg-white"
            style={{ borderColor: 'var(--color-border)' }}
          />
          {query && (
            <button onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-black/5"
            >
              <X size={13} style={{ color: 'var(--color-ink-faint)' }} />
            </button>
          )}
        </div>

        {/* Role filter tabs */}
        <div className="flex gap-1 p-1 rounded-xl border" style={{ borderColor: 'var(--color-border)', background: 'white' }}>
          {ROLE_FILTERS.map(f => (
            <button key={f.value}
              onClick={() => setRoleFilter(f.value)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                roleFilter === f.value
                  ? 'text-amber-900 shadow-sm'
                  : 'hover:bg-black/5'
              )}
              style={roleFilter === f.value
                ? { background: 'rgba(200,144,10,0.12)', color: '#c8900a' }
                : { color: 'var(--color-ink-muted)' }
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <p className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>
        <span className="font-semibold" style={{ color: 'var(--color-ink)' }}>{filtered.length}</span>
        {' '}usuario{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* Table */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
      >
        {/* Table header */}
        <div
          className="hidden sm:grid grid-cols-[1fr_auto_auto_auto] gap-4 px-6 py-3 text-xs font-semibold uppercase tracking-wider border-b"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-ink-faint)', background: 'rgba(0,0,0,0.02)' }}
        >
          <SortHeader label="Usuario" k="full_name" current={sortKey} dir={sortDir} onClick={handleSort} />
          <SortHeader label="Notas" k="notes_count" current={sortKey} dir={sortDir} onClick={handleSort} />
          <SortHeader label="Registro" k="created_at" current={sortKey} dir={sortDir} onClick={handleSort} />
          <SortHeader label="Rol" k="role" current={sortKey} dir={sortDir} onClick={handleSort} />
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Users size={36} className="mx-auto mb-3" style={{ color: 'var(--color-ink-faint)' }} />
            <p className="font-display font-semibold mb-1">Sin usuarios</p>
            <p className="text-sm" style={{ color: 'var(--color-ink-muted)' }}>Prueba con otros filtros</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
            {filtered.map((user, i) => (
              <UserRow
                key={user.id}
                user={user}
                isSelf={user.id === currentUserId}
                index={i}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Row ───────────────────────────────────────────────────────────────────────
function UserRow({ user, isSelf, index }: { user: UserWithStats; isSelf: boolean; index: number }) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto] gap-3 sm:gap-4 px-6 py-4 items-center hover:bg-black/[0.015] transition-colors opacity-0 animate-fade-up"
      style={{ animationDelay: `${index * 40}ms`, animationFillMode: 'forwards' }}
    >
      {/* User info */}
      <div className="flex items-center gap-3 min-w-0">
        {user.avatar_url ? (
          <Image src={user.avatar_url} alt={user.full_name ?? ''} width={40} height={40}
            className="rounded-full flex-shrink-0 ring-2 ring-white shadow-sm"
          />
        ) : (
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ring-2 ring-white shadow-sm"
            style={{ background: 'rgba(200,144,10,0.12)', color: 'var(--color-gold)' }}
          >
            {(user.full_name ?? user.email ?? 'U')[0].toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-ink)' }}>
              {user.full_name ?? 'Sin nombre'}
            </p>
            {isSelf && (
              <span className="text-xs px-1.5 py-0.5 rounded"
                style={{ background: 'rgba(200,144,10,0.1)', color: 'var(--color-gold)' }}
              >tú</span>
            )}
          </div>
          <p className="text-xs truncate" style={{ color: 'var(--color-ink-faint)' }}>{user.email}</p>
          <p className="text-xs sm:hidden mt-0.5" style={{ color: 'var(--color-ink-faint)' }}>
            {new Date(user.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Notes count */}
      <div className="hidden sm:flex items-center gap-1.5 text-sm justify-center"
        style={{ color: 'var(--color-ink-muted)' }}
      >
        <FileText size={13} />
        <span className="font-semibold" style={{ color: 'var(--color-ink)' }}>{user.notes_count}</span>
      </div>

      {/* Join date */}
      <div className="hidden sm:block text-xs text-center" style={{ color: 'var(--color-ink-faint)' }}>
        {new Date(user.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
      </div>

      {/* Role selector */}
      <div className="flex justify-start sm:justify-center">
        <UserRoleSelector
          userId={user.id}
          currentRole={user.role}
          isSelf={isSelf}
        />
      </div>
    </div>
  )
}

// ── Sort header ───────────────────────────────────────────────────────────────
function SortHeader({ label, k, current, dir, onClick }: {
  label: string; k: SortKey; current: SortKey; dir: SortDir; onClick: (k: SortKey) => void
}) {
  const isActive = current === k
  const Icon = !isActive ? ChevronsUpDown : dir === 'asc' ? ChevronUp : ChevronDown
  return (
    <button
      onClick={() => onClick(k)}
      className="flex items-center gap-1 transition-colors hover:text-amber-700 text-left"
      style={{ color: isActive ? 'var(--color-gold)' : 'var(--color-ink-faint)' }}
    >
      {label}
      <Icon size={12} />
    </button>
  )
}
