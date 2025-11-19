/**
 * User profile page
 */
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { EditProfileModal } from '@/components/profile/EditProfileModal'
import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ClipboardList, Calendar, Edit } from 'lucide-react'
import { assessmentApi } from '@/lib/api/assessment'
import { clubsApi, type Membership } from '@/lib/api/clubs'
import type { Assessment } from '@/lib/types/assessment'
import type { User } from '@/lib/types/user'

function ProfileContent() {
  const router = useRouter()
  const { user, logout, isLoading } = useAuth()
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [loadingAssessments, setLoadingAssessments] = useState(false)
  const [loadingMemberships, setLoadingMemberships] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  useEffect(() => {
    if (user) {
      loadAssessments()
      loadMemberships()
    }
  }, [user])

  const loadAssessments = async () => {
    if (!user) return

    setLoadingAssessments(true)
    try {
      const data = await assessmentApi.getUserAssessments(user.id)
      setAssessments(data)
    } catch (error) {
      console.error('Failed to load assessments:', error)
    } finally {
      setLoadingAssessments(false)
    }
  }

  const loadMemberships = async () => {
    setLoadingMemberships(true)
    try {
      const data = await clubsApi.getUserMemberships()
      setMemberships(data)
    } catch (error) {
      console.error('Failed to load memberships:', error)
    } finally {
      setLoadingMemberships(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-red-500 bg-clip-text text-transparent">
              My Profile
            </h1>
            <p className="text-gray-400 mt-2">
              Manage your account and view your club memberships
            </p>
          </div>

          {/* Profile Card */}
          <Card className="glass-card p-8 mb-8">
            <div className="flex items-start justify-between">
              <div className="space-y-4 flex-1">
                {/* User Avatar */}
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-2xl font-bold text-white">
                    {user.full_name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {user.full_name}
                    </h2>
                    <p className="text-gray-400">{user.email}</p>
                  </div>
                </div>

                {/* Profile Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div>
                    <p className="text-sm text-gray-400">Member Since</p>
                    <p className="text-white font-medium">
                      {new Date(user.created_at).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Email Status</p>
                    <p className="text-white font-medium flex items-center gap-2">
                      {user.email_verified ? (
                        <>
                          <span className="w-2 h-2 bg-green-500 rounded-full" />
                          Verified
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                          Not Verified
                        </>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Account Status</p>
                    <p className="text-white font-medium flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          user.is_active ? 'bg-green-500' : 'bg-red-500'
                        }`}
                      />
                      {user.is_active ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="ml-4 flex gap-2">
                <Button
                  onClick={() => setIsEditModalOpen(true)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                >
                  Logout
                </Button>
              </div>
            </div>
          </Card>

          {/* Edit Profile Modal */}
          {user && (
            <EditProfileModal
              isOpen={isEditModalOpen}
              onClose={() => setIsEditModalOpen(false)}
              user={user}
              onSuccess={(updatedUser) => {
                // User will be automatically updated via loadUser in the modal
                console.log('Profile updated successfully:', updatedUser)
              }}
            />
          )}

          {/* Assessment History Section */}
          <Card className="glass-card p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <ClipboardList className="w-6 h-6" />
              Assessment History
            </h2>

            {loadingAssessments ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Loading assessments...</p>
              </div>
            ) : assessments.length > 0 ? (
              <div className="space-y-3">
                {assessments.map((assessment) => (
                  <div
                    key={assessment.id}
                    className="p-4 rounded-lg border border-white/10 hover:border-red-500/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                          <ClipboardList className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            Assessment Results
                          </p>
                          <p className="text-sm text-gray-400 flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            {new Date(assessment.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                      <Link href={`/assessment?id=${assessment.id}`}>
                        <Button variant="outline" size="sm">
                          View Results
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 text-center py-12">
                <ClipboardList className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-lg mb-2">No assessments yet</p>
                <p className="text-sm mb-4">
                  Take an assessment to get personalized club recommendations
                </p>
                <Button
                  onClick={() => router.push('/assessment')}
                  variant="glass"
                >
                  Take Assessment
                </Button>
              </div>
            )}
          </Card>

          {/* Club Memberships Section */}
          <Card className="glass-card p-8">
            <h2 className="text-2xl font-bold text-white mb-4">
              My Club Memberships
            </h2>

            {loadingMemberships ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Loading memberships...</p>
              </div>
            ) : memberships.length > 0 ? (
              <div className="space-y-3">
                {memberships.map((membership) => (
                  <div
                    key={membership.id}
                    className="p-4 rounded-lg border border-white/10 hover:border-red-500/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {membership.club?.logo_url ? (
                          <img
                            src={membership.club.logo_url}
                            alt={membership.club.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-sm font-bold text-white">
                            {membership.club?.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                        )}
                        <div>
                          <p className="text-white font-medium">
                            {membership.club?.name}
                          </p>
                          <p className="text-sm text-gray-400 flex items-center gap-2">
                            <span className="capitalize">{membership.role}</span>
                            <span>•</span>
                            <Calendar className="w-3 h-3" />
                            Joined {new Date(membership.joined_at).toLocaleDateString('en-US', {
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                      {membership.club && (
                        <Button
                          onClick={() => router.push(`/clubs/${membership.club?.slug}`)}
                          variant="outline"
                          size="sm"
                        >
                          View Club
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 text-center py-12">
                <p className="text-lg mb-2">No club memberships yet</p>
                <p className="text-sm">
                  Join clubs to see them listed here
                </p>
                <Button
                  onClick={() => router.push('/clubs/cocurricular')}
                  variant="glass"
                  className="mt-4"
                >
                  Explore Clubs
                </Button>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <AuthGuard requireAuth={true}>
      <ProfileContent />
    </AuthGuard>
  )
}
