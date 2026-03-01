'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Search, X, Users, FileText, ChevronUp, ChevronDown, ChevronsUpDown, Loader2, Shield, User, UserX } from 'lucide-react'
import { supabaseClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import type { Profile, UserRole } from '@/types/database'

interface UserWithNotes extends Profile { notes_count: number }
type SortKey = 'full_name' | 'created_at' | 'notes_count' | 'role'
type SortDir = 'asc' | 'desc'
const ROLE_ORDER: Record<UserRole, number> = { admin: 0, user: 1, blocked: 2 }

export default function AdminUsuariosPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers]     = useState<UserWithNotes[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery]     = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('')
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [changingRole, setChangingRole] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const [{ data: profiles }, { data: notesCounts }] = await Promise.all([
        supabaseClient.from('profiles').select('*').order('created_at', { ascending: false }),
        supabaseClient.from('notes').select('user_id'),
      ])
      const countMap: Record<string, number> = {}
      notesCounts?.forEach((n: { user_id: string }) => { countMap[n.user_id] = (countMap[n.user_id] ?? 0) + 1 })
      setUsers((profiles ?? []).map(p => ({ ...p, notes_count: countMap[p.id] ?? 0 })))
      setLoading(false)
    }
    load()
  }, [])

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (userId === currentUser?.id) return
    setChangingRole(userId)
    const { error } = await supabaseClient.from('profiles').update({ role: newRole }).eq('id', userId)
    if (!error) setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
    setChangingRole(null)
  }

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const filtered = users
    .filter(u => {
      if (roleFilter && u.role !== roleFilter) return false
      if (query.trim()) {
        const q = query.toLowerCase()
        return u.full_name?.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      }
      return true
    })
    .sort((a, b) => {
      let va: string | number = '', vb: string | number = ''
      if (sortKey === 'full_name')   { va = (a.full_name ?? a.email).toLowerCase(); vb = (b.full_name ?? b.email).toLowerCase() }
      if (sortKey === 'created_at')  { va = a.created_at; vb = b.created_at }
      if (sortKey === 'notes_count') { va = a.notes_count; vb = b.notes_count }
      if (sortKey === 'role')        { va = ROLE_ORDER[a.role]; vb = ROLE_ORDER[b.role] }
      return sortDir === 'asc' ? (va < vb ? -1 : va > vb ? 1 : 0) : (va > vb ? -1 : va < vb ? 1 : 0)
    })

  const counts = {
    total:      users.length,
    activos:    users.filter(u => u.role === 'user').length,
    admins:     users.filter(u => u.role === 'admin').length,
    bloqueados: users.filter(u => u.role === 'blocked').length,
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2 size={28} className="animate-spin text-navy-400" />
    </div>
  )

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display font-black text-2xl sm:text-3xl text-navy-900 mb-1">Gestión de usuarios</h1>
        <p className="text-sm text-slate-500">Administra roles y accesos de todos los usuarios</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Users,  label: 'Total',      value: counts.total,      color: '#1e3a6e' },
          { icon: User,   label: 'Activos',     value: counts.activos,    color: '#16a34a' },
          { icon: Shield, label: 'Admins',      value: counts.admins,     color: '#d97706' },
          { icon: UserX,  label: 'Bloqueados',  value: counts.bloqueados, color: '#dc2626' },
        ].map(({ icon: Icon, label, value, color }, i) => (
          <div key={label} className="lex-card p-4 opacity-0 animate-fade-up"
            style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'forwards' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon size={14} style={{ color }} />
              <span className="text-xs text-slate-500">{label}</span>
            </div>
            <div className="font-display font-black text-2xl" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="flex items-start gap-3 p-4 rounded-xl border border-blue-100 bg-blue-50 text-sm">
        <Shield size={15} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-blue-900 mb-0.5">Cómo cambiar roles</p>
          <p className="text-blue-700">Usa el selector en cada fila para cambiar entre <strong>Usuario</strong>, <strong>Admin</strong> y <strong>Bloqueado</strong>. No puedes cambiar tu propio rol.</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por nombre o email..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-200 bg-white"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-slate-100">
              <X size={13} className="text-slate-400" />
            </button>
          )}
        </div>
        <div className="flex gap-1 p-1 rounded-xl border border-slate-200 bg-white">
          {([['', 'Todos'], ['user', 'Usuarios'], ['admin', 'Admins'], ['blocked', 'Bloqueados']] as [UserRole | '', string][]).map(([val, label]) => (
            <button key={val} onClick={() => setRoleFilter(val)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                roleFilter === val ? 'bg-navy-900 text-white' : 'text-slate-500 hover:bg-slate-50'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-slate-500">
        <span className="font-semibold text-navy-900">{filtered.length}</span> usuario{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* Table */}
      <div className="lex-card overflow-hidden">
        <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto] gap-4 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 border-b border-slate-100 bg-slate-50">
          {([['full_name', 'Usuario'], ['notes_count', 'Notas'], ['created_at', 'Registro'], ['role', 'Rol']] as [SortKey, string][]).map(([key, label]) => (
            <button key={key} onClick={() => handleSort(key)}
              className="flex items-center gap-1 hover:text-navy-700 transition-colors text-left"
              style={{ color: sortKey === key ? 'var(--navy-700)' : undefined }}
            >
              {label}
              {sortKey !== key ? <ChevronsUpDown size={11} /> : sortDir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Users size={32} className="mx-auto mb-3 text-slate-300" />
            <p className="font-display font-semibold text-navy-900">Sin resultados</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((u, i) => (
              <div key={u.id}
                className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto] gap-3 sm:gap-4 px-6 py-4 items-center hover:bg-slate-50 transition-colors opacity-0 animate-fade-up"
                style={{ animationDelay: `${i * 35}ms`, animationFillMode: 'forwards' }}
              >
                {/* User info */}
                <div className="flex items-center gap-3 min-w-0">
                  {u.avatar_url ? (
                    <Image src={u.avatar_url} alt="" width={38} height={38} className="rounded-full flex-shrink-0 ring-2 ring-white" />
                  ) : (
                    <div className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 ring-2 ring-white"
                      style={{ background: 'var(--navy-700)' }}
                    >
                      {(u.full_name ?? u.email ?? 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-navy-900 truncate">{u.full_name ?? 'Sin nombre'}</p>
                      {u.id === currentUser?.id && <span className="badge badge-navy text-xs">tú</span>}
                    </div>
                    <p className="text-xs text-slate-400 truncate">{u.email}</p>
                  </div>
                </div>

                {/* Notes count */}
                <div className="hidden sm:flex items-center gap-1.5 text-sm justify-center text-slate-500">
                  <FileText size={13} />
                  <span className="font-semibold text-navy-900">{u.notes_count}</span>
                </div>

                {/* Date */}
                <div className="hidden sm:block text-xs text-center text-slate-400">
                  {new Date(u.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>

                {/* Role selector */}
                <div className="flex items-center justify-start sm:justify-center">
                  {u.id === currentUser?.id ? (
                    <span className="badge badge-gold flex items-center gap-1"><Shield size={10} />Admin (tú)</span>
                  ) : changingRole === u.id ? (
                    <Loader2 size={16} className="animate-spin text-navy-400" />
                  ) : (
                    <RoleDropdown currentRole={u.role} onChange={role => handleRoleChange(u.id, role)} />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function RoleDropdown({ currentRole, onChange }: { currentRole: UserRole; onChange: (r: UserRole) => void }) {
  const [open, setOpen] = useState(false)
  const options: Array<{ value: UserRole; label: string; cls: string }> = [
    { value: 'user',    label: 'Usuario',   cls: 'badge-navy' },
    { value: 'admin',   label: 'Admin',     cls: 'badge-gold' },
    { value: 'blocked', label: 'Bloqueado', cls: 'badge-red'  },
  ]
  const current = options.find(o => o.value === currentRole) ?? options[0]

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className={cn('badge cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1', current.cls)}
      >
        {current.label}
        <ChevronDown size={10} className={cn('transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 w-32 bg-white rounded-xl border border-slate-200 shadow-card-hover z-20 overflow-hidden animate-slide-down">
          {options.map(o => (
            <button key={o.value} onClick={() => { onChange(o.value); setOpen(false) }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-slate-50 transition-colors"
            >
              <span className={cn('badge', o.cls)}>{o.label}</span>
              {currentRole === o.value && <span className="ml-auto text-navy-400">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}