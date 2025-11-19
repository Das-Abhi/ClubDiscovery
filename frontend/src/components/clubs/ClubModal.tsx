/**
 * ClubModal component for displaying club details
 */
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Users, Eye, Instagram, Linkedin, Twitter, Globe, Mail, Phone, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/lib/hooks/useAuth'
import { clubsApi, type Club } from '@/lib/api/clubs'
import Link from 'next/link'

interface ClubModalProps {
  club: Club
  isOpen: boolean
  onClose: () => void
  onJoinLeave?: () => void
}

export function ClubModal({ club, isOpen, onClose, onJoinLeave }: ClubModalProps) {
  const { isAuthenticated } = useAuth()
  const [isMember, setIsMember] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingMembership, setIsCheckingMembership] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check if user is already a member when modal opens
  useEffect(() => {
    const checkMembership = async () => {
      if (!isAuthenticated || !isOpen) {
        setIsCheckingMembership(false)
        return
      }

      setIsCheckingMembership(true)
      try {
        const memberships = await clubsApi.getUserMemberships()
        const isMemberOfClub = memberships.some((m) => m.club_id === club.id)
        setIsMember(isMemberOfClub)
      } catch (err) {
        console.error('Failed to check membership:', err)
        setIsMember(false)
      } finally {
        setIsCheckingMembership(false)
      }
    }

    checkMembership()
  }, [isAuthenticated, isOpen, club.id])

  const handleJoinLeave = async () => {
    if (!isAuthenticated) {
      window.location.href = '/auth'
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      if (isMember) {
        await clubsApi.leaveClub(club.id)
        setIsMember(false)
      } else {
        await clubsApi.joinClub(club.id)
        setIsMember(true)
      }

      if (onJoinLeave) {
        onJoinLeave()
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update membership')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110]"
          />

          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-5xl max-h-[90vh] overflow-y-auto"
            >
              <Card className="glass-card p-8 pb-6 relative">
                <button
                  onClick={onClose}
                  className="absolute top-6 right-6 p-2 rounded-lg hover:bg-white/10 transition-colors z-10"
                >
                  <X className="w-6 h-6 text-gray-400 hover:text-white" />
                </button>

                <div className="flex items-start gap-6 mb-6 pr-12">
                  {club.logo_url ? (
                    <img src={club.logo_url} alt={club.name} className="w-24 h-24 rounded-lg object-cover" />
                  ) : (
                    <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-2xl font-bold text-white">
                      {club.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                  )}

                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-white mb-2">{club.name}</h2>
                    {club.tagline && <p className="text-gray-400 text-lg mb-4">{club.tagline}</p>}
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Users className="w-5 h-5" />
                        <span>{club.member_count} members</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <Eye className="w-5 h-5" />
                        <span>{club.view_count} views</span>
                      </div>
                    </div>
                  </div>

                  {isAuthenticated && (
                    <Button
                      onClick={handleJoinLeave}
                      disabled={isLoading || isCheckingMembership}
                      variant={isMember ? 'outline' : 'default'}
                      className={isMember ? '' : 'bg-gradient-to-r from-red-600 to-red-500'}
                    >
                      {isCheckingMembership ? 'Checking...' : isLoading ? 'Loading...' : isMember ? 'Leave Club' : 'Join Club'}
                    </Button>
                  )}
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-md bg-red-500/10 border border-red-500/20">
                    <p className="text-sm text-red-500">{error}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    {club.description && (
                      <div>
                        <h3 className="text-xl font-bold text-white mb-3">About</h3>
                        <p className="text-gray-300 leading-relaxed">{club.description}</p>
                      </div>
                    )}
                    {club.overview && (
                      <div>
                        <h3 className="text-xl font-bold text-white mb-3">Overview</h3>
                        <p className="text-gray-300 leading-relaxed whitespace-pre-line">{club.overview}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    {club.faculty_name && (
                      <div className="glass-card p-4 rounded-lg">
                        <h3 className="text-lg font-bold text-white mb-3">Faculty Coordinator</h3>
                        <div className="space-y-2 text-sm">
                          <p className="text-white font-medium">{club.faculty_name}</p>
                          {club.faculty_email && (
                            <div className="flex items-center gap-2 text-gray-400">
                              <Mail className="w-4 h-4" />
                              <a href={'mailto:' + club.faculty_email} className="hover:text-red-500">{club.faculty_email}</a>
                            </div>
                          )}
                          {club.faculty_phone && (
                            <div className="flex items-center gap-2 text-gray-400">
                              <Phone className="w-4 h-4" />
                              <span>{club.faculty_phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {(club.instagram || club.linkedin || club.twitter || club.website) && (
                      <div className="glass-card p-4 rounded-lg">
                        <h3 className="text-lg font-bold text-white mb-3">Connect</h3>
                        <div className="space-y-2">
                          {club.instagram && (
                            <a
                              href={'https://instagram.com/' + club.instagram.replace('@', '')}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-gray-400 hover:text-red-500"
                            >
                              <Instagram className="w-5 h-5" />
                              <span>{club.instagram}</span>
                            </a>
                          )}
                          {club.linkedin && (
                            <a href={club.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-400 hover:text-red-500">
                              <Linkedin className="w-5 h-5" />
                              <span>LinkedIn</span>
                            </a>
                          )}
                          {club.twitter && (
                            <a href={club.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-400 hover:text-red-500">
                              <Twitter className="w-5 h-5" />
                              <span>Twitter</span>
                            </a>
                          )}
                          {club.website && (
                            <a href={club.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-400 hover:text-red-500">
                              <Globe className="w-5 h-5" />
                              <span>Website</span>
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="glass-card p-4 rounded-lg">
                      <h3 className="text-lg font-bold text-white mb-3">Category</h3>
                      <span className="inline-block px-3 py-1 rounded-full bg-red-500/20 text-red-500 text-sm font-medium capitalize">
                        {club.category.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                {!isAuthenticated && (
                  <div className="mt-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-center text-gray-300">
                      <a href="/auth" className="text-red-500 hover:text-red-400 font-medium">Login or Sign up</a>{' '}
                      to join this club and stay updated!
                    </p>
                  </div>
                )}

                <div className="mt-6 flex justify-center">
                  <Link href={`/clubs/${club.slug}`}>
                    <Button
                      variant="outline"
                      className="group border-red-500/30 hover:border-red-500 hover:bg-red-500/10"
                    >
                      Learn More
                      <ExternalLink className="ml-2 w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
