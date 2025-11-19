/**
 * Unit tests for AuthGuard component
 */
import { render, screen, waitFor } from '@testing-library/react'
import { useRouter, usePathname } from 'next/navigation'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { useAuth } from '@/lib/hooks/useAuth'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}))

jest.mock('@/lib/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}))

// Mock LoadingSpinner component
jest.mock('@/components/ui/loading-spinner', () => ({
  LoadingSpinner: ({ text }: { text: string }) => <div>{text}</div>,
}))

describe('AuthGuard Component', () => {
  const mockPush = jest.fn()
  const mockLoadUser = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
    ;(usePathname as jest.Mock).mockReturnValue('/profile')
  })

  describe('Loading State', () => {
    it('shows loading spinner while loading', () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
        loadUser: mockLoadUser,
      })

      render(
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      )

      expect(screen.getByText(/loading/i)).toBeInTheDocument()
      expect(screen.queryByText(/protected content/i)).not.toBeInTheDocument()
    })
  })

  describe('Authentication Required (requireAuth=true)', () => {
    it('loads user on mount if not authenticated', () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        loadUser: mockLoadUser,
      })

      render(
        <AuthGuard requireAuth={true}>
          <div>Protected Content</div>
        </AuthGuard>
      )

      expect(mockLoadUser).toHaveBeenCalledTimes(1)
    })

    it('redirects to login when not authenticated', async () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        loadUser: mockLoadUser,
      })

      render(
        <AuthGuard requireAuth={true}>
          <div>Protected Content</div>
        </AuthGuard>
      )

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth?returnUrl=/profile')
      })

      expect(screen.queryByText(/protected content/i)).not.toBeInTheDocument()
    })

    it('redirects to login without returnUrl for auth page', async () => {
      ;(usePathname as jest.Mock).mockReturnValue('/auth')
      ;(useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        loadUser: mockLoadUser,
      })

      render(
        <AuthGuard requireAuth={true}>
          <div>Protected Content</div>
        </AuthGuard>
      )

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth')
      })
    })

    it('renders children when authenticated', () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        loadUser: mockLoadUser,
      })

      render(
        <AuthGuard requireAuth={true}>
          <div>Protected Content</div>
        </AuthGuard>
      )

      expect(screen.getByText(/protected content/i)).toBeInTheDocument()
      expect(mockPush).not.toHaveBeenCalled()
    })

    it('does not load user when already authenticated', () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        loadUser: mockLoadUser,
      })

      render(
        <AuthGuard requireAuth={true}>
          <div>Protected Content</div>
        </AuthGuard>
      )

      expect(mockLoadUser).not.toHaveBeenCalled()
    })
  })

  describe('No Authentication Required (requireAuth=false)', () => {
    it('redirects authenticated users away from auth page', async () => {
      ;(usePathname as jest.Mock).mockReturnValue('/auth')
      ;(useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        loadUser: mockLoadUser,
      })

      render(
        <AuthGuard requireAuth={false}>
          <div>Auth Page Content</div>
        </AuthGuard>
      )

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/')
      })

      expect(screen.queryByText(/auth page content/i)).not.toBeInTheDocument()
    })

    it('renders children for unauthenticated users on auth page', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/auth')
      ;(useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        loadUser: mockLoadUser,
      })

      render(
        <AuthGuard requireAuth={false}>
          <div>Auth Page Content</div>
        </AuthGuard>
      )

      expect(screen.getByText(/auth page content/i)).toBeInTheDocument()
      expect(mockPush).not.toHaveBeenCalled()
    })

    it('renders children for authenticated users on non-auth pages', () => {
      ;(usePathname as jest.Mock).mockReturnValue('/clubs')
      ;(useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        loadUser: mockLoadUser,
      })

      render(
        <AuthGuard requireAuth={false}>
          <div>Public Content</div>
        </AuthGuard>
      )

      expect(screen.getByText(/public content/i)).toBeInTheDocument()
      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('handles loading state transition to authenticated', () => {
      const { rerender } = render(
        <AuthGuard requireAuth={true}>
          <div>Protected Content</div>
        </AuthGuard>
      )

      // Initially loading
      ;(useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
        loadUser: mockLoadUser,
      })

      rerender(
        <AuthGuard requireAuth={true}>
          <div>Protected Content</div>
        </AuthGuard>
      )

      expect(screen.getByText(/loading/i)).toBeInTheDocument()

      // Finished loading, user authenticated
      ;(useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        loadUser: mockLoadUser,
      })

      rerender(
        <AuthGuard requireAuth={true}>
          <div>Protected Content</div>
        </AuthGuard>
      )

      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
      expect(screen.getByText(/protected content/i)).toBeInTheDocument()
    })

    it('handles loading state transition to unauthenticated', async () => {
      const { rerender } = render(
        <AuthGuard requireAuth={true}>
          <div>Protected Content</div>
        </AuthGuard>
      )

      // Initially loading
      ;(useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
        loadUser: mockLoadUser,
      })

      rerender(
        <AuthGuard requireAuth={true}>
          <div>Protected Content</div>
        </AuthGuard>
      )

      expect(screen.getByText(/loading/i)).toBeInTheDocument()

      // Finished loading, user not authenticated
      ;(useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        loadUser: mockLoadUser,
      })

      rerender(
        <AuthGuard requireAuth={true}>
          <div>Protected Content</div>
        </AuthGuard>
      )

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth?returnUrl=/profile')
      })

      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/protected content/i)).not.toBeInTheDocument()
    })

    it('preserves returnUrl in redirect path', async () => {
      ;(usePathname as jest.Mock).mockReturnValue('/admin/dashboard')
      ;(useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        loadUser: mockLoadUser,
      })

      render(
        <AuthGuard requireAuth={true}>
          <div>Admin Dashboard</div>
        </AuthGuard>
      )

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth?returnUrl=/admin/dashboard')
      })
    })

    it('does not redirect when already loading', () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
        loadUser: mockLoadUser,
      })

      render(
        <AuthGuard requireAuth={true}>
          <div>Protected Content</div>
        </AuthGuard>
      )

      expect(mockPush).not.toHaveBeenCalled()
    })
  })

  describe('Multiple Children', () => {
    it('renders multiple children when authenticated', () => {
      ;(useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        loadUser: mockLoadUser,
      })

      render(
        <AuthGuard requireAuth={true}>
          <div>First Child</div>
          <div>Second Child</div>
          <div>Third Child</div>
        </AuthGuard>
      )

      expect(screen.getByText(/first child/i)).toBeInTheDocument()
      expect(screen.getByText(/second child/i)).toBeInTheDocument()
      expect(screen.getByText(/third child/i)).toBeInTheDocument()
    })
  })
})
