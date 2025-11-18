/**
 * Club API client
 */
import { apiClient, handleApiError } from './client'
import type { Announcement, AnnouncementCreate, AnnouncementUpdate, GallerySettings, GallerySettingsUpdate } from '@/lib/types/club'

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

  // Announcement methods

  /**
   * Get announcements for a club
   */
  getClubAnnouncements: async (clubId: string, params?: {
    is_published?: boolean
    limit?: number
  }): Promise<Announcement[]> => {
    try {
      const response = await apiClient.get<Announcement[]>(`/clubs/${clubId}/announcements`, { params })
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  },

  /**
   * Create an announcement (admin only)
   */
  createAnnouncement: async (clubId: string, data: {
    title: string
    content: string
    is_published?: boolean
  }): Promise<Announcement> => {
    try {
      const response = await apiClient.post<Announcement>(`/clubs/${clubId}/announcements`, data)
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  },

  /**
   * Update an announcement (admin only)
   */
  updateAnnouncement: async (announcementId: string, data: AnnouncementUpdate): Promise<Announcement> => {
    try {
      const response = await apiClient.patch<Announcement>(`/clubs/announcements/${announcementId}`, data)
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  },

  /**
   * Delete an announcement (admin only)
   */
  deleteAnnouncement: async (announcementId: string): Promise<void> => {
    try {
      await apiClient.delete(`/clubs/announcements/${announcementId}`)
    } catch (error) {
      return handleApiError(error)
    }
  },

  // Gallery methods

  /**
   * Get gallery settings for a club
   */
  getClubGallery: async (clubId: string): Promise<GallerySettings | null> => {
    try {
      const response = await apiClient.get<GallerySettings>(`/clubs/${clubId}/gallery`)
      return response.data
    } catch (error: any) {
      // Return null if gallery not configured (404)
      if (error.response?.status === 404) {
        return null
      }
      return handleApiError(error)
    }
  },

  /**
   * Create or update gallery settings (admin only)
   */
  updateGallerySettings: async (clubId: string, data: GallerySettingsUpdate): Promise<GallerySettings> => {
    try {
      const response = await apiClient.post<GallerySettings>(`/clubs/${clubId}/gallery`, data)
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  },

  /**
   * Refresh Instagram gallery cache (admin only)
   */
  refreshGallery: async (clubId: string): Promise<GallerySettings> => {
    try {
      const response = await apiClient.post<GallerySettings>(`/clubs/${clubId}/gallery/refresh`)
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  },
}
