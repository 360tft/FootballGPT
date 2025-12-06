'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState('Processing authentication...')

  useEffect(() => {
    const handleAuth = async () => {
      const params = new URLSearchParams(window.location.search)
      const hash = window.location.hash

      // Check for error in URL params first
      const error = params.get('error')
      const errorDescription = params.get('error_description')

      if (error) {
        setStatus('Authentication failed')
        router.push(`/auth/error?error=${encodeURIComponent(errorDescription || error)}`)
        return
      }

      const supabase = createClient()

      // Check for PKCE flow - code in query params
      const code = params.get('code')
      if (code) {
        console.log('PKCE flow detected - exchanging code for session')
        setStatus('Verifying credentials...')

        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

        if (exchangeError) {
          console.error('Code exchange error:', exchangeError)
          setStatus('Authentication failed')
          router.push(`/auth/error?error=${encodeURIComponent(exchangeError.message)}`)
          return
        }

        if (data.session) {
          console.log('Session established via PKCE')
          setStatus('Success! Redirecting...')
          router.push('/app')
          return
        }
      }

      // Check for implicit flow - tokens in hash fragment
      const hasTokens = hash.includes('access_token') || hash.includes('refresh_token')
      if (hasTokens) {
        console.log('Implicit flow detected - tokens in hash')
        setStatus('Verifying credentials...')
        // Supabase client should auto-parse hash tokens
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      // Check for existing session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      console.log('Session check:', !!session, sessionError?.message)

      if (sessionError) {
        console.error('Session error:', sessionError)
        setStatus('Authentication failed')
        router.push(`/auth/error?error=${encodeURIComponent(sessionError.message)}`)
        return
      }

      if (session) {
        setStatus('Success! Redirecting...')
        router.push('/app')
        return
      }

      // No session yet - wait for auth state change
      setStatus('Completing authentication...')

      let resolved = false

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, newSession) => {
          console.log('Auth state changed:', event, !!newSession)

          if (resolved) return

          if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && newSession) {
            resolved = true
            setStatus('Success! Redirecting...')
            router.push('/app')
          }
        }
      )

      // Wait for auth to complete
      await new Promise(resolve => setTimeout(resolve, 3000))

      subscription.unsubscribe()

      if (resolved) return

      // Final session check
      const { data: { session: finalSession } } = await supabase.auth.getSession()

      if (finalSession) {
        setStatus('Success! Redirecting...')
        router.push('/app')
      } else {
        console.error('No session after all attempts. URL:', window.location.href)
        setStatus('Authentication failed')
        router.push('/auth/error?error=Could%20not%20establish%20session.%20Please%20try%20signing%20in%20again.')
      }
    }

    handleAuth()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">{status}</p>
      </div>
    </div>
  )
}
