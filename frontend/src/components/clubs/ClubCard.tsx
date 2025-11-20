'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Club } from '@/lib/types/club'
import { getInitials } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Highlight } from '@/components/ui/highlight'
import { Users, Heart } from 'lucide-react'
import { useFavorites } from '@/lib/hooks/useFavorites'
import { useAuth } from '@/lib/hooks/useAuth'

interface ClubCardProps {
  club: Club
  onClick?: () => void
  index?: number
  searchQuery?: string
}

export function ClubCard({ club, onClick, index = 0, searchQuery }: ClubCardProps) {
  const [imageError, setImageError] = useState(false)
  const { isFavorited, toggleFavorite } = useFavorites()
  const { user } = useAuth()
  const isFav = user ? isFavorited(club.id) : false

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click
    if (!user) {
      // Redirect to login if not authenticated
      window.location.href = '/auth/login'
      return
    }
    await toggleFavorite(club.id, club.name)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card
        className="glass-card cursor-pointer group overflow-hidden h-full"
        onClick={onClick}
      >
        <CardContent className="p-0">
          {/* Club Logo/Image */}
          <div className="relative aspect-video bg-gradient-to-br from-red-900/20 to-black overflow-hidden">
            {club.logo_url && !imageError ? (
              <Image
                src={club.logo_url}
                alt={club.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-4xl font-bold text-red-500 opacity-50">
                  {getInitials(club.name)}
                </span>
              </div>
            )}

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Favorite Button */}
            <motion.button
              onClick={handleFavoriteClick}
              className="absolute top-3 left-3 p-2 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 hover:bg-black/70 transition-all duration-200 z-10"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart
                className={`h-4 w-4 transition-all ${
                  isFav
                    ? 'fill-red-500 text-red-500'
                    : 'text-white hover:text-red-400'
                }`}
              />
            </motion.button>

            {/* Category Badge */}
            <div className="absolute top-3 right-3">
              <span className="px-3 py-1 text-xs font-medium bg-red-900/80 backdrop-blur-sm rounded-full border border-red-500/30">
                {club.category}
              </span>
            </div>
          </div>

          {/* Club Info */}
          <div className="p-5 space-y-3">
            <div>
              <h3 className="font-semibold text-lg text-white group-hover:text-red-400 transition-colors line-clamp-1">
                {searchQuery ? (
                  <Highlight text={club.name} query={searchQuery} />
                ) : (
                  club.name
                )}
              </h3>
              {club.tagline && (
                <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                  {searchQuery ? (
                    <Highlight text={club.tagline} query={searchQuery} />
                  ) : (
                    club.tagline
                  )}
                </p>
              )}
            </div>

            {/* Member Count */}
            {club.member_count && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Users className="h-4 w-4" />
                <span>{club.member_count} members</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
