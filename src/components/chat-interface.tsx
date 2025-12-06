'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Conversation {
  id: string
  title: string
  lastActivity: string
}

interface ChatInterfaceProps {
  isPro: boolean
  remainingMessages: number // -1 means unlimited (Pro)
  dailyLimit: number
}

export function ChatInterface({ isPro, remainingMessages: initialRemaining, dailyLimit }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [remaining, setRemaining] = useState(initialRemaining)
  const [limitReached, setLimitReached] = useState(initialRemaining === 0)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Fetch conversation history for Pro users
  useEffect(() => {
    if (isPro) {
      fetch('/api/conversations')
        .then(res => res.json())
        .then(data => {
          if (data.conversations) {
            setConversations(data.conversations)
          }
        })
        .catch(console.error)
    }
  }, [isPro])

  const startNewConversation = () => {
    setMessages([])
    setConversationId(crypto.randomUUID())
    setShowHistory(false)
    setError(null)
  }

  const loadConversation = async (convId: string) => {
    try {
      const res = await fetch(`/api/conversations/${convId}`)
      const data = await res.json()
      if (data.messages) {
        setMessages(data.messages)
        setConversationId(convId)
        setShowHistory(false)
        setError(null)
      }
    } catch (err) {
      console.error('Failed to load conversation:', err)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setError(null)

    // Generate conversation ID if not exists
    const currentConvId = conversationId || crypto.randomUUID()
    if (!conversationId) {
      setConversationId(currentConvId)
    }

    // Add user message to the chat
    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          history: messages,
          conversationId: isPro ? currentConvId : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Check if limit was reached
        if (data.limit_reached) {
          setLimitReached(true)
          setRemaining(0)
        }
        throw new Error(data.error || 'Failed to get response')
      }

      // Update remaining count for free users
      if (data.remaining !== undefined && data.remaining >= 0) {
        setRemaining(data.remaining)
        if (data.remaining === 0) {
          setLimitReached(true)
        }
      }

      // Add assistant message to the chat
      setMessages([...newMessages, { role: 'assistant', content: data.message }])

      // Refresh conversations list for Pro users
      if (isPro && messages.length === 0) {
        fetch('/api/conversations')
          .then(res => res.json())
          .then(data => {
            if (data.conversations) {
              setConversations(data.conversations)
            }
          })
          .catch(console.error)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full bg-gray-50">
      {/* Sidebar for Pro users */}
      {isPro && (
        <div className={`${showHistory ? 'w-64' : 'w-0'} md:w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col transition-all overflow-hidden`}>
          <div className="p-3 border-b border-gray-200">
            <button
              onClick={startNewConversation}
              className="w-full px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
            >
              + New Chat
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="p-2 text-xs font-medium text-gray-500 uppercase">Recent</div>
            {conversations.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-400">No conversations yet</div>
            ) : (
              conversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => loadConversation(conv.id)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 truncate ${
                    conversationId === conv.id ? 'bg-gray-100 font-medium' : 'text-gray-700'
                  }`}
                >
                  {conv.title}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile toggle for history (Pro only) */}
        {isPro && (
          <div className="md:hidden flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-gray-600 hover:text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={startNewConversation}
              className="text-green-600 hover:text-green-700 font-medium text-sm"
            >
              + New
            </button>
          </div>
        )}

        {/* Free tier usage banner */}
        {!isPro && (
          <div className={`px-4 py-2 text-sm text-center ${
            limitReached
              ? 'bg-amber-100 text-amber-800'
              : remaining <= 2
                ? 'bg-amber-50 text-amber-700'
                : 'bg-gray-100 text-gray-600'
          }`}>
            {limitReached ? (
              <span>
                You&apos;ve used all {dailyLimit} free messages today.{' '}
                <Link href="/app/billing" className="font-semibold underline hover:text-amber-900">
                  Upgrade to Pro
                </Link>{' '}
                for unlimited access.
              </span>
            ) : (
              <span>
                {remaining} of {dailyLimit} free messages remaining today.{' '}
                <Link href="/app/billing" className="font-medium underline hover:text-gray-800">
                  Upgrade to Pro
                </Link>{' '}
                for unlimited messages.
              </span>
            )}
          </div>
        )}

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-8">
              <h2 className="text-xl font-semibold mb-2">Welcome to FootballGPT</h2>
              <p className="text-sm">Ask me anything about football coaching, tactics, or player development.</p>
              {!isPro && (
                <p className="text-xs mt-2 text-gray-400">
                  Free plan: {dailyLimit} messages/day with our fast AI model
                </p>
              )}
              {isPro && (
                <p className="text-xs mt-2 text-gray-400">
                  Pro plan: Unlimited messages with smart AI routing
                </p>
              )}
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] md:max-w-[70%] rounded-lg px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-green-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-900'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex justify-center">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="border-t border-gray-200 bg-white p-4">
          {limitReached ? (
            <div className="text-center py-2">
              <p className="text-gray-600 mb-3">Ready for unlimited coaching advice?</p>
              <Link
                href="/app/billing"
                className="inline-block px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Upgrade to Pro - $14.99/month
              </Link>
            </div>
          ) : (
            <form onSubmit={sendMessage} className="flex space-x-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
