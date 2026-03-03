'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Scale, BookOpen, Gavel, Menu, X, LogIn, LogOut, FileText, ChevronDown, User, Shield, Search } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { AuthModal } from '@/components/auth/AuthModal'

const navLinks = [
  { href: '/', label: 'Inicio', exact: true },
  { href: '/leyes', label: 'Biblioteca', icon: BookOpen },
]

export function Navbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen]       = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { user, profile, loading, signOut } = useAuth()
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--navy-900)' }}
            >
              <Scale size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-navy-900 text-lg hidden sm:block">
              BiblioLex
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {navLinks.map(({ href, label, exact }) => (
              <Link key={href} href={href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  isActive(href, exact)
                    ? 'bg-navy-50 text-navy-900 font-semibold'
                    : 'text-slate-600 hover:text-navy-900 hover:bg-slate-50'
                )}
              >
                {label}
              </Link>
            ))}
            {user && (
              <Link href="/notas"
                className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  pathname.startsWith('/notas') ? 'bg-navy-50 text-navy-900 font-semibold' : 'text-slate-600 hover:text-navy-900 hover:bg-slate-50'
                )}
              >
                Mis notas
              </Link>
            )}
            {user && (
              <Link href="/calendario"
                className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  pathname.startsWith('/calendario') ? 'bg-navy-50 text-navy-900 font-semibold' : 'text-slate-600 hover:text-navy-900 hover:bg-slate-50'
                )}
              >
                Calendario
              </Link>
            )}
            {user && (
              <Link href="/casos"
                className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  pathname.startsWith('/casos') ? 'bg-navy-50 text-navy-900 font-semibold' : 'text-slate-600 hover:text-navy-900 hover:bg-slate-50'
                )}
              >
                Mis casos
              </Link>
            )}
          </nav>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-2">
            <Link href="/leyes"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-navy-800 hover:bg-slate-50 transition-all border border-slate-200"
            >
              <Search size={14} />
              <span className="hidden lg:inline text-xs">Buscar documentos</span>
            </Link>

            {loading ? (
              <div className="w-20 h-8 skeleton rounded-lg" />
            ) : user ? (
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-navy-300 hover:bg-navy-50 transition-all"
                >
                  {profile?.avatar_url ? (
                    <Image src={profile.avatar_url} alt="Avatar" width={26} height={26} className="rounded-full" />
                  ) : (
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: 'var(--navy-800)' }}
                    >
                      {(profile?.full_name ?? user.email ?? 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm text-navy-800 font-medium max-w-[100px] truncate hidden lg:block">
                    {profile?.full_name?.split(' ')[0] ?? 'Usuario'}
                  </span>
                  {profile?.role === 'admin' && (
                    <Shield size={12} className="text-amber-600" />
                  )}
                  <ChevronDown size={13} className={cn('text-slate-400 transition-transform', userMenuOpen && 'rotate-180')} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-card-hover overflow-hidden animate-slide-down z-50">
                    <div className="px-4 py-3 bg-navy-50 border-b border-slate-100">
                      <p className="text-sm font-semibold text-navy-900 truncate">{profile?.full_name ?? 'Usuario'}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      <span className={cn('inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded text-xs font-medium',
                        profile?.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                      )}>
                        {profile?.role === 'admin' ? <><Shield size={10} />Admin</> : <><User size={10} />Usuario</>}
                      </span>
                    </div>
                    <div className="p-1.5 space-y-0.5">
                      {[
                        { href: '/dashboard', icon: User, label: 'Mi perfil' },
                        { href: '/notas', icon: FileText, label: 'Mis notas' },
                        ...(profile?.role === 'admin' ? [{ href: '/admin', icon: Shield, label: 'Panel admin' }] : []),
                      ].map(({ href, icon: Icon, label }) => (
                        <Link key={href} href={href} onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-slate-700 hover:bg-navy-50 hover:text-navy-900 transition-colors"
                        >
                          <Icon size={14} className="text-slate-400" />{label}
                        </Link>
                      ))}
                    </div>
                    <div className="p-1.5 border-t border-slate-100">
                      <button onClick={() => { signOut(); setUserMenuOpen(false) }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={14} />Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => setShowAuthModal(true)}
                className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
              >
                <LogIn size={14} />Iniciar sesión
              </button>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden text-slate-600 hover:text-navy-900" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-slate-100 px-4 py-3 space-y-1 bg-white animate-slide-down">
            {navLinks.map(({ href, label, exact }) => (
              <Link key={href} href={href} onClick={() => setMenuOpen(false)}
                className={cn('flex items-center px-3 py-2.5 rounded-xl text-sm transition-colors',
                  isActive(href, exact) ? 'bg-navy-50 text-navy-900 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                )}
              >
                {label}
              </Link>
            ))}
            {user && (
              <Link href="/notas" onClick={() => setMenuOpen(false)}
                className="flex items-center px-3 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-slate-50"
              >
                <FileText size={15} className="mr-2" />Mis notas
              </Link>
            )}
            <div className="pt-2 border-t border-slate-100">
              {user ? (
                <button onClick={() => { signOut(); setMenuOpen(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut size={15} />Cerrar sesión
                </button>
              ) : (
                <button onClick={() => { setShowAuthModal(true); setMenuOpen(false) }}
                  className="w-full btn-primary flex items-center justify-center gap-2 py-2.5 text-sm"
                >
                  <LogIn size={15} />Iniciar sesión
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  )
}
