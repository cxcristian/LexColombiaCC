import Link from 'next/link'
import { Scale, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(200,144,10,0.1)', border: '1px solid rgba(200,144,10,0.2)' }}
        >
          <Scale size={36} style={{ color: 'var(--color-gold)' }} />
        </div>
        <h1 className="font-display font-bold text-6xl mb-2" style={{ color: 'var(--color-gold)' }}>
          404
        </h1>
        <h2 className="font-display font-semibold text-2xl mb-3" style={{ color: 'var(--color-ink)' }}>
          Página no encontrada
        </h2>
        <p className="text-sm mb-8" style={{ color: 'var(--color-ink-muted)' }}>
          La norma o precedente que buscas no está disponible o el enlace ha cambiado.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm transition-all hover:scale-105"
          style={{ background: 'var(--color-gold)', color: '#0f0b05' }}
        >
          <ArrowLeft size={15} />
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
