/**
 * Unit tests for useAuth hook
 */
import { renderHook, act, waitFor } from '@testing-library/react'
import { useAuth } from '@/lib/hooks/useAuth'
import { authApi } from '@/lib/api/auth'

// Mock the auth API
jest.mock('@/lib/api/auth', () => ({
  authApi: {
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    getCurrentUser: jest.fn(),
  },
}))

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.clear()
  })

  describe('Initial State', () => {
    it('initializes with default values', () => {
      const { result } = renderHook(() => useAuth())

      expect(result.current.user).toBeNull()
      expect(result.current.accessToken).toBeNull()
      expect(result.current.refreshToken).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })

  describe('Login', () => {
    const mockLoginResponse = {
      user: {
        id: '123',
        email: 'student@bmsce.ac.in',
        full_name: 'Test Student',
        is_admin: false,
      },
      access_token: 'mock_access_token',
      refresh_token: 'mock_refresh_token',
    }

    it('logs in user successfully', async () => {
      ;(authApi.login as jest.Mock).mockResolvedValue(mockLoginResponse)

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.login({
          email: 'student@bmsce.ac.in',
          password: 'password123',
        })
      })

      expect(result.current.user).toEqual(mockLoginResponse.user)
      expect(result.current.accessToken).toBe(mockLoginResponse.access_token)
      expect(result.current.refreshToken).toBe(mockLoginResponse.refresh_token)
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('stores tokens in localStorage on successful login', async () => {
      ;(authApi.login as jest.Mock).mockResolvedValue(mockLoginResponse)

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.login({
          email: 'student@bmsce.ac.in',
          password: 'password123',
        })
      })

      expect(localStorage.getItem('access_token')).toBe(mockLoginResponse.access_token)
      expect(localStorage.getItem('refresh_token')).toBe(mockLoginResponse.refresh_token)
    })

    it('sets loading state during login', async () => {
      let resolveLogin: (value: any) => void
      ;(authApi.login as jest.Mock).mockReturnValue(
        new Promise((resolve) => {
          resolveLogin = resolve
        })
      )

      const { result } = renderHook(() => useAuth())

      act(() => {
        result.current.login({
          email: 'student@bmsce.ac.in',
          password: 'password123',
        })
      })

      // Should be loading
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true)
      })

      // Resolve login
      await act(async () => {
        resolveLogin!(mockLoginResponse)
      })

      // Should not be loading anymore
      expect(result.current.isLoading).toBe(false)
    })

    it('handles login failure', async () => {
      const mockError = new Error('Invalid credentials')
      ;(authApi.login as jest.Mock).mockRejectedValue(mockError)

      const { result } = renderHook(() => useAuth())

      await expect(
        act(async () => {
          await result.current.login({
            email: 'student@bmsce.ac.in',
            password: 'wrongpassword',
          })
        })
      ).rejects.toThrow('Invalid credentials')

      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBe('Invalid credentials')
    })

    it('clears error on successful login after previous failure', async () => {
      const mockError = new Error('First error')
      ;(authApi.login as jest.Mock).mockRejectedValueOnce(mockError)
      ;(authApi.login as jest.Mock).mockResolvedValueOnce(mockLoginResponse)

      const { result } = renderHook(() => useAuth())

      // First login - should fail
      await expect(
        act(async () => {
          await result.current.login({
            email: 'student@bmsce.ac.in',
            password: 'wrongpassword',
          })
        })
      ).rejects.toThrow('First error')

      expect(result.current.error).toBe('First error')

      // Second login - should succeed and clear error
      await act(async () => {
        await result.current.login({
          email: 'student@bmsce.ac.in',
          password: 'correctpassword',
        })
      })

      expect(result.current.error).toBeNull()
      expect(result.current.isAuthenticated).toBe(true)
    })
  })

  describe('Register', () => {
    const mockRegisterResponse = {
      user: {
        id: '456',
        email: 'newstudent@bmsce.ac.in',
        full_name: 'New Student',
        is_admin: false,
      },
      access_token: 'mock_access_token_new',
      refresh_token: 'mock_refresh_token_new',
    }

    it('registers user successfully', async () => {
      ;(authApi.register as jest.Mock).mockResolvedValue(mockRegisterResponse)

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.register({
          full_name: 'New Student',
          email: 'newstudent@bmsce.ac.in',
          password: 'Password123',
        })
      })

      expect(result.current.user).toEqual(mockRegisterResponse.user)
      expect(result.current.accessToken).toBe(mockRegisterResponse.access_token)
      expect(result.current.refreshToken).toBe(mockRegisterResponse.refresh_token)
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('stores tokens in localStorage on successful registration', async () => {
      ;(authApi.register as jest.Mock).mockResolvedValue(mockRegisterResponse)

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.register({
          full_name: 'New Student',
          email: 'newstudent@bmsce.ac.in',
          password: 'Password123',
        })
      })

      expect(localStorage.getItem('access_token')).toBe(mockRegisterResponse.access_token)
      expect(localStorage.getItem('refresh_token')).toBe(mockRegisterResponse.refresh_token)
    })

    it('handles registration failure', async () => {
      const mockError = new Error('Email already exists')
      ;(authApi.register as jest.Mock).mockRejectedValue(mockError)

      const { result } = renderHook(() => useAuth())

      await expect(
        act(async () => {
          await result.current.register({
            full_name: 'New Student',
            email: 'existing@bmsce.ac.in',
            password: 'Password123',
          })
        })
      ).rejects.toThrow('Email already exists')

      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBe('Email already exists')
    })
  })

  describe('Logout', () => {
    it('clears user state on logout', async () => {
      const mockLoginResponse = {
        user: {
          id: '123',
          email: 'student@bmsce.ac.in',
          full_name: 'Test Student',
          is_admin: false,
        },
        access_token: 'mock_access_token',
        refresh_token: 'mock_refresh_token',
      }

      ;(authApi.login as jest.Mock).mockResolvedValue(mockLoginResponse)

      const { result } = renderHook(() => useAuth())

      // First login
      await act(async () => {
        await result.current.login({
          email: 'student@bmsce.ac.in',
          password: 'password123',
        })
      })

      expect(result.current.isAuthenticated).toBe(true)

      // Then logout
      act(() => {
        result.current.logout()
      })

      expect(result.current.user).toBeNull()
      expect(result.current.accessToken).toBeNull()
      expect(result.current.refreshToken).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('calls authApi.logout', () => {
      const { result } = renderHook(() => useAuth())

      act(() => {
        result.current.logout()
      })

      expect(authApi.logout).toHaveBeenCalledTimes(1)
    })
  })

  describe('Load User', () => {
    const mockUser = {
      id: '789',
      email: 'student@bmsce.ac.in',
      full_name: 'Test Student',
      is_admin: false,
    }

    it('loads user when token exists', async () => {
      localStorage.setItem('access_token', 'existing_token')
      ;(authApi.getCurrentUser as jest.Mock).mockResolvedValue(mockUser)

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.loadUser()
      })

      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('does not load user when no token exists', async () => {
      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.loadUser()
      })

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(authApi.getCurrentUser).not.toHaveBeenCalled()
    })

    it('clears auth state when token is invalid', async () => {
      localStorage.setItem('access_token', 'invalid_token')
      ;(authApi.getCurrentUser as jest.Mock).mockRejectedValue(new Error('Unauthorized'))

      const { result } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.loadUser()
      })

      expect(result.current.user).toBeNull()
      expect(result.current.accessToken).toBeNull()
      expect(result.current.refreshToken).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.isLoading).toBe(false)
      expect(authApi.logout).toHaveBeenCalled()
    })

    it('sets loading state during loadUser', async () => {
      localStorage.setItem('access_token', 'existing_token')

      let resolveGetUser: (value: any) => void
      ;(authApi.getCurrentUser as jest.Mock).mockReturnValue(
        new Promise((resolve) => {
          resolveGetUser = resolve
        })
      )

      const { result } = renderHook(() => useAuth())

      act(() => {
        result.current.loadUser()
      })

      // Should be loading
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true)
      })

      // Resolve
      await act(async () => {
        resolveGetUser!(mockUser)
      })

      // Should not be loading anymore
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('Clear Error', () => {
    it('clears error state', async () => {
      const mockError = new Error('Test error')
      ;(authApi.login as jest.Mock).mockRejectedValue(mockError)

      const { result } = renderHook(() => useAuth())

      // Trigger an error
      await expect(
        act(async () => {
          await result.current.login({
            email: 'student@bmsce.ac.in',
            password: 'wrongpassword',
          })
        })
      ).rejects.toThrow('Test error')

      expect(result.current.error).toBe('Test error')

      // Clear error
      act(() => {
        result.current.clearError()
      })

      expect(result.current.error).toBeNull()
    })
  })

  describe('Persistence', () => {
    it('persists auth state', async () => {
      const mockLoginResponse = {
        user: {
          id: '123',
          email: 'student@bmsce.ac.in',
          full_name: 'Test Student',
          is_admin: false,
        },
        access_token: 'mock_access_token',
        refresh_token: 'mock_refresh_token',
      }

      ;(authApi.login as jest.Mock).mockResolvedValue(mockLoginResponse)

      const { result, unmount } = renderHook(() => useAuth())

      await act(async () => {
        await result.current.login({
          email: 'student@bmsce.ac.in',
          password: 'password123',
        })
      })

      // Unmount and remount hook
      unmount()
      const { result: newResult } = renderHook(() => useAuth())

      // State should be persisted
      expect(newResult.current.user).toEqual(mockLoginResponse.user)
      expect(newResult.current.accessToken).toBe(mockLoginResponse.access_token)
      expect(newResult.current.isAuthenticated).toBe(true)
    })
  })
})
