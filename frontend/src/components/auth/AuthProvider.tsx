/**
 * AuthProvider - Global authentication wrapper
 * Ensures users are authenticated before accessing protected content
 */
'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/auth',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
]

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, isLoading, _hasHydrated, loadUser } = useAuth()

  // Check if current path is public (starts with any public route)
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route))

  useEffect(() => {
    // Wait for hydration before doing anything
    if (!_hasHydrated) return

    // Try to load user if not authenticated and not loading
    if (!isAuthenticated && !isLoading) {
      loadUser()
    }
  }, [_hasHydrated, isAuthenticated, isLoading, loadUser])

  useEffect(() => {
    // Wait for hydration and loading to complete
    if (!_hasHydrated || isLoading) return

    // Redirect unauthenticated users to login (except on public routes)
    if (!isAuthenticated && !isPublicRoute) {
      const returnUrl = pathname !== '/' ? `?returnUrl=${encodeURIComponent(pathname)}` : ''
      router.push(`/auth${returnUrl}`)
    }

    // Redirect authenticated users away from the main auth page to home
    if (isAuthenticated && pathname === '/auth') {
      router.push('/')
    }
  }, [_hasHydrated, isLoading, isAuthenticated, isPublicRoute, pathname, router])

  // Show loading spinner while hydrating or loading
  if (!_hasHydrated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <LoadingSpinner variant="compass" size="xl" text="Loading..." />
      </div>
    )
  }

  // Don't render protected content if not authenticated (except public routes)
  if (!isAuthenticated && !isPublicRoute) {
    // Return null while redirect is happening
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <LoadingSpinner variant="compass" size="xl" text="Redirecting to login..." />
      </div>
    )
  }

  return <>{children}</>
}
