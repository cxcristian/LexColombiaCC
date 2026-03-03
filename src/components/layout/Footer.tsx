import { ExternalLink } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex justify-center mb-8">
          {/* Sources */}
          <div className="text-center">
            <h4 className="text-xs font-semibold text-navy-900 uppercase tracking-wider mb-3">Fuentes oficiales</h4>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              {[
                { href: 'https://www.suin-juriscol.gov.co', label: 'SUIN Juriscol' },
                { href: 'https://www.corteconstitucional.gov.co', label: 'Corte Constitucional' },
                { href: 'https://www.consejodeestado.gov.co', label: 'Consejo de Estado' },
              ].map(({ href, label }) => (
                <a key={href} href={href} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-navy-800 transition-colors"
                >
                  {label} <ExternalLink size={10} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} BiblioLex. Esta plataforma no ofrece asesoría jurídica.</p>
          <p className="text-xs text-slate-400">Datos: <a href="https://datos.gov.co" className="hover:text-navy-700 transition-colors" target="_blank" rel="noopener noreferrer">datos.gov.co</a></p>
        </div>
      </div>
    </footer>
  )
}
