-- Add usage tracking for free tier
-- Run this in Supabase SQL Editor

-- Create usage_tracking table
CREATE TABLE IF NOT EXISTS public.usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  daily_message_count INTEGER DEFAULT 0,
  last_message_date DATE DEFAULT CURRENT_DATE,
  total_messages INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own usage
CREATE POLICY "Users can view own usage" ON public.usage_tracking
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Service role can do everything
CREATE POLICY "Service role full access" ON public.usage_tracking
  FOR ALL USING (auth.role() = 'service_role');

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON public.usage_tracking(user_id);

-- Create chat_history table for persistence
CREATE TABLE IF NOT EXISTS public.chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID DEFAULT gen_random_uuid(),
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  model_used TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own chat history
CREATE POLICY "Users can view own chats" ON public.chat_history
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own chats
CREATE POLICY "Users can insert own chats" ON public.chat_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own chats
CREATE POLICY "Users can delete own chats" ON public.chat_history
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON public.chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_conversation ON public.chat_history(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_created ON public.chat_history(created_at DESC);
