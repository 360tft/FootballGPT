import { createClient } from '@/lib/supabase/server'

export type SubscriptionStatus = 'active' | 'trialing' | 'cancelled' | 'past_due' | 'unpaid' | 'incomplete' | null

export interface Subscription {
  id: string
  user_id: string
  stripe_customer_id: string
  stripe_subscription_id: string
  status: SubscriptionStatus
  current_period_end: string
  created_at: string
  updated_at: string
}

// Check if a user has an active subscription
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('subscriptions')
    .select('status, current_period_end')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    return false
  }

  // Check if subscription is active and not expired
  const isActive = data.status === 'active' || data.status === 'trialing'
  const notExpired = new Date(data.current_period_end) > new Date()

  return isActive && notExpired
}

// Get the full subscription record for a user
export async function getSubscription(userId: string): Promise<Subscription | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    return null
  }

  return data as Subscription
}
