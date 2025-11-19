/**
 * Favorites API client
 */
import { apiClient, handleApiError } from './client'
import type { Club } from '@/lib/types/club'

export interface Favorite {
  id: string
  user_id: string
  club_id: string
  created_at: string
  club?: Club
}

export interface FavoriteCreate {
  club_id: string
}

/**
 * Get user's favorite clubs
 */
export const getFavorites = async (): Promise<Favorite[]> => {
  try {
    const response = await apiClient.get<Favorite[]>('/favorites')
    return response.data
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * Add a club to favorites
 */
export const addFavorite = async (clubId: string): Promise<Favorite> => {
  try {
    const response = await apiClient.post<Favorite>('/favorites', {
      club_id: clubId,
    })
    return response.data
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * Remove a club from favorites
 */
export const removeFavorite = async (clubId: string): Promise<void> => {
  try {
    await apiClient.delete(`/favorites/${clubId}`)
  } catch (error) {
    handleApiError(error)
  }
}

/**
 * Check if a club is favorited
 */
export const checkFavorite = async (clubId: string): Promise<boolean> => {
  try {
    const response = await apiClient.get<{ is_favorited: boolean }>(`/favorites/check/${clubId}`)
    return response.data.is_favorited
  } catch (error) {
    // If user is not authenticated, return false
    if ((error as any)?.response?.status === 401) {
      return false
    }
    return handleApiError(error)
  }
}
