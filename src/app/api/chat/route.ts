import { createClient } from '@/lib/supabase/server'
import { hasActiveSubscription } from '@/lib/subscription'
import { getOpenAI, AI_CONFIG, selectModel, MODELS } from '@/lib/openai'
import { SYSTEM_PROMPT } from '@/lib/system-prompt'
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
    // Extract key topics from messages
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

    if (!isSubscribed) {
      return NextResponse.json(
        { error: 'Active subscription required to use chat' },
        { status: 403 }
      )
    }

    // Parse the request body
    const body = await request.json()
    const { message, history } = body as {
      message: string
      history: ChatMessage[]
    }

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Smart model selection based on query complexity
    const selectedModel = selectModel(message)

    // Build the messages array for OpenAI
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: SYSTEM_PROMPT },
    ]

    // Context compression: Keep last 6 messages verbatim, summarize older ones
    if (history && Array.isArray(history)) {
      const RECENT_LIMIT = 6

      if (history.length > RECENT_LIMIT) {
        // Summarize older messages
        const olderHistory = history.slice(0, -RECENT_LIMIT)
        const summary = summarizeHistory(olderHistory)
        if (summary) {
          messages.push({
            role: 'system',
            content: `Context from earlier in conversation: ${summary}`,
          })
        }
      }

      // Add recent messages verbatim
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

    // Log model usage for monitoring (optional - can be removed in production)
    console.log(`[Chat] Model: ${selectedModel}, Query length: ${message.length}`)

    return NextResponse.json({
      message: assistantMessage,
      model: selectedModel, // Include model info for transparency (optional)
    })
  } catch (error) {
    console.error('Chat API error:', error)

    // Handle specific OpenAI errors
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
