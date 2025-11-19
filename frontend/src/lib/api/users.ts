/**
 * Users API client
 */
import { apiClient, handleApiError } from './client'
import type { User } from '@/lib/types/user'

export interface UserUpdateData {
  full_name?: string
  email?: string
}

export const usersApi = {
  /**
   * Update current user profile
   */
  updateProfile: async (data: UserUpdateData): Promise<User> => {
    try {
      const response = await apiClient.patch<User>('/users/me', data)
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  },
}
