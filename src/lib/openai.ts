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

// Model options
export const MODELS = {
  FAST: 'gpt-4o-mini' as const,    // For simple queries - 16x cheaper
  POWERFUL: 'gpt-4o' as const,      // For complex tactical analysis
}

// Configuration for the AI model
export const AI_CONFIG = {
  defaultModel: MODELS.FAST,
  maxTokens: 2048,
  temperature: 0.7,
}

// Keywords that indicate a complex query requiring the powerful model
const COMPLEX_QUERY_PATTERNS = [
  // Tactical analysis
  /\b(formation|formations)\b/i,
  /\b(tactic|tactics|tactical)\b/i,
  /\b(transition|transitions|pressing|gegenpressing)\b/i,
  /\b(system|systems)\s+(of\s+play)?\b/i,
  /\b(phase|phases)\s+of\s+(play|attack|defence)\b/i,
  /\b(build[- ]?up|build[- ]?out)\b/i,
  /\b(high\s+line|low\s+block|mid\s+block)\b/i,
  /\b(overload|underload|numerical\s+advantage)\b/i,

  // Match analysis
  /\b(match\s+analysis|game\s+analysis|analyse\s+(the\s+)?(match|game))\b/i,
  /\b(opponent|opposition)\s+(analysis|scout)/i,
  /\b(strengths?\s+and\s+weaknesses?)\b/i,

  // Complex strategic questions
  /\b(compare|comparison|versus|vs\.?)\s+.*(formation|system|style)/i,
  /\b(adapt|adapting|adjust|adjusting)\s+.*(tactic|formation|system)/i,
  /\b(counter|countering)\s+.*(formation|system|style|tactic)/i,
  /\bwhy\s+(do|does|would|should)\b.*\b(work|fail|struggle)\b/i,

  // Specific formations
  /\b[34][--][0-9][--][0-9][--]?[0-9]?\b/,  // e.g., 4-3-3, 3-5-2, 4-2-3-1

  // Season/programme planning
  /\b(periodisation|periodization|season\s+plan|annual\s+plan)\b/i,
  /\b(mesocycle|microcycle|macrocycle)\b/i,
]

/**
 * Determines which model to use based on query complexity
 * Returns the powerful model for complex tactical/analytical queries
 * Returns the fast model for simple questions, drills, etc.
 */
export function selectModel(query: string): typeof MODELS.FAST | typeof MODELS.POWERFUL {
  // Check if query matches any complex patterns
  for (const pattern of COMPLEX_QUERY_PATTERNS) {
    if (pattern.test(query)) {
      return MODELS.POWERFUL
    }
  }

  // Check query length - very long, detailed questions may need more power
  if (query.length > 500) {
    return MODELS.POWERFUL
  }

  // Default to fast model for simple queries
  return MODELS.FAST
}
