import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Configuration for the AI model
export const AI_CONFIG = {
  model: 'gpt-4.1' as const,  // Can be changed to 'gpt-4.1-mini' for cost savings
  maxTokens: 2048,
  temperature: 0.7,
}
