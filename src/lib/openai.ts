import OpenAI from 'openai'

// Lazy-load OpenAI client to avoid build-time errors
let openaiClient: OpenAI | null = null

export function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
  return openaiClient
}

// Configuration for the AI model
export const AI_CONFIG = {
  model: 'gpt-4.1' as const,  // Can be changed to 'gpt-4.1-mini' for cost savings
  maxTokens: 2048,
  temperature: 0.7,
}
