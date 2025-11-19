/**
 * Admin Dashboard Page
 */
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Building2, TrendingUp, ClipboardList, Star, Activity, AlertCircle, Shield } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { useAuth } from '@/lib/hooks/useAuth'
import { adminApi, type DashboardStats } from '@/lib/api/admin'
import Link from 'next/link'

function AdminDashboardContent() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activity, setActivity] = useState<any[]>([])
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return

    // Check if user is admin
    if (!user || !user.is_admin) {
      router.push('/')
      return
    }

    loadStats()
  }, [user, authLoading, router])

  const loadStats = async () => {
    setIsLoadingStats(true)
    try {
      const [statsData, activityData] = await Promise.all([
        adminApi.getDashboardStats(),
        adminApi.getRecentActivity(10)
      ])
      setStats(statsData)
      setActivity(activityData)
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard statistics')
    } finally {
      setIsLoadingStats(false)
    }
  }

  if (authLoading || isLoadingStats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={loadStats}>Retry</Button>
        </div>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Manage users, clubs, and platform settings</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Users</p>
                <p className="text-3xl font-bold text-white">{stats.total_users}</p>
                <p className="text-green-500 text-sm mt-1">
                  +{stats.new_users_30d} this month
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Clubs</p>
                <p className="text-3xl font-bold text-white">{stats.total_clubs}</p>
                <p className="text-gray-400 text-sm mt-1">
                  {stats.active_clubs} active
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Memberships</p>
                <p className="text-3xl font-bold text-white">{stats.total_memberships}</p>
                <p className="text-gray-400 text-sm mt-1">Club joins</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Assessments</p>
                <p className="text-3xl font-bold text-white">{stats.total_assessments}</p>
                <p className="text-gray-400 text-sm mt-1">Completed</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </Card>
        </div>

        {/* Popular Clubs & Category Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="glass-card p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Popular Clubs
            </h2>
            <div className="space-y-3">
              {stats.popular_clubs.map((club) => (
                <div
                  key={club.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div>
                    <p className="text-white font-medium">{club.name}</p>
                    <p className="text-gray-400 text-sm capitalize">{club.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">{club.member_count} members</p>
                    <p className="text-gray-400 text-sm">{club.view_count} views</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="glass-card p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-500" />
              Category Distribution
            </h2>
            <div className="space-y-4">
              {Object.entries(stats.category_distribution).map(([category, count]) => (
                <div key={category}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white capitalize">{category}</span>
                    <span className="text-gray-400">{count} clubs</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-red-500 to-red-700 h-2 rounded-full"
                      style={{
                        width: `${(count / stats.total_clubs) * 100}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="glass-card p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            Recent Activity
          </h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {activity.length > 0 ? (
              activity.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex-shrink-0 mt-1">
                    {item.type === 'user_registered' && (
                      <Users className="w-4 h-4 text-blue-400" />
                    )}
                    {item.type === 'club_created' && (
                      <Building2 className="w-4 h-4 text-green-400" />
                    )}
                    {item.type === 'club_joined' && (
                      <TrendingUp className="w-4 h-4 text-purple-400" />
                    )}
                    {item.type === 'assessment_completed' && (
                      <ClipboardList className="w-4 h-4 text-orange-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm">{item.description}</p>
                    {item.user_email && (
                      <p className="text-gray-400 text-xs mt-1">{item.user_email}</p>
                    )}
                    {item.club_name && (
                      <p className="text-gray-400 text-xs mt-1">{item.club_name}</p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <p className="text-gray-400 text-xs">
                      {new Date(item.timestamp).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-8">No recent activity</p>
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="glass-card p-6">
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/admin/users">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <Users className="w-4 h-4 mr-2" />
                Manage Users
              </Button>
            </Link>
            <Link href="/admin/clubs">
              <Button className="w-full bg-red-600 hover:bg-red-700">
                <Building2 className="w-4 h-4 mr-2" />
                Manage Clubs
              </Button>
            </Link>
            <Link href="/admin/moderation">
              <Button className="w-full bg-orange-600 hover:bg-orange-700">
                <Shield className="w-4 h-4 mr-2" />
                Moderation Queue
              </Button>
            </Link>
            <Link href="/admin/reports">
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                <AlertCircle className="w-4 h-4 mr-2" />
                User Reports
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full md:col-span-2 lg:col-span-1">
                Back to Site
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  return (
    <AuthGuard requireAuth={true}>
      <AdminDashboardContent />
    </AuthGuard>
  )
}
