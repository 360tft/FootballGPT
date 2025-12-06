import { createClient } from '@/lib/supabase/server'
import { getSubscription } from '@/lib/subscription'
import { getUserUsage, FREE_TIER_LIMITS } from '@/lib/usage'
import { BillingActions } from '@/components/billing-actions'
import { BillingNotification } from '@/components/billing-notification'

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const subscription = await getSubscription(user.id)
  const isSubscribed = subscription?.status === 'active' || subscription?.status === 'trialing'

  // Get usage data for free users
  const usage = isSubscribed ? null : await getUserUsage(user.id)

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
      <p className="mt-2 text-gray-600">Manage your subscription</p>

      {/* Success/Error messages from Stripe */}
      <BillingNotification />

      <div className="mt-8 max-w-3xl">
        {/* Current Plan Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {isSubscribed ? 'Pro Plan' : 'Free Plan'}
              </h2>
              {isSubscribed ? (
                <div className="mt-1 flex items-center space-x-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
                    {subscription?.status}
                  </span>
                  {subscription?.current_period_end && (
                    <span className="text-sm text-gray-500">
                      Renews {new Date(subscription.current_period_end).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  )}
                </div>
              ) : (
                <p className="mt-1 text-sm text-gray-500">
                  {usage?.remaining_today} of {FREE_TIER_LIMITS.DAILY_MESSAGES} messages remaining today
                </p>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {isSubscribed ? '$14.99' : '$0'}
              </div>
              <div className="text-sm text-gray-500">/month</div>
            </div>
          </div>
          <div className="mt-4">
            <BillingActions hasSubscription={isSubscribed} />
          </div>
        </div>

        {/* Plan Comparison */}
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Compare Plans</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Free Plan */}
          <div className={`p-6 rounded-lg border-2 ${!isSubscribed ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'}`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">Free</h4>
              {!isSubscribed && (
                <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">Current</span>
              )}
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-4">$0<span className="text-sm font-normal text-gray-500">/month</span></div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center text-gray-600">
                <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                5 messages per day
              </li>
              <li className="flex items-center text-gray-600">
                <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Fast AI model
              </li>
              <li className="flex items-center text-gray-600">
                <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Evidence-based advice
              </li>
              <li className="flex items-center text-gray-400">
                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                No chat history
              </li>
              <li className="flex items-center text-gray-400">
                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                No advanced AI
              </li>
            </ul>
          </div>

          {/* Pro Plan */}
          <div className={`p-6 rounded-lg border-2 ${isSubscribed ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'}`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">Pro</h4>
              {isSubscribed && (
                <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">Current</span>
              )}
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-4">$14.99<span className="text-sm font-normal text-gray-500">/month</span></div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center text-gray-600">
                <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <strong>Unlimited</strong>&nbsp;messages
              </li>
              <li className="flex items-center text-gray-600">
                <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Smart AI routing (fast + powerful)
              </li>
              <li className="flex items-center text-gray-600">
                <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Evidence-based advice
              </li>
              <li className="flex items-center text-gray-600">
                <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Chat history saved
              </li>
              <li className="flex items-center text-gray-600">
                <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Priority support
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
