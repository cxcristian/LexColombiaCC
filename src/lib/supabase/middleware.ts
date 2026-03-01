import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/types/database'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // Rutas que requieren cualquier auth
  const authRoutes = ['/dashboard', '/notas']
  // Rutas que requieren rol admin
  const adminRoutes = ['/admin']

  const needsAuth  = authRoutes.some(r => pathname.startsWith(r))
  const needsAdmin = adminRoutes.some(r => pathname.startsWith(r))

  if ((needsAuth || needsAdmin) && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    url.searchParams.set('auth_required', '1')
    return NextResponse.redirect(url)
  }

  if (user && (needsAuth || needsAdmin)) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // Usuario bloqueado → fuera
    if (profile?.role === 'blocked') {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      url.searchParams.set('blocked', '1')
      return NextResponse.redirect(url)
    }

    // Ruta admin → solo admins
    if (needsAdmin && profile?.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      url.searchParams.set('forbidden', '1')
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
