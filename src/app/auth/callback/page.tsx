'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState('Processing authentication...')

  useEffect(() => {
    const supabase = createClient()

    // Check for error in URL params first
    const params = new URLSearchParams(window.location.search)
    const error = params.get('error')
    const errorDescription = params.get('error_description')

    if (error) {
      setStatus('Authentication failed')
      router.push(`/auth/error?error=${encodeURIComponent(errorDescription || error)}`)
      return
    }

    // Listen for auth state changes - Supabase will automatically
    // handle the hash fragment with implicit flow
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, !!session)

        if (event === 'SIGNED_IN' && session) {
          setStatus('Success! Redirecting...')
          router.push('/app')
        } else if (event === 'TOKEN_REFRESHED' && session) {
          setStatus('Success! Redirecting...')
          router.push('/app')
        } else if (event === 'SIGNED_OUT') {
          setStatus('Session expired')
          router.push('/auth/login')
        }
      }
    )

    // Also check for existing session after a short delay
    // (in case the auth state change already fired)
    const checkSession = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))

      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

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

      // If no session after checking, show error
      // Wait a bit more in case auth is still processing
      await new Promise(resolve => setTimeout(resolve, 2000))

      const { data: { session: retrySession } } = await supabase.auth.getSession()
      if (retrySession) {
        setStatus('Success! Redirecting...')
        router.push('/app')
      } else {
        setStatus('Authentication failed')
        router.push('/auth/error?error=Could%20not%20establish%20session')
      }
    }

    checkSession()

    return () => {
      subscription.unsubscribe()
    }
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
