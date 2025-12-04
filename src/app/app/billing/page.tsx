import { createClient } from '@/lib/supabase/server'
import { getSubscription } from '@/lib/subscription'
import { BillingActions } from '@/components/billing-actions'

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const subscription = await getSubscription(user.id)
  const isSubscribed = subscription?.status === 'active' || subscription?.status === 'trialing'

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
      <p className="mt-2 text-gray-600">Manage your subscription</p>

      <div className="mt-8 max-w-xl">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {isSubscribed ? 'Pro Plan' : 'Free Plan'}
          </h2>

          {isSubscribed ? (
            <div className="mt-4">
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
                  {subscription?.status}
                </span>
              </div>
              {subscription?.current_period_end && (
                <p className="mt-2 text-sm text-gray-600">
                  Current period ends:{' '}
                  {new Date(subscription.current_period_end).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              )}
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-4">
                  You have full access to FootballGPT including unlimited chat messages.
                </p>
                <BillingActions hasSubscription={true} />
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <p className="text-gray-600">
                Upgrade to Pro to get unlimited access to FootballGPT.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Unlimited chat messages
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Access to all coaching personas
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Evidence-based guidance
                </li>
              </ul>
              <div className="mt-6">
                <BillingActions hasSubscription={false} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
