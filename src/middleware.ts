import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Handle auth callback with PKCE code exchange
  if (request.nextUrl.pathname === '/auth/callback') {
    const code = request.nextUrl.searchParams.get('code')
    const error = request.nextUrl.searchParams.get('error')

    if (error) {
      const errorDesc = request.nextUrl.searchParams.get('error_description') || error
      const url = request.nextUrl.clone()
      url.pathname = '/auth/error'
      url.searchParams.set('error', errorDesc)
      return NextResponse.redirect(url)
    }

    if (code) {
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.error('PKCE code exchange error:', exchangeError.message)
        const url = request.nextUrl.clone()
        url.pathname = '/auth/error'
        url.searchParams.set('error', exchangeError.message)
        return NextResponse.redirect(url)
      }

      // Success - redirect to app
      const url = request.nextUrl.clone()
      url.pathname = '/app'
      url.search = ''
      return NextResponse.redirect(url)
    }
  }

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect /app routes - redirect to login if not authenticated
  if (request.nextUrl.pathname.startsWith('/app') && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from auth pages (except callback and error)
  if (request.nextUrl.pathname.startsWith('/auth') &&
      !request.nextUrl.pathname.startsWith('/auth/callback') &&
      !request.nextUrl.pathname.startsWith('/auth/error') &&
      user) {
    const url = request.nextUrl.clone()
    url.pathname = '/app'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
