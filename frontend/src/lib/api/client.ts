/**
 * Base API client configuration
 */
import axios, { AxiosInstance, AxiosError } from 'axios'
import { env } from '@/config/env'

// Create axios instance with default config
export const apiClient: AxiosInstance = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any

    // If 401 and not already retried, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (refreshToken) {
          const response = await axios.post(
            `${env.NEXT_PUBLIC_API_URL}/auth/refresh`,
            { refresh_token: refreshToken }
          )

          const { access_token, refresh_token: newRefreshToken } = response.data

          // Update tokens
          localStorage.setItem('access_token', access_token)
          if (newRefreshToken) {
            localStorage.setItem('refresh_token', newRefreshToken)
          }

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`
          return apiClient(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        window.location.href = '/auth/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// API Error class
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errors?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Handle API errors
export const handleApiError = (error: any): never => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.detail || error.message || 'An error occurred'
    const statusCode = error.response?.status
    const errors = error.response?.data?.errors

    throw new ApiError(message, statusCode, errors)
  }

  throw new Error(error.message || 'An unexpected error occurred')
}
