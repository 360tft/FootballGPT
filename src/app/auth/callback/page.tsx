'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState('Processing authentication...')

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient()

      // Get the hash from the URL (contains tokens for email confirmation)
      const hash = window.location.hash

      // Check for access_token in hash (email confirmation flow)
      if (hash && hash.includes('access_token')) {
        // Supabase client will automatically handle the hash
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Session error:', error)
          setStatus('Authentication failed')
          router.push(`/auth/error?error=${encodeURIComponent(error.message)}`)
          return
        }

        if (session) {
          setStatus('Success! Redirecting...')
          router.push('/app')
          return
        }
      }

      // Check URL search params for code (PKCE flow)
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      const error = params.get('error')
      const errorDescription = params.get('error_description')

      if (error) {
        setStatus('Authentication failed')
        router.push(`/auth/error?error=${encodeURIComponent(errorDescription || error)}`)
        return
      }

      if (code) {
        // Code exchange is handled by the route.ts - redirect there
        // This page shouldn't normally hit this case as route.ts handles GET with code
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        if (exchangeError) {
          console.error('Exchange error:', exchangeError)
          setStatus('Authentication failed')
          router.push(`/auth/error?error=${encodeURIComponent(exchangeError.message)}`)
          return
        }
        setStatus('Success! Redirecting...')
        router.push('/app')
        return
      }

      // Try to get existing session
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setStatus('Success! Redirecting...')
        router.push('/app')
        return
      }

      // No valid auth data found
      setStatus('No authentication data found')
      router.push('/auth/error?error=No%20authentication%20data%20found')
    }

    handleCallback()
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
