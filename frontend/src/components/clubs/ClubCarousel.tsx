'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Circle } from 'lucide-react'
import Image from 'next/image'
import { Club } from '@/lib/types/club'
import { getInitials } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface ClubCarouselProps {
  clubs: Club[]
  autoRotate?: boolean
  autoRotateInterval?: number
}

export function ClubCarousel({
  clubs,
  autoRotate = true,
  autoRotateInterval = 4000,
}: ClubCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [imageError, setImageError] = useState<Record<number, boolean>>({})
  const [direction, setDirection] = useState<'left' | 'right'>('right')

  const goToNext = useCallback(() => {
    setDirection('right')
    setCurrentIndex((prev) => (prev + 1) % clubs.length)
    setImageError({})
  }, [clubs.length])

  const goToPrevious = () => {
    setDirection('left')
    setCurrentIndex((prev) => (prev - 1 + clubs.length) % clubs.length)
    setImageError({})
  }

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 'right' : 'left')
    setCurrentIndex(index)
    setImageError({})
  }

  // Auto-rotate effect
  useEffect(() => {
    if (!autoRotate || isPaused || clubs.length <= 1) return

    const interval = setInterval(goToNext, autoRotateInterval)
    return () => clearInterval(interval)
  }, [autoRotate, isPaused, autoRotateInterval, goToNext, clubs.length])

  if (clubs.length === 0) {
    return null
  }

  const currentClub = clubs[currentIndex]

  return (
    <div
      className="relative w-full glass-card rounded-2xl overflow-hidden group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Carousel Container */}
      <div className="relative aspect-[21/9] md:aspect-[21/7]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: direction === 'right' ? -100 : 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction === 'right' ? 100 : -100 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            {/* Background Image */}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-red-900/20 to-black">
              {currentClub.logo_url && !imageError[currentIndex] ? (
                <Image
                  src={currentClub.logo_url}
                  alt={currentClub.name}
                  fill
                  className="object-cover opacity-30"
                  priority
                  onError={() =>
                    setImageError((prev) => ({ ...prev, [currentIndex]: true }))
                  }
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center opacity-20">
                  <span className="text-9xl font-bold text-red-500">
                    {getInitials(currentClub.name)}
                  </span>
                </div>
              )}
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />

            {/* Content */}
            <div className="relative h-full flex items-center">
              <div className="container mx-auto px-4 md:px-8">
                <div className="max-w-2xl space-y-4">
                  {/* Category Badge */}
                  <span className="inline-block px-4 py-1.5 text-xs font-semibold bg-red-900/50 backdrop-blur-sm rounded-full border border-red-500/30 uppercase tracking-wider">
                    {currentClub.category}
                  </span>

                  {/* Club Name */}
                  <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl md:text-5xl lg:text-6xl font-bold text-white"
                  >
                    {currentClub.name}
                  </motion.h2>

                  {/* Tagline */}
                  {currentClub.tagline && (
                    <motion.p
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-lg md:text-xl text-gray-300"
                    >
                      {currentClub.tagline}
                    </motion.p>
                  )}

                  {/* Description */}
                  {currentClub.description && (
                    <motion.p
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-gray-400 line-clamp-2 max-w-xl"
                    >
                      {currentClub.description}
                    </motion.p>
                  )}

                  {/* CTA Button */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-red-900 to-red-700 hover:from-red-800 hover:to-red-600 text-white font-semibold"
                      onClick={() => {
                        window.location.href = `/clubs/${currentClub.slug}`
                      }}
                    >
                      Learn More
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      {clubs.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-black/70 text-white"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-black/70 text-white"
            onClick={goToNext}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {/* Indicators */}
      {clubs.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {clubs.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className="group/indicator p-1"
              aria-label={`Go to slide ${index + 1}`}
            >
              <Circle
                className={`h-2 w-2 transition-all ${
                  index === currentIndex
                    ? 'fill-red-500 text-red-500 scale-125'
                    : 'fill-gray-500 text-gray-500 group-hover/indicator:fill-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
