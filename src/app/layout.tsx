import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { AuthProvider } from '@/context/AuthContext'

export const metadata: Metadata = {
  title: {
    default: 'BiblioLex — Biblioteca Jurídica de Colombia',
    template: '%s | BiblioLex',
  },
  description: 'Biblioteca jurídica pública digital. Consulta leyes, decretos, resoluciones y jurisprudencia colombiana de forma gratuita.',
  keywords: ['leyes colombianas', 'jurisprudencia', 'Corte Constitucional', 'SUIN', 'derecho Colombia'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO">
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}
