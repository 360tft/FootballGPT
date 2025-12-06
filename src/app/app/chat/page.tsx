import { createClient } from '@/lib/supabase/server'
import { hasActiveSubscription } from '@/lib/subscription'
import { getUserUsage, FREE_TIER_LIMITS } from '@/lib/usage'
import { redirect } from 'next/navigation'
import { ChatInterface } from '@/components/chat-interface'

export default async function ChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const isSubscribed = await hasActiveSubscription(user.id)

  // Get usage data for free users
  const usage = isSubscribed ? null : await getUserUsage(user.id)

  return (
    <div className="h-[calc(100vh-73px)] flex flex-col">
      <ChatInterface
        isPro={isSubscribed}
        remainingMessages={usage?.remaining_today ?? -1}
        dailyLimit={FREE_TIER_LIMITS.DAILY_MESSAGES}
      />
    </div>
  )
}
