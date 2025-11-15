/**
 * Assessment API client
 */
import { apiClient, handleApiError } from './client'
import type {
  AssessmentResponses,
  AssessmentResult,
  Assessment,
} from '@/lib/types/assessment'

export const assessmentApi = {
  /**
   * Submit assessment and get recommendations
   */
  submitAssessment: async (
    responses: AssessmentResponses,
    userId?: string
  ): Promise<AssessmentResult> => {
    try {
      const response = await apiClient.post<AssessmentResult>('/assessments/', {
        responses,
        user_id: userId,
      })
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  },

  /**
   * Get assessment by ID
   */
  getAssessment: async (assessmentId: string): Promise<AssessmentResult> => {
    try {
      const response = await apiClient.get<AssessmentResult>(
        `/assessments/${assessmentId}`
      )
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  },

  /**
   * Get user's assessment history
   */
  getUserAssessments: async (userId: string): Promise<Assessment[]> => {
    try {
      const response = await apiClient.get<Assessment[]>(
        `/assessments/user/${userId}`
      )
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  },
}
