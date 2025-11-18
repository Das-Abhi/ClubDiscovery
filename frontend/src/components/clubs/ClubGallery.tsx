/**
 * ClubGallery component for displaying Instagram posts
 */
'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Image as ImageIcon, Instagram, ExternalLink, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { clubsApi } from '@/lib/api/clubs'
import type { GallerySettings, InstagramPost } from '@/lib/types/club'

interface ClubGalleryProps {
  clubId: string
  instagramUsername?: string
}

export function ClubGallery({ clubId, instagramUsername }: ClubGalleryProps) {
  const [gallery, setGallery] = useState<GallerySettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await clubsApi.getClubGallery(clubId)
        setGallery(data)
      } catch (err: any) {
        setError(err.message || 'Failed to load gallery')
      } finally {
        setIsLoading(false)
      }
    }

    if (clubId) {
      fetchGallery()
    }
  }, [clubId])

  // Don't display if gallery is not enabled or no Instagram username
  if (gallery && !gallery.display_gallery) {
    return null
  }

  const effectiveInstagramUsername = gallery?.instagram_username || instagramUsername
  const posts = gallery?.cached_posts || []

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10">
            <Instagram className="w-6 h-6 text-pink-500" />
          </div>
          <h2 className="text-2xl font-bold text-white">Gallery</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-square bg-white/5 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  // If no Instagram configured, show empty state
  if (!effectiveInstagramUsername) {
    return null
  }

  if (error && !posts.length) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10">
            <Instagram className="w-6 h-6 text-pink-500" />
          </div>
          <h2 className="text-2xl font-bold text-white">Gallery</h2>
        </div>
        <Card className="glass-card p-6">
          <div className="flex items-center gap-3 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        </Card>
      </div>
    )
  }

  // Empty state - no posts yet
  if (posts.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10">
            <Instagram className="w-6 h-6 text-pink-500" />
          </div>
          <h2 className="text-2xl font-bold text-white">Gallery</h2>
        </div>

        <Card className="glass-card p-8 text-center">
          <Instagram className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 mb-4">
            Follow us on Instagram for updates!
          </p>
          {effectiveInstagramUsername && (
            <a
              href={`https://instagram.com/${effectiveInstagramUsername.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              <Instagram className="w-5 h-5" />
              <span>@{effectiveInstagramUsername.replace('@', '')}</span>
            </a>
          )}
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10">
            <Instagram className="w-6 h-6 text-pink-500" />
          </div>
          <h2 className="text-2xl font-bold text-white">Gallery</h2>
        </div>
        {effectiveInstagramUsername && (
          <a
            href={`https://instagram.com/${effectiveInstagramUsername.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-pink-500 hover:text-pink-400 transition-colors"
          >
            <span className="text-sm font-medium">@{effectiveInstagramUsername.replace('@', '')}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {posts.slice(0, 4).map((post, index) => (
          <motion.a
            key={post.id}
            href={post.permalink}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="group relative aspect-square rounded-lg overflow-hidden bg-white/5"
          >
            <img
              src={post.media_url}
              alt={post.caption || 'Instagram post'}
              className="w-full h-full object-cover transition-transform group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-0 left-0 right-0 p-4">
                {post.caption && (
                  <p className="text-white text-sm line-clamp-2 mb-2">
                    {post.caption}
                  </p>
                )}
                <div className="flex items-center gap-2 text-pink-400">
                  <Instagram className="w-4 h-4" />
                  <span className="text-xs">View on Instagram</span>
                </div>
              </div>
            </div>
          </motion.a>
        ))}
      </div>

      {effectiveInstagramUsername && (
        <div className="text-center pt-2">
          <a
            href={`https://instagram.com/${effectiveInstagramUsername.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-pink-500 transition-colors"
          >
            <span>View more on Instagram</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}
    </div>
  )
}
