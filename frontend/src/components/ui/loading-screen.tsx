/**
 * LoadingScreen - Full-screen loading component with compass animation
 */
'use client'

import { Compass } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface LoadingScreenProps {
  text?: string
  className?: string
}

export function LoadingScreen({
  text = 'Loading ClubCompass...',
  className
}: LoadingScreenProps) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center',
        'bg-gradient-to-br from-black via-[#1a0000] to-[#8B0000]',
        className
      )}
    >
      <div className="flex flex-col items-center gap-6">
        {/* Animated Compass */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Outer ring with pulse effect */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-red-500/30"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.1, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{ width: '120px', height: '120px', margin: '-10px' }}
          />

          {/* Middle ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-red-500/50"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.2, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.3,
            }}
            style={{ width: '100px', height: '100px' }}
          />

          {/* Compass icon with rotation */}
          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            <Compass className="w-16 h-16 text-red-500" />
          </motion.div>
        </motion.div>

        {/* Loading text */}
        <motion.div
          className="flex flex-col items-center gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold gradient-text">
            ClubCompass
          </h2>
          <p className="text-gray-400 text-sm">{text}</p>

          {/* Animated dots */}
          <div className="flex gap-1 mt-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-red-500 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
