import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/app'

  const supabase = await createClient()

  // Handle PKCE flow (code exchange)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    console.error('Code exchange error:', error)
  }

  // Handle token hash flow (email verification)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'signup' | 'recovery' | 'email',
    })
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    console.error('Token verification error:', error)
  }

  // Check if user is already authenticated (redirect happened with session)
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    return NextResponse.redirect(`${origin}${next}`)
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/error`)
}
