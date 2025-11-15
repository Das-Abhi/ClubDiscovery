/**
 * AuthGuard component for protecting routes
 */
'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, isLoading, loadUser } = useAuth()

  useEffect(() => {
    // Load user on mount if not already loaded
    if (!isAuthenticated && !isLoading) {
      loadUser()
    }
  }, [isAuthenticated, isLoading, loadUser])

  useEffect(() => {
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
  }, [requireAuth, isAuthenticated, isLoading, pathname, router])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400">Loading...</p>
        </div>
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
