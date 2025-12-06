'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState('Processing authentication...')

  useEffect(() => {
    const handleAuth = async () => {
      // Check for error in URL params first
      const params = new URLSearchParams(window.location.search)
      const error = params.get('error')
      const errorDescription = params.get('error_description')

      if (error) {
        setStatus('Authentication failed')
        router.push(`/auth/error?error=${encodeURIComponent(errorDescription || error)}`)
        return
      }

      // Check if we have tokens in the hash fragment (implicit flow)
      const hash = window.location.hash
      const hasTokens = hash.includes('access_token') || hash.includes('refresh_token')

      console.log('Auth callback - hash present:', !!hash, 'has tokens:', hasTokens)

      const supabase = createClient()

      // If we have tokens in hash, Supabase should automatically parse them
      // Give it a moment to process
      if (hasTokens) {
        setStatus('Verifying credentials...')
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      // Check for session immediately
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      console.log('Initial session check:', !!session, sessionError?.message)

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

      // No session yet - set up listener and wait
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

      // Final timeout check
      await new Promise(resolve => setTimeout(resolve, 3000))

      if (resolved) {
        subscription.unsubscribe()
        return
      }

      // One more session check
      const { data: { session: finalSession } } = await supabase.auth.getSession()
      subscription.unsubscribe()

      if (finalSession) {
        setStatus('Success! Redirecting...')
        router.push('/app')
      } else {
        console.error('No session after all attempts')
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
