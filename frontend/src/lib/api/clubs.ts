/**
 * Club API client
 */
import { apiClient, handleApiError } from './client'

export interface Club {
  id: string
  name: string
  slug: string
  category: 'cocurricular' | 'extracurricular' | 'department'
  tagline?: string
  description?: string
  overview?: string
  logo_url?: string
  cover_image_url?: string
  instagram?: string
  linkedin?: string
  twitter?: string
  website?: string
  faculty_name?: string
  faculty_email?: string
  faculty_phone?: string
  member_count: number
  view_count: number
  created_at: string
  updated_at: string
  is_active: boolean
  is_featured: boolean
}

export interface ClubListResponse {
  clubs: Club[]
  total: number
  page: number
  per_page: number
  pages: number
}

export interface Membership {
  id: string
  user_id: string
  club_id: string
  role: string
  status: string
  joined_at: string
  updated_at: string
  club?: Club
}

export const clubsApi = {
  /**
   * Get all clubs with optional filters
   */
  getClubs: async (params?: {
    category?: string
    search?: string
    page?: number
    per_page?: number
  }): Promise<ClubListResponse> => {
    try {
      const response = await apiClient.get<ClubListResponse>('/clubs/', { params })
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  },

  /**
   * Get featured clubs
   */
  getFeaturedClubs: async (limit: number = 10): Promise<Club[]> => {
    try {
      const response = await apiClient.get<Club[]>('/clubs/featured', {
        params: { limit }
      })
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  },

  /**
   * Get popular clubs
   */
  getPopularClubs: async (limit: number = 10): Promise<Club[]> => {
    try {
      const response = await apiClient.get<Club[]>('/clubs/popular', {
        params: { limit }
      })
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  },

  /**
   * Get club by slug
   */
  getClub: async (slug: string): Promise<Club> => {
    try {
      const response = await apiClient.get<Club>(`/clubs/${slug}`)
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  },

  /**
   * Join a club
   */
  joinClub: async (clubId: string): Promise<Membership> => {
    try {
      const response = await apiClient.post<Membership>(`/clubs/${clubId}/join`)
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  },

  /**
   * Leave a club
   */
  leaveClub: async (clubId: string): Promise<void> => {
    try {
      await apiClient.delete(`/clubs/${clubId}/leave`)
    } catch (error) {
      return handleApiError(error)
    }
  },

  /**
   * Get current user's memberships
   */
  getUserMemberships: async (): Promise<Membership[]> => {
    try {
      const response = await apiClient.get<Membership[]>('/users/me/memberships')
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  },
}
