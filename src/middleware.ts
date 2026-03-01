import { type NextRequest, NextResponse } from 'next/server'

// Auth se maneja client-side con useAuth() en cada página
// El middleware solo pasa todo sin interceptar
export async function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
