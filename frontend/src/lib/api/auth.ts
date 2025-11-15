/**
 * Authentication API client
 */
import { apiClient, handleApiError } from './client'
import type { LoginRequest, RegisterRequest, AuthResponse } from '@/lib/types/auth'
import type { User } from '@/lib/types/user'

export const authApi = {
  /**
   * Register a new user
   */
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', {
        email: data.email,
        password: data.password,
        full_name: data.full_name,
      })
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  },

  /**
   * Login with email and password
   */
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials)
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  },

  /**
   * Refresh access token
   */
  refreshToken: async (refreshToken: string): Promise<{ access_token: string; refresh_token: string; token_type: string }> => {
    try {
      const response = await apiClient.post('/auth/refresh', {
        refresh_token: refreshToken,
      })
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  },

  /**
   * Get current user profile
   */
  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await apiClient.get<User>('/auth/me')
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  },

  /**
   * Logout (clear local storage)
   */
  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
  },
}
