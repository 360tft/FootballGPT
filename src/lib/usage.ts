import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Free tier limits
export const FREE_TIER_LIMITS = {
  DAILY_MESSAGES: 5,
  MODEL: 'gpt-4o-mini' as const,
}

export interface UsageData {
  daily_message_count: number
  last_message_date: string
  total_messages: number
  remaining_today: number
  is_limit_reached: boolean
}

/**
 * Get usage data for a user
 */
export async function getUserUsage(userId: string): Promise<UsageData> {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('usage_tracking')
    .select('daily_message_count, last_message_date, total_messages')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    // No usage record yet - user has full daily limit
    return {
      daily_message_count: 0,
      last_message_date: today,
      total_messages: 0,
      remaining_today: FREE_TIER_LIMITS.DAILY_MESSAGES,
      is_limit_reached: false,
    }
  }

  // Check if it's a new day - reset count
  const isNewDay = data.last_message_date !== today
  const dailyCount = isNewDay ? 0 : data.daily_message_count
  const remaining = FREE_TIER_LIMITS.DAILY_MESSAGES - dailyCount

  return {
    daily_message_count: dailyCount,
    last_message_date: data.last_message_date,
    total_messages: data.total_messages,
    remaining_today: Math.max(0, remaining),
    is_limit_reached: remaining <= 0,
  }
}

/**
 * Increment message count for a user
 * Returns the updated usage data
 */
export async function incrementMessageCount(userId: string): Promise<UsageData> {
  const adminClient = createAdminClient()
  const today = new Date().toISOString().split('T')[0]

  // First, get current usage
  const { data: existing } = await adminClient
    .from('usage_tracking')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!existing) {
    // Create new record
    const { data: newRecord } = await adminClient
      .from('usage_tracking')
      .insert({
        user_id: userId,
        daily_message_count: 1,
        last_message_date: today,
        total_messages: 1,
      })
      .select()
      .single()

    return {
      daily_message_count: 1,
      last_message_date: today,
      total_messages: 1,
      remaining_today: FREE_TIER_LIMITS.DAILY_MESSAGES - 1,
      is_limit_reached: false,
    }
  }

  // Check if new day
  const isNewDay = existing.last_message_date !== today
  const newDailyCount = isNewDay ? 1 : existing.daily_message_count + 1
  const newTotalCount = existing.total_messages + 1

  // Update record
  await adminClient
    .from('usage_tracking')
    .update({
      daily_message_count: newDailyCount,
      last_message_date: today,
      total_messages: newTotalCount,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)

  const remaining = FREE_TIER_LIMITS.DAILY_MESSAGES - newDailyCount

  return {
    daily_message_count: newDailyCount,
    last_message_date: today,
    total_messages: newTotalCount,
    remaining_today: Math.max(0, remaining),
    is_limit_reached: remaining <= 0,
  }
}

/**
 * Check if user can send a message (hasn't exceeded daily limit)
 */
export async function canSendMessage(userId: string, hasSubscription: boolean): Promise<{
  allowed: boolean
  remaining: number
  reason?: string
}> {
  // Pro users always allowed
  if (hasSubscription) {
    return { allowed: true, remaining: -1 } // -1 = unlimited
  }

  const usage = await getUserUsage(userId)

  if (usage.is_limit_reached) {
    return {
      allowed: false,
      remaining: 0,
      reason: `You've used all ${FREE_TIER_LIMITS.DAILY_MESSAGES} free messages today. Upgrade to Pro for unlimited access.`,
    }
  }

  return {
    allowed: true,
    remaining: usage.remaining_today,
  }
}
