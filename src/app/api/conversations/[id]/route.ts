import { createClient } from '@/lib/supabase/server'
import { hasActiveSubscription } from '@/lib/subscription'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only Pro users have chat history
    const isSubscribed = await hasActiveSubscription(user.id)
    if (!isSubscribed) {
      return NextResponse.json({ error: 'Pro subscription required' }, { status: 403 })
    }

    // Get messages for this conversation
    const { data: messages, error } = await supabase
      .from('chat_history')
      .select('role, content, created_at')
      .eq('user_id', user.id)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching conversation:', error)
      return NextResponse.json({ error: 'Failed to fetch conversation' }, { status: 500 })
    }

    return NextResponse.json({
      messages: messages?.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })) || [],
    })
  } catch (error) {
    console.error('Conversation API error:', error)
    return NextResponse.json({ error: 'Failed to fetch conversation' }, { status: 500 })
  }
}
