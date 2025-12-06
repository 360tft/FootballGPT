'use client'

import { useSearchParams } from 'next/navigation'

export function BillingNotification() {
  const searchParams = useSearchParams()
  const success = searchParams.get('success')
  const canceled = searchParams.get('canceled')

  if (success === 'true') {
    return (
      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <div>
            <p className="font-medium text-green-800">Welcome to Pro!</p>
            <p className="text-sm text-green-700">Your subscription is now active. Enjoy unlimited access to FootballGPT.</p>
          </div>
        </div>
      </div>
    )
  }

  if (canceled === 'true') {
    return (
      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-amber-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="font-medium text-amber-800">Payment Canceled</p>
            <p className="text-sm text-amber-700">No worries! You can upgrade whenever you&apos;re ready.</p>
          </div>
        </div>
      </div>
    )
  }

  return null
}
