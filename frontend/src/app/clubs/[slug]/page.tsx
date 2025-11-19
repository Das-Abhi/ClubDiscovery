'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { clubsApi, type Club } from '@/lib/api/clubs'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  ArrowLeft,
  Users,
  Eye,
  Instagram,
  Linkedin,
  Twitter,
  Globe,
  Mail,
  Phone,
  UserCircle
} from 'lucide-react'
import { getInitials } from '@/lib/utils'
import { ClubAnnouncements } from '@/components/clubs/ClubAnnouncements'
import { ClubGallery } from '@/components/clubs/ClubGallery'
import { useAuth } from '@/lib/hooks/useAuth'

export default function ClubDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const { isAuthenticated } = useAuth()

  const [club, setClub] = useState<Club | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [imageError, setImageError] = useState(false)
  const [isMember, setIsMember] = useState(false)
  const [isCheckingMembership, setIsCheckingMembership] = useState(true)
  const [isMembershipLoading, setIsMembershipLoading] = useState(false)
  const [membershipError, setMembershipError] = useState<string | null>(null)

  useEffect(() => {
    const fetchClub = async () => {
      try {
        setIsLoading(true)
        const data = await clubsApi.getClub(slug)
        setClub(data)
      } catch (err: any) {
        setError(err.message || 'Failed to load club details')
      } finally {
        setIsLoading(false)
      }
    }

    if (slug) {
      fetchClub()
    }
  }, [slug])

  // Check if user is already a member
  useEffect(() => {
    const checkMembership = async () => {
      if (!isAuthenticated || !club) {
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
  }, [isAuthenticated, club])

  const handleJoinLeave = async () => {
    if (!isAuthenticated) {
      router.push('/auth')
      return
    }

    if (!club) return

    setIsMembershipLoading(true)
    setMembershipError(null)

    try {
      if (isMember) {
        await clubsApi.leaveClub(club.id)
        setIsMember(false)
      } else {
        await clubsApi.joinClub(club.id)
        setIsMember(true)
      }
    } catch (err: any) {
      setMembershipError(err.message || 'Failed to update membership')
    } finally {
      setIsMembershipLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400">Loading club details...</p>
        </div>
      </div>
    )
  }

  if (error || !club) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-white mb-2">Club Not Found</h2>
          <p className="text-red-500 mb-4">{error || 'The club you are looking for does not exist'}</p>
          <Button
            onClick={() => router.push('/clubs/cocurricular')}
            className="bg-red-500 hover:bg-red-600"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Clubs
          </Button>
        </div>
      </div>
    )
  }

  const categoryConfig = {
    cocurricular: { icon: '💻', label: 'Co-Curricular', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    extracurricular: { icon: '🎭', label: 'Extra-Curricular', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    department: { icon: '🏛️', label: 'Department', color: 'bg-green-500/20 text-green-400 border-green-500/30' }
  }

  const config = categoryConfig[club.category]

  return (
    <div className="min-h-screen">
      {/* Back Button */}
      <div className="container mx-auto px-4 pt-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-gray-400 hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Club Image & Quick Info */}
          <div className="lg:col-span-1">
            <Card className="glass-card overflow-hidden sticky top-8">
              <CardContent className="p-0">
                {/* Club Logo */}
                <div className="relative aspect-square bg-gradient-to-br from-red-900/20 to-black">
                  {club.logo_url && !imageError ? (
                    <Image
                      src={club.logo_url}
                      alt={club.name}
                      fill
                      className="object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-6xl font-bold text-red-500 opacity-50">
                        {getInitials(club.name)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Users className="h-4 w-4" />
                      <span>Members</span>
                    </div>
                    <span className="font-semibold text-white">{club.member_count}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Eye className="h-4 w-4" />
                      <span>Views</span>
                    </div>
                    <span className="font-semibold text-white">{club.view_count}</span>
                  </div>
                </div>

                {/* Social Links */}
                {(club.instagram || club.linkedin || club.twitter || club.website) && (
                  <div className="px-6 pb-6">
                    <div className="flex flex-wrap gap-2">
                      {club.instagram && (
                        <a
                          href={club.instagram.startsWith('http') ? club.instagram : `https://instagram.com/${club.instagram.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 min-w-[40px] flex items-center justify-center p-2 glass-card hover:bg-red-500/10 transition-colors rounded-lg"
                        >
                          <Instagram className="h-5 w-5" />
                        </a>
                      )}
                      {club.linkedin && (
                        <a
                          href={club.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 min-w-[40px] flex items-center justify-center p-2 glass-card hover:bg-red-500/10 transition-colors rounded-lg"
                        >
                          <Linkedin className="h-5 w-5" />
                        </a>
                      )}
                      {club.twitter && (
                        <a
                          href={club.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 min-w-[40px] flex items-center justify-center p-2 glass-card hover:bg-red-500/10 transition-colors rounded-lg"
                        >
                          <Twitter className="h-5 w-5" />
                        </a>
                      )}
                      {club.website && (
                        <a
                          href={club.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 min-w-[40px] flex items-center justify-center p-2 glass-card hover:bg-red-500/10 transition-colors rounded-lg"
                        >
                          <Globe className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Club Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-3xl">{config.icon}</span>
                <span className={`px-3 py-1 text-xs font-medium rounded-full border ${config.color}`}>
                  {config.label}
                </span>
                {club.is_featured && (
                  <span className="px-3 py-1 text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full">
                    ⭐ Featured
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
                {club.name}
              </h1>
              {club.tagline && (
                <p className="text-xl text-gray-400">{club.tagline}</p>
              )}
            </div>

            {/* Description */}
            {club.description && (
              <Card className="glass-card">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-white mb-3">About</h2>
                  <p className="text-gray-300 leading-relaxed">{club.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Overview */}
            {club.overview && club.overview !== club.description && (
              <Card className="glass-card">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-white mb-3">Overview</h2>
                  <p className="text-gray-300 leading-relaxed">{club.overview}</p>
                </CardContent>
              </Card>
            )}

            {/* Faculty Coordinator */}
            {(club.faculty_name || club.faculty_email || club.faculty_phone) && (
              <Card className="glass-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <UserCircle className="h-5 w-5 text-red-500" />
                    <h2 className="text-xl font-semibold text-white">Faculty Coordinator</h2>
                  </div>
                  <div className="space-y-3">
                    {club.faculty_name && (
                      <div className="flex items-center gap-3">
                        <UserCircle className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-300">{club.faculty_name}</span>
                      </div>
                    )}
                    {club.faculty_email && (
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-gray-400" />
                        <a
                          href={`mailto:${club.faculty_email}`}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          {club.faculty_email}
                        </a>
                      </div>
                    )}
                    {club.faculty_phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <a
                          href={`tel:${club.faculty_phone}`}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          {club.faculty_phone}
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Announcements */}
            <ClubAnnouncements clubId={club.id} />

            {/* Gallery */}
            <ClubGallery clubId={club.id} instagramUsername={club.instagram} />

            {/* Membership Error */}
            {membershipError && (
              <Card className="glass-card">
                <CardContent className="p-4 bg-red-500/10 border border-red-500/20">
                  <p className="text-sm text-red-500">{membershipError}</p>
                </CardContent>
              </Card>
            )}

            {/* CTA Button */}
            <div className="flex gap-4">
              {isAuthenticated ? (
                <Button
                  size="lg"
                  onClick={handleJoinLeave}
                  disabled={isMembershipLoading || isCheckingMembership}
                  variant={isMember ? 'outline' : 'default'}
                  className={isMember ? 'flex-1' : 'flex-1 bg-gradient-to-r from-red-900 to-red-700 hover:from-red-800 hover:to-red-600'}
                >
                  {isCheckingMembership ? 'Checking...' : isMembershipLoading ? 'Loading...' : isMember ? 'Leave Club' : 'Join Club'}
                </Button>
              ) : (
                <Button
                  size="lg"
                  onClick={() => router.push('/auth')}
                  className="flex-1 bg-gradient-to-r from-red-900 to-red-700 hover:from-red-800 hover:to-red-600"
                >
                  Login to Join Club
                </Button>
              )}
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push(`/clubs/${club.category}`)}
              >
                View Similar Clubs
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
