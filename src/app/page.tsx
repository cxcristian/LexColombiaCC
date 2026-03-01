import Link from 'next/link'
import { BookOpen, ArrowRight, Shield, Clock, FileText, Gavel, Scale, ChevronRight } from 'lucide-react'

export default function HomePage() {
  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, var(--navy-950) 0%, var(--navy-800) 60%, var(--navy-600) 100%)' }} />
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(var(--navy-300) 1px, transparent 1px), linear-gradient(90deg, var(--navy-300) 1px, transparent 1px)', backgroundSize: '60px 60px' }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div className="animate-fade-up">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6 border"
                style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }}
              >
                <Shield size={11} />
                Acceso Público y Gratuito
              </span>
              <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-[3.25rem] leading-tight text-white mb-5">
                Biblioteca Jurídica<br />
                <span style={{ color: '#93b4d8' }}>Pública Digital</span>
              </h1>
              <p className="text-base sm:text-lg leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.65)' }}>
                Accede a la legislación colombiana completa. Constitución, códigos, leyes, decretos y jurisprudencia unificada, disponibles de forma gratuita para todos los ciudadanos.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/leyes"
                  className="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-white text-navy-900 hover:bg-navy-50 transition-all hover:-translate-y-0.5"
                >
                  <BookOpen size={16} />
                  Explorar Biblioteca
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/precedentes"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm border border-white/20 text-white hover:bg-white/10 transition-all"
                >
                  <Scale size={16} />
                  Acerca de BiblioLex
                </Link>
              </div>
            </div>

            {/* Right — decorative card */}
            <div className="hidden lg:flex justify-center animate-fade-up" style={{ animationDelay: '150ms' }}>
              <div className="relative w-80 h-80">
                {/* Background glow */}
                <div className="absolute inset-0 rounded-3xl opacity-20"
                  style={{ background: 'radial-gradient(circle, var(--navy-300), transparent 70%)' }}
                />
                {/* Main card */}
                <div className="absolute inset-4 rounded-2xl border border-white/10 flex items-center justify-center overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                  <div className="text-center px-6">
                    <Scale size={52} className="mx-auto mb-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
                    <p className="font-display font-bold text-2xl text-white/60">Justicia</p>
                    <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>para todos los colombianos</p>
                  </div>
                </div>
                {/* Floating pills */}
                {[
                  { label: '1.200+ leyes', top: '8%',  left: '-10%' },
                  { label: 'Constitución', top: '75%', left: '-15%' },
                  { label: 'Jurisprudencia', top: '15%', right: '-15%' },
                  { label: 'Acceso libre', top: '70%',  right: '-10%' },
                ].map(({ label, ...pos }) => (
                  <div key={label}
                    className="absolute px-3 py-1.5 rounded-full text-xs font-semibold border"
                    style={{ ...pos, background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)' }}
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {[
              { value: '1.200+', label: 'Documentos' },
              { value: '100%', label: 'Gratuito' },
              { value: '24/7', label: 'Disponible' },
              { value: 'Oficial', label: 'Fuentes' },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="font-display font-bold text-3xl sm:text-4xl text-navy-900 mb-1">{value}</div>
                <div className="text-sm text-slate-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="py-16 px-4 sm:px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-navy-900 mb-2">
              Explorar por categoría
            </h2>
            <p className="text-slate-500">Encuentra exactamente lo que necesitas</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'Leyes y Decretos', desc: 'Toda la normativa vigente colombiana desde 1886', href: '/leyes', icon: BookOpen, count: '50.000+', color: '#1e3a6e' },
              { title: 'Jurisprudencia', desc: 'Sentencias de las altas cortes colombianas', href: '/precedentes', icon: Gavel, count: '200+', color: '#1e3a6e' },
              { title: 'Mis notas', desc: 'Organiza tu investigación jurídica personal', href: '/notas', icon: FileText, count: 'Personal', color: '#1e3a6e' },
            ].map(({ title, desc, href, icon: Icon, count, color }, i) => (
              <Link key={title} href={href}
                className="lex-card group flex items-start gap-4 p-6 block"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                  style={{ background: `${color}10`, border: `1px solid ${color}20` }}
                >
                  <Icon size={20} style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display font-semibold text-navy-900 text-base">{title}</h3>
                    <span className="badge badge-navy flex-shrink-0">{count}</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">{desc}</p>
                  <div className="flex items-center gap-1 mt-3 text-xs font-semibold text-navy-700 group-hover:gap-2 transition-all">
                    Ver documentos <ChevronRight size={13} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-16 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: 'Fuentes oficiales', desc: 'Toda la información proviene directamente de fuentes gubernamentales oficiales de Colombia.' },
              { icon: Clock, title: 'Siempre disponible', desc: 'Acceso 24/7 sin interrupciones a toda la base de datos jurídica colombiana.' },
              { icon: BookOpen, title: 'Actualizado', desc: 'Base de datos en sincronía con el sistema SUIN del Estado colombiano.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--navy-50)', border: '1px solid var(--navy-100)' }}
                >
                  <Icon size={18} style={{ color: 'var(--navy-700)' }} />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-navy-900 mb-1">{title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
