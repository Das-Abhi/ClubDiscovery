/**
 * AuthGuard component for protecting routes
 */
'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, isLoading, _hasHydrated, loadUser } = useAuth()

  useEffect(() => {
    // Wait for hydration to complete before loading user
    if (!_hasHydrated) return

    // Load user on mount if not already loaded
    if (!isAuthenticated && !isLoading) {
      loadUser()
    }
  }, [isAuthenticated, isLoading, _hasHydrated, loadUser])

  useEffect(() => {
    // Wait for hydration to complete before making auth decisions
    if (!_hasHydrated) return

    // If auth is required and user is not authenticated, redirect to login
    if (requireAuth && !isLoading && !isAuthenticated) {
      // Save the current path to redirect back after login
      const returnUrl = pathname !== '/auth' ? `?returnUrl=${pathname}` : ''
      router.push(`/auth${returnUrl}`)
    }

    // If user is authenticated and trying to access auth page, redirect to home
    if (!requireAuth && !isLoading && isAuthenticated && pathname === '/auth') {
      router.push('/')
    }
  }, [requireAuth, isAuthenticated, isLoading, _hasHydrated, pathname, router])

  // Show loading state while hydrating or loading user
  if (!_hasHydrated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner variant="compass" size="xl" text="Loading..." />
      </div>
    )
  }

  // If requireAuth is true and user is not authenticated, don't render children
  if (requireAuth && !isAuthenticated) {
    return null
  }

  // If requireAuth is false (auth pages) and user is authenticated, don't render children
  if (!requireAuth && isAuthenticated && pathname === '/auth') {
    return null
  }

  return <>{children}</>
}
