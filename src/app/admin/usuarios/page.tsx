'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Search, X, Users, FileText, ChevronUp, ChevronDown, ChevronsUpDown, Loader2, Shield, User, UserX, ChevronRight } from 'lucide-react'
import { supabaseClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import type { Profile, UserRole } from '@/types/database'

interface UserWithNotes extends Profile { notes_count: number }
type SortKey = 'full_name' | 'created_at' | 'notes_count' | 'role'
type SortDir = 'asc' | 'desc'
const ROLE_ORDER: Record<UserRole, number> = { admin: 0, user: 1, blocked: 2 }

const ROLE_STYLES: Record<UserRole, { bg: string; color: string; label: string; desc: string }> = {
  user:    { bg: '#e8edf5', color: '#1e2a45', label: 'Usuario',   desc: 'Acceso normal a la plataforma' },
  admin:   { bg: '#fef3c7', color: '#92400e', label: 'Admin',     desc: 'Acceso total incluyendo panel admin' },
  blocked: { bg: '#fee2e2', color: '#991b1b', label: 'Bloqueado', desc: 'Sin acceso a la plataforma' },
}

export default function AdminUsuariosPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers]         = useState<UserWithNotes[]>([])
  const [loading, setLoading]     = useState(true)
  const [query, setQuery]         = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('')
  const [sortKey, setSortKey]     = useState<SortKey>('created_at')
  const [sortDir, setSortDir]     = useState<SortDir>('desc')
  const [saving, setSaving]       = useState(false)

  // Panel lateral
  const [selectedUser, setSelectedUser]   = useState<UserWithNotes | null>(null)
  const [pendingRole, setPendingRole]     = useState<UserRole | null>(null)

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

  const openPanel = (u: UserWithNotes) => {
    if (u.id === currentUser?.id) return
    setSelectedUser(u)
    setPendingRole(u.role)
  } 

  const closePanel = () => {
    setSelectedUser(null)
    setPendingRole(null)
  }

  const handleConfirm = async () => {
    if (!selectedUser || !pendingRole || pendingRole === selectedUser.role) return
    setSaving(true)
    const { error } = await supabaseClient.from('profiles').update({ role: pendingRole }).eq('id', selectedUser.id)
    if (!error) {
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, role: pendingRole } : u))
      setSelectedUser(prev => prev ? { ...prev, role: pendingRole } : null)
    }
    setSaving(false)
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
        <p className="text-sm text-slate-500">Haz clic en un usuario para cambiar su rol</p>
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

      {/* Tabla + Panel lateral */}
      <div className="flex gap-4 items-start">

        {/* Tabla */}
        <div className={cn('lex-card overflow-hidden transition-all duration-300', selectedUser ? 'flex-1 min-w-0' : 'w-full')}>
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
              {filtered.map((u, i) => {
                const isSelected = selectedUser?.id === u.id
                const roleStyle  = ROLE_STYLES[u.role]
                return (
                  <div key={u.id}
                    onClick={() => u.id !== currentUser?.id && (isSelected ? closePanel() : openPanel(u))}
                    className={cn(
                      'grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto] gap-3 sm:gap-4 px-6 py-4 items-center transition-all opacity-0 animate-fade-up',
                      u.id === currentUser?.id ? 'cursor-default' : 'cursor-pointer hover:bg-slate-50',
                      isSelected && 'bg-navy-50 border-l-2 border-navy-500'
                    )}
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
                          {u.id === currentUser?.id && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                              style={{ background: '#e8edf5', color: '#1e2a45' }}
                            >tú</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 truncate">{u.email}</p>
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="hidden sm:flex items-center gap-1.5 text-sm justify-center text-slate-500">
                      <FileText size={13} />
                      <span className="font-semibold text-navy-900">{u.notes_count}</span>
                    </div>

                    {/* Date */}
                    <div className="hidden sm:block text-xs text-center text-slate-400">
                      {new Date(u.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>

                    {/* Role badge + arrow */}
                    <div className="flex items-center justify-end gap-2">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ background: roleStyle.bg, color: roleStyle.color }}
                      >
                        {roleStyle.label}
                      </span>
                      {u.id !== currentUser?.id && (
                        <ChevronRight size={14} className={cn(
                          'text-slate-300 transition-transform duration-200',
                          isSelected && 'rotate-180 text-navy-500'
                        )} />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Panel lateral de edición */}
        {selectedUser && (
          <div className="w-64 flex-shrink-0 lex-card overflow-hidden animate-slide-down">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-navy-900">Cambiar rol</h3>
              <button onClick={closePanel}
                className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* User info */}
            <div className="px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                {selectedUser.avatar_url ? (
                  <Image src={selectedUser.avatar_url} alt="" width={36} height={36} className="rounded-full flex-shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                    style={{ background: 'var(--navy-700)' }}
                  >
                    {(selectedUser.full_name ?? selectedUser.email ?? 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-navy-900 truncate">{selectedUser.full_name ?? 'Sin nombre'}</p>
                  <p className="text-xs text-slate-400 truncate">{selectedUser.email}</p>
                </div>
              </div>
            </div>

            {/* Role options */}
            <div className="px-4 py-3 space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Selecciona el rol</p>
              {(Object.entries(ROLE_STYLES) as [UserRole, typeof ROLE_STYLES[UserRole]][]).map(([role, style]) => (
                <button key={role} onClick={() => setPendingRole(role)}
                  className={cn(
                    'w-full flex items-start gap-3 px-3 py-2.5 rounded-xl border-2 transition-all text-left',
                    pendingRole === role
                      ? 'border-navy-400 bg-navy-50'
                      : 'border-transparent hover:border-slate-200 hover:bg-slate-50'
                  )}
                >
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 mt-0.5"
                    style={{ background: style.bg, color: style.color }}
                  >
                    {style.label}
                  </span>
                  <span className="text-xs text-slate-500 leading-relaxed">{style.desc}</span>
                  {pendingRole === role && (
                    <span className="ml-auto text-navy-500 font-bold text-sm flex-shrink-0">✓</span>
                  )}
                </button>
              ))}
            </div>

            {/* Confirm */}
            <div className="px-4 pb-4 pt-2 space-y-2">
              {/* Visual: from → to */}
              {pendingRole && pendingRole !== selectedUser.role && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 mb-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={{ background: ROLE_STYLES[selectedUser.role].bg, color: ROLE_STYLES[selectedUser.role].color }}
                  >
                    {ROLE_STYLES[selectedUser.role].label}
                  </span>
                  <span className="text-slate-400 text-xs">→</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={{ background: ROLE_STYLES[pendingRole].bg, color: ROLE_STYLES[pendingRole].color }}
                  >
                    {ROLE_STYLES[pendingRole].label}
                  </span>
                </div>
              )}

              <button
                onClick={handleConfirm}
                disabled={!pendingRole || pendingRole === selectedUser.role || saving}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'var(--navy-900)' }}
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : null}
                {saving ? 'Guardando...' : 'Confirmar cambio'}
              </button>
              <button onClick={closePanel}
                className="w-full py-2 rounded-xl text-xs font-medium text-slate-500 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}