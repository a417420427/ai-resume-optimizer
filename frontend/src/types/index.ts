// User types
export interface UserInfo {
  id: number
  username: string
  nickname: string | null
  email: string | null
  avatar_url: string | null
  is_vip: boolean
  optimize_count: number
  created_at: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
}

export interface RegisterRequest {
  username: string
  password: string
  email?: string
}

// Resume types
export interface OptimizationResult {
  optimization_id: number
  resume_id: number
  score: number
  summary: string
  optimized_text: string
  suggestions: Suggestion[]
  keyword_matches: KeywordAnalysis
  ats_feedback: string
  optimize_count: number
  free_tier_limit: number
}

export interface Suggestion {
  type: 'content' | 'format' | 'keyword' | 'ats'
  severity: 'high' | 'medium' | 'low'
  title: string
  description: string
  suggestion: string
}

export interface KeywordAnalysis {
  matched_keywords: string[]
  missing_keywords: string[]
  keyword_density: number
  suggestions: string[]
}

export interface ResumeHistoryItem {
  id: number
  original_filename: string
  file_type: string
  optimization_id: number | null
  created_at: string
}
