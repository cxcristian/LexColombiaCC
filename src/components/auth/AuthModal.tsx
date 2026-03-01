'use client'

import { useState } from 'react'
import { X, Mail, Lock, User, Loader2, Scale, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

interface Props { onClose: () => void }

export function AuthModal({ onClose }: Props) {
  const { signIn, signUp } = useAuth()
  const [mode, setMode]         = useState<'login' | 'register'>('login')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')

  const handleSubmit = async () => {
    if (!email || !password) { setError('Email y contraseña son obligatorios'); return }
    if (mode === 'register' && !fullName) { setError('El nombre es obligatorio'); return }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    setLoading(true); setError(''); setSuccess('')

    if (mode === 'login') {
      const { error } = await signIn(email, password)
      if (error) {
        setError(error.includes('Invalid login') ? 'Email o contraseña incorrectos' : error)
        setLoading(false)
      } else { onClose() }
    } else {
      const { error } = await signUp(email, password, fullName)
      if (error) {
        setError(error.includes('already registered') ? 'Este email ya está registrado' : error)
        setLoading(false)
      } else {
        setSuccess('¡Cuenta creada! Ya puedes iniciar sesión.')
        setLoading(false)
      }
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(10,15,30,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-modal animate-fade-up bg-white">
        
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--navy-900)' }}
              >
                <Scale size={15} className="text-white" />
              </div>
              <span className="font-display font-bold text-navy-900 text-base">LexColombia</span>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-xl bg-slate-100">
            {(['login', 'register'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); setSuccess('') }}
                className={cn(
                  'flex-1 py-2 text-sm font-semibold rounded-lg transition-all',
                  mode === m ? 'bg-white text-navy-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                )}
              >
                {m === 'login' ? 'Iniciar sesión' : 'Registrarse'}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-6">
          {success ? (
            <div className="flex flex-col items-center text-center py-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                style={{ background: '#dcfce7' }}
              >
                <CheckCircle size={28} style={{ color: '#16a34a' }} />
              </div>
              <h3 className="font-display font-bold text-lg text-navy-900 mb-2">¡Listo!</h3>
              <p className="text-sm text-slate-500 mb-5">{success}</p>
              <button onClick={() => { setMode('login'); setSuccess('') }}
                className="btn-primary px-6 py-2.5 text-sm"
              >
                Iniciar sesión
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
                    Nombre completo
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                      placeholder="Tu nombre"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-300 focus:border-navy-400 transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    placeholder="tu@email.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-300 focus:border-navy-400 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Contraseña</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input type={showPass ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-300 focus:border-navy-400 transition-all"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl text-sm text-red-700 bg-red-50 border border-red-100">
                  {error}
                </div>
              )}

              <button onClick={handleSubmit} disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-sm disabled:opacity-60"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta gratis'}
              </button>

              <p className="text-center text-xs text-slate-500">
                {mode === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
                <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
                  className="font-semibold text-navy-700 hover:text-navy-900 transition-colors"
                >
                  {mode === 'login' ? 'Regístrate gratis' : 'Inicia sesión'}
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
