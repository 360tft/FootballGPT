import { createClient } from '@/lib/supabase/server'
import { hasActiveSubscription } from '@/lib/subscription'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only Pro users have chat history
    const isSubscribed = await hasActiveSubscription(user.id)
    if (!isSubscribed) {
      return NextResponse.json({ conversations: [] })
    }

    // Get unique conversations with their first message for title
    const { data: conversations, error } = await supabase
      .from('chat_history')
      .select('conversation_id, content, role, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching conversations:', error)
      return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
    }

    // Group by conversation and get first user message as title
    const conversationMap = new Map<string, { id: string; title: string; lastActivity: string }>()

    for (const msg of conversations || []) {
      if (!conversationMap.has(msg.conversation_id)) {
        const title = msg.role === 'user'
          ? msg.content.slice(0, 50) + (msg.content.length > 50 ? '...' : '')
          : 'New conversation'

        conversationMap.set(msg.conversation_id, {
          id: msg.conversation_id,
          title,
          lastActivity: msg.created_at,
        })
      }
    }

    return NextResponse.json({
      conversations: Array.from(conversationMap.values()).slice(0, 20),
    })
  } catch (error) {
    console.error('Conversations API error:', error)
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
  }
}
