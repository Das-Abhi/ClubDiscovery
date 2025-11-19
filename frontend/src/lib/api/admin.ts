/**
 * Admin API client
 */
import { apiClient, handleApiError } from './client'
import type { Club } from './clubs'

export interface DashboardStats {
  total_users: number
  total_clubs: number
  total_memberships: number
  total_assessments: number
  new_users_30d: number
  active_clubs: number
  featured_clubs: number
  popular_clubs: Array<{
    id: string
    name: string
    slug: string
    category: string
    member_count: number
    view_count: number
  }>
  recent_assessments_count: number
  category_distribution: Record<string, number>
}

export interface AdminUser {
  id: string
  email: string
  full_name: string
  created_at: string
  updated_at: string
  email_verified: boolean
  is_active: boolean
  is_admin: boolean
}

export interface AdminClub extends Club {
  // Club interface already includes all needed fields
  // This type alias makes it explicit this is for admin use
}

export interface Activity {
  type: string
  timestamp: string
  description: string
  user_email?: string
  club_name?: string
  membership_id?: string
}

export const adminApi = {
  /**
   * Get dashboard statistics
   */
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      const response = await apiClient.get<DashboardStats>('/admin/dashboard/stats')
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  },

  /**
   * Get all users
   */
  getUsers: async (skip: number = 0, limit: number = 50): Promise<AdminUser[]> => {
    try {
      const response = await apiClient.get<AdminUser[]>('/admin/users', {
        params: { skip, limit }
      })
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  },

  /**
   * Get user by ID
   */
  getUserById: async (userId: string): Promise<AdminUser> => {
    try {
      const response = await apiClient.get<AdminUser>(`/admin/users/${userId}`)
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  },

  /**
   * Update user admin role
   */
  updateUserRole: async (userId: string, isAdmin: boolean): Promise<AdminUser> => {
    try {
      const response = await apiClient.patch<AdminUser>(
        `/admin/users/${userId}/role`,
        null,
        { params: { is_admin: isAdmin } }
      )
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  },

  /**
   * Update user status (active/inactive)
   */
  updateUserStatus: async (userId: string, isActive: boolean): Promise<AdminUser> => {
    try {
      const response = await apiClient.patch<AdminUser>(
        `/admin/users/${userId}/status`,
        null,
        { params: { is_active: isActive } }
      )
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  },

  /**
   * Get all clubs (including inactive)
   */
  getClubs: async (skip: number = 0, limit: number = 100, includeInactive: boolean = true): Promise<AdminClub[]> => {
    try {
      const response = await apiClient.get<AdminClub[]>('/admin/clubs', {
        params: { skip, limit, include_inactive: includeInactive }
      })
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  },

  /**
   * Toggle club featured status
   */
  toggleClubFeatured: async (clubId: string, isFeatured: boolean): Promise<any> => {
    try {
      const response = await apiClient.patch(
        `/admin/clubs/${clubId}/featured`,
        null,
        { params: { is_featured: isFeatured } }
      )
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  },

  /**
   * Toggle club active status
   */
  toggleClubActive: async (clubId: string, isActive: boolean): Promise<any> => {
    try {
      const response = await apiClient.patch(
        `/admin/clubs/${clubId}/active`,
        null,
        { params: { is_active: isActive } }
      )
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  },

  /**
   * Delete club
   */
  deleteClub: async (clubId: string): Promise<any> => {
    try {
      const response = await apiClient.delete(`/admin/clubs/${clubId}`)
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  },

  /**
   * Get recent activity
   */
  getRecentActivity: async (limit: number = 50): Promise<Activity[]> => {
    try {
      const response = await apiClient.get<Activity[]>('/admin/activity', {
        params: { limit }
      })
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  },

  /**
   * Create a new club
   */
  createClub: async (clubData: Partial<AdminClub>): Promise<AdminClub> => {
    try {
      const response = await apiClient.post<AdminClub>('/clubs/', clubData)
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  },

  /**
   * Update a club
   */
  updateClub: async (clubId: string, clubData: Partial<AdminClub>): Promise<AdminClub> => {
    try {
      const response = await apiClient.patch<AdminClub>(`/clubs/${clubId}`, clubData)
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  },

  /**
   * Get club by ID
   */
  getClubById: async (clubId: string): Promise<AdminClub> => {
    try {
      const response = await apiClient.get<AdminClub>(`/clubs/${clubId}`)
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  },

  // Moderation APIs
  /**
   * Get pending clubs for moderation
   */
  getPendingClubs: async (skip: number = 0, limit: number = 50): Promise<AdminClub[]> => {
    try {
      const response = await apiClient.get<AdminClub[]>('/admin/moderation/pending-clubs', {
        params: { skip, limit }
      })
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  },

  /**
   * Approve a club
   */
  approveClub: async (clubId: string): Promise<any> => {
    try {
      const response = await apiClient.patch(`/admin/moderation/clubs/${clubId}/approve`)
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  },

  /**
   * Reject a club
   */
  rejectClub: async (clubId: string, reason: string): Promise<any> => {
    try {
      const response = await apiClient.patch(
        `/admin/moderation/clubs/${clubId}/reject`,
        null,
        { params: { reason } }
      )
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  },

  /**
   * Request revision for a club
   */
  requestRevision: async (clubId: string, feedback: string): Promise<any> => {
    try {
      const response = await apiClient.patch(
        `/admin/moderation/clubs/${clubId}/request-revision`,
        null,
        { params: { feedback } }
      )
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  },

  /**
   * Get moderation statistics
   */
  getModerationStats: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/admin/moderation/stats')
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  }
}
