'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Scale, Shield, Users, LayoutDashboard, ChevronRight, Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

const adminLinks = [
  { href: '/admin',          label: 'Visión general', icon: LayoutDashboard, exact: true },
  { href: '/admin/usuarios', label: 'Usuarios',       icon: Users },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth()
  const router  = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'admin')) {
      router.push('/')
    }
  }, [user, profile, loading, router])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 size={28} className="animate-spin text-navy-400" />
    </div>
  )
  if (!user || profile?.role !== 'admin') return null

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-navy-900 border-r border-navy-800 flex-shrink-0">
        <div className="px-5 py-5 border-b border-navy-800">
          <Link href="/" className="flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/10">
              <Scale size={14} className="text-white" />
            </div>
            <span className="font-display font-bold text-white text-sm">BiblioLex</span>
          </Link>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
            <Shield size={14} className="text-amber-400" />
            <div>
              <p className="text-xs font-semibold text-white">Panel Admin</p>
              <p className="text-xs text-white/40 truncate max-w-[130px]">
                {profile.full_name ?? profile.email}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {adminLinks.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href)
            return (
              <Link key={href} href={href}
                className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
                  active ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'
                )}
              >
                <Icon size={16} />
                {label}
                <ChevronRight size={12} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-navy-800">
          <Link href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white/40 hover:text-white hover:bg-white/5 transition-all"
          >
            <ChevronRight size={14} className="rotate-180" />
            Volver al sitio
          </Link>
        </div>
      </aside>

      {/* Mobile topbar */}
      <div className="lg:hidden fixed top-16 left-0 right-0 z-40 bg-navy-900 border-b border-navy-800 px-4 py-2 flex gap-2">
        {adminLinks.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link key={href} href={href}
              className={cn('flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                active ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white'
              )}
            >
              <Icon size={13} />{label}
            </Link>
          )
        })}
      </div>

      <div className="flex-1 p-5 sm:p-8 overflow-auto lg:pt-8 pt-14">
        {children}
      </div>
    </div>
  )
}
