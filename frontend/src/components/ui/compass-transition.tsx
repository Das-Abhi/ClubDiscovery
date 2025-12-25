/**
 * CompassTransition - Full-screen animated compass transition
 * Shows after successful login/signup before redirecting
 */
'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Compass } from 'lucide-react'

interface CompassTransitionProps {
  isVisible: boolean
  userName?: string
  onComplete?: () => void
  duration?: number  // in milliseconds
}

export function CompassTransition({
  isVisible,
  userName,
  onComplete,
  duration = 2500,
}: CompassTransitionProps) {
  const [showText, setShowText] = useState(false)

  useEffect(() => {
    if (isVisible) {
      // Show welcome text after a short delay
      const textTimer = setTimeout(() => setShowText(true), 500)

      // Call onComplete after animation duration
      const completeTimer = setTimeout(() => {
        if (onComplete) {
          onComplete()
        }
      }, duration)

      return () => {
        clearTimeout(textTimer)
        clearTimeout(completeTimer)
      }
    } else {
      setShowText(false)
    }
  }, [isVisible, duration, onComplete])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-gradient-to-br from-black via-gray-900 to-red-950"
        >
          {/* Animated compass */}
          <motion.div
            initial={{ scale: 0.5, rotate: 0 }}
            animate={{
              scale: [0.5, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 1.5,
              times: [0, 0.6, 1],
              ease: 'easeInOut',
            }}
            className="relative"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 blur-xl bg-red-500/30 rounded-full" />

            {/* Compass icon */}
            <Compass className="w-24 h-24 text-red-500 relative z-10" />

            {/* Rotating ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-[-12px] border-2 border-red-500/30 rounded-full"
            />
          </motion.div>

          {/* Welcome text */}
          <AnimatePresence>
            {showText && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="mt-8 text-center"
              >
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  Welcome{userName ? `, ${userName.split(' ')[0]}` : ''}!
                </h2>
                <p className="text-gray-400">
                  Navigating to your dashboard...
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading dots */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 flex gap-1"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="w-2 h-2 bg-red-500 rounded-full"
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
