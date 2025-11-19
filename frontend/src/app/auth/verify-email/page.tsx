/**
 * Email Verification Page
 * Handles email verification using token from URL
 */
'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { authApi } from '@/lib/api/auth'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/hooks/useAuth'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { loadUser } = useAuth()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error')
        setMessage('Invalid or missing verification token')
        return
      }

      try {
        const response = await authApi.verifyEmail(token)
        setStatus('success')
        setMessage(response.message || 'Email verified successfully!')

        // Reload user data to update email_verified status
        await loadUser()

        // Redirect to home after 3 seconds
        setTimeout(() => {
          router.push('/')
        }, 3000)
      } catch (err: any) {
        setStatus('error')
        setMessage(err.message || 'Failed to verify email. The link may have expired.')
      }
    }

    verifyEmail()
  }, [token, loadUser, router])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 rounded-lg border border-white/10"
        >
          {/* Verifying State */}
          {status === 'verifying' && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto">
                <div className="w-full h-full border-4 border-white/20 border-t-red-500 rounded-full animate-spin" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Verifying Email...
                </h2>
                <p className="text-gray-400">
                  Please wait while we verify your email address
                </p>
              </div>
            </div>
          )}

          {/* Success State */}
          {status === 'success' && (
            <div className="text-center space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center"
              >
                <svg
                  className="w-10 h-10 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </motion.div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Email Verified!
                </h2>
                <p className="text-gray-400 mb-1">{message}</p>
                <p className="text-gray-500 text-sm">
                  Redirecting you to the homepage...
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Link href="/">
                  <Button className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800">
                    Go to Homepage
                  </Button>
                </Link>
                <Link href="/assessment">
                  <Button variant="ghost" className="w-full">
                    Take Assessment
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className="text-center space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="w-20 h-20 mx-auto bg-red-500/20 rounded-full flex items-center justify-center"
              >
                <svg
                  className="w-10 h-10 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </motion.div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Verification Failed
                </h2>
                <p className="text-gray-400">{message}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-500">
                  The verification link may have expired or is invalid.
                </p>

                <div className="flex flex-col gap-2 pt-2">
                  <Link href="/auth/login">
                    <Button variant="ghost" className="w-full">
                      Request New Verification Email
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button variant="ghost" className="w-full">
                      Go to Homepage
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
