import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin, hash } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')
  const next = searchParams.get('next') ?? '/app'

  // Log for debugging
  console.log('Auth callback received:', {
    code: !!code,
    token_hash: !!token_hash,
    type,
    error,
    error_description,
    url: request.url
  })

  // If there's an error from Supabase, redirect to error page
  if (error) {
    console.error('Supabase auth error:', error, error_description)
    return NextResponse.redirect(`${origin}/auth/error?error=${encodeURIComponent(error_description || error)}`)
  }

  const supabase = await createClient()

  // Handle PKCE flow (code exchange)
  if (code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    if (!exchangeError) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    console.error('Code exchange error:', exchangeError)
  }

  // Handle token hash flow (email verification)
  if (token_hash && type) {
    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'signup' | 'recovery' | 'email',
    })
    if (!verifyError) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    console.error('Token verification error:', verifyError)
  }

  // Check if user is already authenticated (Supabase might have set session via redirect)
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    return NextResponse.redirect(`${origin}${next}`)
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/error`)
}
