'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Users, FileText, Shield, UserX, TrendingUp, BookOpen, Gavel, ArrowRight, Loader2 } from 'lucide-react'
import { supabaseClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'

interface Stats {
  totalUsers: number; totalAdmins: number; totalBlocked: number
  totalNotes: number; newUsersMonth: number; newNotesMonth: number
}

export default function AdminPage() {
  const [stats, setStats]   = useState<Stats | null>(null)
  const [recent, setRecent] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const startMonth = new Date(); startMonth.setDate(1); startMonth.setHours(0,0,0,0)
      const [
        { data: profiles },
        { count: totalNotes },
        { count: newUsersMonth },
        { count: newNotesMonth },
      ] = await Promise.all([
        supabaseClient.from('profiles').select('*').order('created_at', { ascending: false }),
        supabaseClient.from('notes').select('*', { count: 'exact', head: true }),
        supabaseClient.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', startMonth.toISOString()),
        supabaseClient.from('notes').select('*', { count: 'exact', head: true }).gte('created_at', startMonth.toISOString()),
      ])
      const p = profiles ?? []
      setStats({
        totalUsers: p.length,
        totalAdmins: p.filter(u => u.role === 'admin').length,
        totalBlocked: p.filter(u => u.role === 'blocked').length,
        totalNotes: totalNotes ?? 0,
        newUsersMonth: newUsersMonth ?? 0,
        newNotesMonth: newNotesMonth ?? 0,
      })
      setRecent(p.slice(0, 8))
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2 size={28} className="animate-spin text-navy-400" />
    </div>
  )

  const s = stats!
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display font-black text-2xl sm:text-3xl text-navy-900 mb-1">Visión general</h1>
        <p className="text-sm text-slate-500">Estadísticas y actividad de BiblioLex</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users,    label: 'Total usuarios', value: s.totalUsers,   sub: `+${s.newUsersMonth} este mes`,  color: '#1e3a6e' },
          { icon: Shield,   label: 'Admins',         value: s.totalAdmins,  sub: 'Con acceso total',              color: '#d97706' },
          { icon: UserX,    label: 'Bloqueados',     value: s.totalBlocked, sub: 'Sin acceso',                   color: '#dc2626' },
          { icon: FileText, label: 'Notas creadas',  value: s.totalNotes,   sub: `+${s.newNotesMonth} este mes`, color: '#1e3a6e' },
        ].map(({ icon: Icon, label, value, sub, color }, i) => (
          <div key={label} className="lex-card p-5 opacity-0 animate-fade-up"
            style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'forwards' }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}12` }}>
                <Icon size={17} style={{ color }} />
              </div>
              <TrendingUp size={12} style={{ color: `${color}60` }} />
            </div>
            <div className="font-display font-black text-2xl text-navy-900">{value.toLocaleString('es-CO')}</div>
            <div className="text-sm font-medium text-navy-800 mt-0.5">{label}</div>
            <div className="text-xs text-slate-400 mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent users */}
        <div className="lg:col-span-2 lex-card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="font-display font-bold text-base text-navy-900">Usuarios recientes</h2>
            <Link href="/admin/usuarios" className="text-sm font-medium text-navy-700 hover:text-navy-900 flex items-center gap-1">
              Ver todos <ArrowRight size={13} />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recent.map((u, i) => (
              <div key={u.id} className="flex items-center gap-3 px-6 py-3 hover:bg-slate-50 transition-colors opacity-0 animate-fade-up"
                style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'forwards' }}
              >
                {u.avatar_url ? (
                  <Image src={u.avatar_url} alt="" width={34} height={34} className="rounded-full flex-shrink-0" />
                ) : (
                  <div className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                    style={{ background: 'var(--navy-700)' }}
                  >
                    {(u.full_name ?? u.email ?? 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-navy-900 truncate">{u.full_name ?? 'Sin nombre'}</p>
                  <p className="text-xs text-slate-400 truncate">{u.email}</p>
                </div>
                <span className={`badge ${u.role === 'admin' ? 'badge-gold' : u.role === 'blocked' ? 'badge-red' : 'badge-navy'}`}>
                  {u.role === 'admin' ? 'Admin' : u.role === 'blocked' ? 'Bloqueado' : 'Usuario'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick links + distribution */}
        <div className="space-y-4">
          <div className="lex-card p-5">
            <h3 className="font-display font-bold text-base text-navy-900 mb-4">Acciones</h3>
            <div className="space-y-2">
              {[
                { href: '/admin/usuarios', icon: Users,    label: 'Gestionar usuarios', color: '#1e3a6e' },
                { href: '/leyes',          icon: BookOpen, label: 'Ver leyes',          color: '#1e3a6e' },
                { href: '/precedentes',    icon: Gavel,    label: 'Ver precedentes',    color: '#dc2626' },
              ].map(({ href, icon: Icon, label, color }) => (
                <Link key={href} href={href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-slate-200 text-sm hover:bg-navy-50 hover:border-navy-200 transition-all group"
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}10` }}>
                    <Icon size={14} style={{ color }} />
                  </div>
                  <span className="flex-1 font-medium text-navy-800">{label}</span>
                  <ArrowRight size={13} className="text-slate-300 group-hover:text-navy-400 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
          <div className="lex-card p-5">
            <h3 className="font-display font-bold text-base text-navy-900 mb-4">Distribución</h3>
            {[
              { label: 'Usuarios activos', value: s.totalUsers - s.totalAdmins - s.totalBlocked, color: '#1e3a6e' },
              { label: 'Administradores',  value: s.totalAdmins,  color: '#d97706' },
              { label: 'Bloqueados',       value: s.totalBlocked, color: '#dc2626' },
            ].map(({ label, value, color }) => (
              <div key={label} className="mb-3 last:mb-0">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">{label}</span>
                  <span className="font-semibold" style={{ color }}>{value}</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: s.totalUsers > 0 ? `${(value / s.totalUsers) * 100}%` : '0%', background: color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
