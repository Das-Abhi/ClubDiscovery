/**
 * Admin User Detail Page
 */
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Mail, Calendar, Shield, UserCheck, UserX, ClipboardList, Building2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { useAuth } from '@/lib/hooks/useAuth'
import { useToast } from '@/lib/hooks/useToast'
import { adminApi, type AdminUser } from '@/lib/api/admin'
import { assessmentApi } from '@/lib/api/assessment'
import { clubsApi, type Membership } from '@/lib/api/clubs'
import type { Assessment } from '@/lib/types/assessment'

function UserDetailContent() {
  const router = useRouter()
  const params = useParams()
  const { user: currentUser, isLoading: authLoading } = useAuth()
  const { toast } = useToast()
  const userId = params.id as string

  const [user, setUser] = useState<AdminUser | null>(null)
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [isLoadingDetails, setIsLoadingDetails] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return

    // Check if user is admin
    if (!currentUser || !currentUser.is_admin) {
      router.push('/')
      return
    }

    if (userId) {
      loadUserDetails()
    }
  }, [currentUser, authLoading, userId, router])

  const loadUserDetails = async () => {
    setIsLoadingDetails(true)
    setError(null)

    try {
      // Load user details
      const userData = await adminApi.getUserById(userId)
      setUser(userData)

      // Load user assessments
      // Note: Backend restricts assessment access to own assessments only (no admin bypass)
      // Gracefully handle 403 errors and show empty state
      try {
        const assessmentData = await assessmentApi.getUserAssessments(userId)
        setAssessments(assessmentData)
      } catch (err: any) {
        // Silently fail for assessments - backend doesn't support admin access to user assessments
        console.debug('User assessments not accessible:', err.message)
        setAssessments([])
      }

      // Load user memberships
      // Note: Backend doesn't have an admin endpoint to fetch any user's memberships
      // The /users/me/memberships endpoint only returns current user's data
      // Leave empty until backend adds admin endpoint
      setMemberships([])
    } catch (err: any) {
      setError(err.message || 'Failed to load user details')
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const handleToggleAdmin = async () => {
    if (!user) return

    const action = user.is_admin ? 'remove admin privileges from' : 'grant admin privileges to'
    if (!confirm(`Are you sure you want to ${action} "${user.full_name}"?`)) {
      return
    }

    try {
      await adminApi.updateUserRole(user.id, !user.is_admin)
      setUser({ ...user, is_admin: !user.is_admin })
      toast.success('User role updated successfully', 'Success')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update user role', 'Error')
    }
  }

  const handleToggleActive = async () => {
    if (!user) return

    const action = user.is_active ? 'deactivate' : 'activate'
    if (!confirm(`Are you sure you want to ${action} "${user.full_name}"?`)) {
      return
    }

    try {
      await adminApi.updateUserStatus(user.id, !user.is_active)
      setUser({ ...user, is_active: !user.is_active })
      toast.success(`User ${!user.is_active ? 'activated' : 'deactivated'} successfully`, 'Success')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update user status', 'Error')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (authLoading || isLoadingDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400">Loading user details...</p>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'User not found'}</p>
          <Button onClick={() => router.push('/admin/users')}>
            Back to Users
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/admin/users')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Users
          </Button>

          <div className="flex items-start justify-between">
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
                <h1 className="text-4xl font-bold text-white mb-2">
                  {user.full_name}
                </h1>
                <p className="text-gray-400">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {user.is_admin && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded text-sm font-medium bg-purple-500/20 text-purple-400">
                  <Shield className="w-4 h-4" />
                  Admin
                </span>
              )}
              {user.is_active ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded text-sm font-medium bg-green-500/20 text-green-400">
                  <UserCheck className="w-4 h-4" />
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded text-sm font-medium bg-red-500/20 text-red-400">
                  <UserX className="w-4 h-4" />
                  Inactive
                </span>
              )}
            </div>
          </div>
        </div>

        {/* User Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Basic Info */}
          <Card className="glass-card p-6">
            <h2 className="text-xl font-bold text-white mb-4">Basic Information</h2>
            <div className="space-y-3">
              {/* Commented out until backend adds these fields
              <div>
                <p className="text-sm text-gray-400">University ID</p>
                <p className="text-white font-medium">{user.university_id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Branch</p>
                <p className="text-white font-medium">{user.branch}</p>
              </div>
              */}
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
                <p className="text-sm text-gray-400">Member Since</p>
                <p className="text-white font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {formatDate(user.created_at)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Last Updated</p>
                <p className="text-white font-medium">
                  {formatDate(user.updated_at)}
                </p>
              </div>
            </div>
          </Card>

          {/* Statistics */}
          <Card className="glass-card p-6">
            <h2 className="text-xl font-bold text-white mb-4">Statistics</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-500" />
                  <span className="text-gray-300">Club Memberships</span>
                </div>
                <span className="text-2xl font-bold text-white">{memberships.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-green-500" />
                  <span className="text-gray-300">Assessments Taken</span>
                </div>
                <span className="text-2xl font-bold text-white">{assessments.length}</span>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <Card className="glass-card p-6">
            <h2 className="text-xl font-bold text-white mb-4">Actions</h2>
            <div className="space-y-3">
              <Button
                onClick={handleToggleAdmin}
                className="w-full"
                variant={user.is_admin ? 'outline' : 'glass'}
                disabled={user.id === currentUser?.id}
              >
                <Shield className="w-4 h-4 mr-2" />
                {user.is_admin ? 'Remove Admin' : 'Make Admin'}
              </Button>
              <Button
                onClick={handleToggleActive}
                className="w-full"
                variant={user.is_active ? 'outline' : 'glass'}
                disabled={user.id === currentUser?.id}
              >
                {user.is_active ? (
                  <>
                    <UserX className="w-4 h-4 mr-2" />
                    Deactivate User
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4 mr-2" />
                    Activate User
                  </>
                )}
              </Button>
              {user.id === currentUser?.id && (
                <p className="text-xs text-gray-500 text-center">
                  Cannot modify your own account
                </p>
              )}
            </div>
          </Card>
        </div>

        {/* Club Memberships */}
        <Card className="glass-card p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Club Memberships
          </h2>

          {memberships.length > 0 ? (
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
                          {membership.club?.name
                            .split(' ')
                            .map((w) => w[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)}
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
                          Joined{' '}
                          {new Date(membership.joined_at).toLocaleDateString('en-US', {
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                        membership.status === 'active'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {membership.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">
              No club memberships yet
            </p>
          )}
        </Card>

        {/* Assessment History */}
        <Card className="glass-card p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
            Assessment History
          </h2>

          {assessments.length > 0 ? (
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
                        <p className="text-white font-medium">Assessment Results</p>
                        <p className="text-sm text-gray-400 flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          {formatDate(assessment.created_at)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/assessment?id=${assessment.id}`)}
                    >
                      View Results
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">
              No assessments taken yet
            </p>
          )}
        </Card>
      </div>
    </div>
  )
}

export default function UserDetailPage() {
  return (
    <AuthGuard requireAuth={true}>
      <UserDetailContent />
    </AuthGuard>
  )
}
