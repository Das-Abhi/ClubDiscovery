/**
 * ClubAnnouncements component for displaying club announcements
 */
'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Megaphone, Calendar, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { clubsApi } from '@/lib/api/clubs'
import type { Announcement } from '@/lib/types/club'

interface ClubAnnouncementsProps {
  clubId: string
}

export function ClubAnnouncements({ clubId }: ClubAnnouncementsProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await clubsApi.getClubAnnouncements(clubId, {
          is_published: true,
          limit: 5
        })
        setAnnouncements(data)
      } catch (err: any) {
        setError(err.message || 'Failed to load announcements')
      } finally {
        setIsLoading(false)
      }
    }

    if (clubId) {
      fetchAnnouncements()
    }
  }, [clubId])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-red-500/10">
            <Megaphone className="w-6 h-6 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white">Announcements</h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="glass-card p-4 animate-pulse">
              <div className="h-5 bg-white/10 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-white/5 rounded w-full mb-1"></div>
              <div className="h-4 bg-white/5 rounded w-5/6"></div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-red-500/10">
            <Megaphone className="w-6 h-6 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white">Announcements</h2>
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

  if (announcements.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-red-500/10">
            <Megaphone className="w-6 h-6 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white">Announcements</h2>
        </div>
        <Card className="glass-card p-8 text-center">
          <Megaphone className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No announcements yet</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-red-500/10">
          <Megaphone className="w-6 h-6 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-white">Announcements</h2>
      </div>

      <div className="space-y-3">
        {announcements.map((announcement, index) => (
          <motion.div
            key={announcement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-card p-5 hover:bg-white/5 transition-colors">
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="text-lg font-semibold text-white flex-1">
                  {announcement.title}
                </h3>
                <div className="flex items-center gap-1.5 text-gray-400 text-sm whitespace-nowrap">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(announcement.created_at)}</span>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                {announcement.content}
              </p>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
