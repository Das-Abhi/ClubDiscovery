export interface AssessmentResponses {
  enjoy: string
  time: string
  domain: string
  impact: string
  past: string
}

export interface ReasoningItem {
  question: string
  answer: string
  contribution: number
}

export interface ClubRecommendation {
  club: {
    id: string
    name: string
    slug: string
    tagline?: string
    logo_url?: string
  }
  score: number
  rank: number
  reasoning: ReasoningItem[]
}

export interface AssessmentResult {
  assessment_id: string
  recommendations: ClubRecommendation[]
}

export interface Assessment {
  id: string
  user_id?: string
  responses: AssessmentResponses
  created_at: string
}
