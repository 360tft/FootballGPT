import { createClient } from '@/lib/supabase/server'
import { hasActiveSubscription } from '@/lib/subscription'
import { redirect } from 'next/navigation'
import { ChatInterface } from '@/components/chat-interface'

export default async function ChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const isSubscribed = await hasActiveSubscription(user.id)

  if (!isSubscribed) {
    redirect('/app/billing')
  }

  return (
    <div className="h-[calc(100vh-73px)] flex flex-col">
      <ChatInterface />
    </div>
  )
}
