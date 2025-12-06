import { createClient } from '@/lib/supabase/server'
import { getSubscription } from '@/lib/subscription'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const subscription = await getSubscription(user.id)
  const isSubscribed = subscription?.status === 'active' || subscription?.status === 'trialing'

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-2 text-gray-600">Welcome to FootballGPT</p>

      <div className="mt-8 grid md:grid-cols-2 gap-6 max-w-2xl">
        {/* Chat Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Chat with FootballGPT</h2>
          <p className="mt-2 text-gray-600 text-sm">
            Get coaching advice, training plans, and tactical insights.
          </p>
          <Link
            href="/app/chat"
            className="mt-4 inline-block px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Start chatting
          </Link>
          {!isSubscribed && (
            <p className="mt-2 text-xs text-gray-500">
              Free plan: 5 messages per day
            </p>
          )}
        </div>

        {/* Subscription Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Subscription</h2>
          <p className="mt-2 text-gray-600 text-sm">
            {isSubscribed
              ? `Your subscription is ${subscription?.status}. Enjoy full access to FootballGPT.`
              : 'You are on the free plan. Upgrade to unlock all features.'}
          </p>
          <Link
            href="/app/billing"
            className="mt-4 inline-block px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Manage billing
          </Link>
        </div>
      </div>
    </div>
  )
}
