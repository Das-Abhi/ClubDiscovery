/**
 * Email Verification Banner Component
 * Displays a warning banner for users with unverified emails
 */
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { authApi } from '@/lib/api/auth'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/hooks/useAuth'

export function VerifyEmailBanner() {
  const { user } = useAuth()
  const [isVisible, setIsVisible] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Don't show banner if email is verified or no user
  if (!user || user.email_verified || !isVisible) {
    return null
  }

  const handleResendEmail = async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      await authApi.sendVerificationEmail()
      setMessage({
        type: 'success',
        text: 'Verification email sent! Check your inbox.',
      })
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'Failed to send email. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          className="fixed top-0 left-0 right-0 z-[100]"
        >
          <div className="bg-gradient-to-r from-yellow-600/90 to-orange-600/90 backdrop-blur-md border-b border-yellow-500/20">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  {/* Warning Icon */}
                  <div className="flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>

                  {/* Message */}
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">
                      Please verify your email address to access all features
                    </p>
                    {message && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className={`text-xs mt-1 ${
                          message.type === 'success' ? 'text-green-100' : 'text-red-100'
                        }`}
                      >
                        {message.text}
                      </motion.p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleResendEmail}
                      disabled={isLoading}
                      className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          Sending...
                        </>
                      ) : (
                        'Resend Email'
                      )}
                    </Button>

                    <button
                      onClick={() => setIsVisible(false)}
                      className="p-1 hover:bg-white/10 rounded-full transition-colors"
                      aria-label="Dismiss"
                    >
                      <svg
                        className="w-4 h-4 text-white"
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
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
