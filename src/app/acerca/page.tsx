import type { Metadata } from 'next'
import { Scale, BookOpen, Gavel, FileText, Shield, Clock, Database, Globe, Users, Heart } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'Acerca de BiblioLex — Biblioteca Jurídica Pública Digital',
    description: 'Conoce BiblioLex: la plataforma gratuita de acceso a la legislación colombiana, jurisprudencia y herramientas jurídicas digitales.',
}

export default function AcercaPage() {
    return (
        <div>
            {/* Hero */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, var(--navy-950) 0%, var(--navy-800) 60%, var(--navy-600) 100%)' }} />
                <div className="absolute inset-0 opacity-[0.04]"
                    style={{ backgroundImage: 'linear-gradient(var(--navy-300) 1px, transparent 1px), linear-gradient(90deg, var(--navy-300) 1px, transparent 1px)', backgroundSize: '60px 60px' }}
                />
                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
                    <div className="animate-fade-up">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
                        >
                            <Scale size={32} style={{ color: 'rgba(255,255,255,0.8)' }} />
                        </div>
                        <h1 className="font-display font-bold text-3xl sm:text-5xl leading-tight text-white mb-4">
                            Acerca de <span style={{ color: '#93b4d8' }}>BiblioLex</span>
                        </h1>
                        <p className="text-base sm:text-lg leading-relaxed max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.65)' }}>
                            BiblioLex es una plataforma pública y gratuita que democratiza el acceso a la legislación y jurisprudencia colombiana, poniendo el derecho al alcance de todos los ciudadanos.
                        </p>
                    </div>
                </div>
            </section>

            {/* ¿Qué es BiblioLex? */}
            <section className="py-16 px-4 sm:px-6 bg-white">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-10">
                        <h2 className="font-display font-bold text-2xl sm:text-3xl text-navy-900 mb-3">
                            ¿Qué es BiblioLex?
                        </h2>
                        <div className="w-12 h-1 rounded-full" style={{ background: 'var(--navy-600)' }} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <p className="text-slate-600 leading-relaxed mb-4">
                                BiblioLex es una <strong className="text-navy-900">biblioteca jurídica digital pública</strong> diseñada para facilitar el acceso a toda la normativa vigente de Colombia. Desde leyes y decretos hasta sentencias históricas de las altas cortes, toda la información está organizada y disponible de forma gratuita.
                            </p>
                            <p className="text-slate-600 leading-relaxed">
                                La plataforma nace de la necesidad de contar con una herramienta moderna, accesible y actualizada que permita a ciudadanos, estudiantes de derecho, abogados e investigadores consultar el ordenamiento jurídico colombiano de manera eficiente.
                            </p>
                        </div>
                        <div className="space-y-4">
                            {[
                                { icon: Shield, title: 'Acceso público y gratuito', desc: 'Sin registros obligatorios ni costos. La justicia es para todos.' },
                                { icon: Clock, title: 'Disponible 24/7', desc: 'Consulta la legislación colombiana en cualquier momento.' },
                                { icon: Database, title: 'Datos oficiales', desc: 'Información proveniente directamente de fuentes gubernamentales.' },
                            ].map(({ icon: Icon, title, desc }) => (
                                <div key={title} className="flex gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                        style={{ background: 'var(--navy-50)', border: '1px solid var(--navy-100)' }}
                                    >
                                        <Icon size={16} style={{ color: 'var(--navy-700)' }} />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-navy-900 text-sm">{title}</h4>
                                        <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Funcionalidades */}
            <section className="py-16 px-4 sm:px-6 bg-slate-50">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-10 text-center">
                        <h2 className="font-display font-bold text-2xl sm:text-3xl text-navy-900 mb-2">
                            Funcionalidades
                        </h2>
                        <p className="text-slate-500">Todo lo que necesitas para tu investigación jurídica</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {[
                            {
                                icon: BookOpen,
                                title: 'Biblioteca de Leyes y Normas',
                                desc: 'Accede a más de 50.000 leyes, decretos, resoluciones y demás normas del ordenamiento jurídico colombiano, con filtros avanzados de búsqueda.',
                                color: '#1e3a6e',
                            },
                            {
                                icon: Gavel,
                                title: 'Precedentes Judiciales',
                                desc: 'Consulta sentencias históricas de la Corte Constitucional, Consejo de Estado y Corte Suprema de Justicia. Web scraping en tiempo real de datos oficiales.',
                                color: '#a82020',
                            },
                            {
                                icon: FileText,
                                title: 'Notas Jurídicas',
                                desc: 'Crea y organiza notas vinculadas a leyes y precedentes específicos. Tu cuaderno de investigación jurídica digital.',
                                color: '#d97706',
                            },
                            {
                                icon: Globe,
                                title: 'Web Scraping de Sentencias',
                                desc: 'Importa sentencias directamente desde la base de datos oficial de datos.gov.co con más de 29.000 registros de la Corte Constitucional.',
                                color: '#059669',
                            },
                        ].map(({ icon: Icon, title, desc, color }, i) => (
                            <div key={title} className="lex-card p-6" style={{ animationDelay: `${i * 80}ms` }}>
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                                    style={{ background: `${color}10`, border: `1px solid ${color}20` }}
                                >
                                    <Icon size={20} style={{ color }} />
                                </div>
                                <h3 className="font-display font-semibold text-navy-900 text-base mb-2">{title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Fuentes de datos */}
            <section className="py-16 px-4 sm:px-6 bg-white">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-10">
                        <h2 className="font-display font-bold text-2xl sm:text-3xl text-navy-900 mb-2">
                            Fuentes de datos
                        </h2>
                        <p className="text-slate-500">Toda la información proviene de fuentes oficiales del Estado colombiano</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        {[
                            {
                                name: 'SUIN-Juriscol',
                                desc: 'Sistema Único de Información Normativa del Ministerio de Justicia',
                                url: 'https://www.suin-juriscol.gov.co',
                            },
                            {
                                name: 'Datos Abiertos Colombia',
                                desc: 'Portal de datos abiertos del gobierno colombiano (datos.gov.co)',
                                url: 'https://datos.gov.co',
                            },
                            {
                                name: 'Corte Constitucional',
                                desc: 'Relatoría oficial de la Corte Constitucional de Colombia',
                                url: 'https://www.corteconstitucional.gov.co',
                            },
                        ].map(({ name, desc, url }) => (
                            <a key={name} href={url} target="_blank" rel="noopener noreferrer"
                                className="lex-card p-5 group hover:border-navy-200 transition-all block"
                            >
                                <h4 className="font-display font-semibold text-navy-900 text-sm mb-1 group-hover:text-navy-700">{name}</h4>
                                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                                <span className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-navy-600 group-hover:text-navy-800">
                                    Visitar sitio →
                                </span>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* Misión */}
            <section className="py-16 px-4 sm:px-6" style={{ background: 'var(--navy-950)' }}>
                <div className="max-w-3xl mx-auto text-center">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-6"
                        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                    >
                        <Heart size={22} style={{ color: 'rgba(255,255,255,0.6)' }} />
                    </div>
                    <h2 className="font-display font-bold text-2xl sm:text-3xl text-white mb-4">
                        Nuestra misión
                    </h2>
                    <p className="text-base leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        Creemos que el acceso a la información jurídica es un derecho fundamental. BiblioLex existe para cerrar la brecha entre el ciudadano y la ley, facilitando que cualquier persona pueda conocer, entender y ejercer sus derechos. La justicia no debe ser un privilegio, sino una garantía para todos.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href="/leyes"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-white text-navy-900 hover:bg-navy-50 transition-all hover:-translate-y-0.5"
                        >
                            <BookOpen size={16} />
                            Explorar Biblioteca
                        </Link>
                        <Link href="/precedentes"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm border border-white/20 text-white hover:bg-white/10 transition-all"
                        >
                            <Gavel size={16} />
                            Ver Precedentes
                        </Link>
                    </div>
                </div>
            </section>

            {/* Disclaimer */}
            <section className="py-8 px-4 sm:px-6 bg-slate-50 border-t border-slate-200">
                <div className="max-w-4xl mx-auto text-center">
                    <p className="text-xs text-slate-400 leading-relaxed">
                        BiblioLex es una plataforma informativa y no ofrece asesoría jurídica profesional. Los datos
                        provienen de fuentes oficiales del Estado colombiano y se actualizan periódicamente.
                        Para consultas legales, acuda a un profesional del derecho.
                    </p>
                </div>
            </section>
        </div>
    )
}
