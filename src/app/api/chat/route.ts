import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { hasActiveSubscription } from '@/lib/subscription'
import { getOpenAI, AI_CONFIG, selectModel, MODELS } from '@/lib/openai'
import { SYSTEM_PROMPT } from '@/lib/system-prompt'
import { canSendMessage, incrementMessageCount, FREE_TIER_LIMITS } from '@/lib/usage'
import { NextRequest, NextResponse } from 'next/server'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

// Summarize older conversation history to save tokens
function summarizeHistory(history: ChatMessage[]): string {
  if (history.length === 0) return ''

  const topics = new Set<string>()
  for (const msg of history) {
    const content = msg.content.toLowerCase()
    if (content.includes('drill')) topics.add('drills')
    if (content.includes('formation')) topics.add('formations')
    if (content.includes('training')) topics.add('training')
    if (content.includes('player')) topics.add('player development')
    if (content.includes('tactic')) topics.add('tactics')
    if (content.includes('fitness') || content.includes('conditioning')) topics.add('fitness')
  }

  if (topics.size === 0) return 'Previous conversation covered general coaching topics.'
  return `Previous conversation covered: ${Array.from(topics).join(', ')}.`
}

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check subscription status
    const isSubscribed = await hasActiveSubscription(user.id)

    // Check if user can send message (free tier limits)
    const usageCheck = await canSendMessage(user.id, isSubscribed)

    if (!usageCheck.allowed) {
      return NextResponse.json(
        {
          error: usageCheck.reason,
          remaining: 0,
          limit_reached: true,
        },
        { status: 403 }
      )
    }

    // Parse the request body
    const body = await request.json()
    const { message, history, conversationId } = body as {
      message: string
      history: ChatMessage[]
      conversationId?: string
    }

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Model selection: Free users get mini only, Pro users get smart routing
    let selectedModel: string
    if (isSubscribed) {
      selectedModel = selectModel(message)
    } else {
      selectedModel = FREE_TIER_LIMITS.MODEL // Always mini for free users
    }

    // Build the messages array for OpenAI
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: SYSTEM_PROMPT },
    ]

    // Context compression: Keep last 6 messages verbatim, summarize older ones
    if (history && Array.isArray(history)) {
      const RECENT_LIMIT = 6

      if (history.length > RECENT_LIMIT) {
        const olderHistory = history.slice(0, -RECENT_LIMIT)
        const summary = summarizeHistory(olderHistory)
        if (summary) {
          messages.push({
            role: 'system',
            content: `Context from earlier in conversation: ${summary}`,
          })
        }
      }

      const recentHistory = history.slice(-RECENT_LIMIT)
      for (const msg of recentHistory) {
        messages.push({
          role: msg.role,
          content: msg.content,
        })
      }
    }

    // Add the current user message
    messages.push({ role: 'user', content: message })

    // Call OpenAI API with selected model
    const completion = await getOpenAI().chat.completions.create({
      model: selectedModel,
      messages,
      max_tokens: AI_CONFIG.maxTokens,
      temperature: AI_CONFIG.temperature,
    })

    const assistantMessage = completion.choices[0]?.message?.content

    if (!assistantMessage) {
      return NextResponse.json(
        { error: 'Failed to generate response' },
        { status: 500 }
      )
    }

    // Increment usage count for free users
    let remaining = -1 // -1 means unlimited (Pro)
    if (!isSubscribed) {
      const updatedUsage = await incrementMessageCount(user.id)
      remaining = updatedUsage.remaining_today
    }

    // Save chat history for Pro users
    if (isSubscribed && conversationId) {
      const adminClient = createAdminClient()
      const convId = conversationId || crypto.randomUUID()

      // Save user message
      await adminClient.from('chat_history').insert({
        user_id: user.id,
        conversation_id: convId,
        role: 'user',
        content: message,
        model_used: selectedModel,
      })

      // Save assistant message
      await adminClient.from('chat_history').insert({
        user_id: user.id,
        conversation_id: convId,
        role: 'assistant',
        content: assistantMessage,
        model_used: selectedModel,
      })
    }

    // Log model usage
    console.log(`[Chat] User: ${user.id.slice(0, 8)}, Model: ${selectedModel}, Pro: ${isSubscribed}`)

    return NextResponse.json({
      message: assistantMessage,
      model: selectedModel,
      remaining: remaining,
      is_pro: isSubscribed,
    })
  } catch (error) {
    console.error('Chat API error:', error)

    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again in a moment.' },
          { status: 429 }
        )
      }
      if (error.message.includes('context length')) {
        return NextResponse.json(
          { error: 'Conversation is too long. Please start a new chat.' },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
