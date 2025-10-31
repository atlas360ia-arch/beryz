import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Middleware Next.js pour gérer l'authentification Supabase
 * Rafraîchit automatiquement les sessions utilisateurs
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Rafraîchir la session si elle existe
  const { data: { user } } = await supabase.auth.getUser()

  // Vérifier si l'utilisateur est banni
  if (user) {
    const { data: profile } = await supabase
      .from('seller_profiles')
      .select('banned')
      .eq('user_id', user.id)
      .single()

    // Si l'utilisateur est banni, le rediriger vers la page banned
    // sauf s'il est déjà sur la page banned ou en train de se déconnecter
    if (profile?.banned &&
        !request.nextUrl.pathname.startsWith('/banned') &&
        !request.nextUrl.pathname.startsWith('/api/auth/signout')) {
      return NextResponse.redirect(new URL('/banned', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
