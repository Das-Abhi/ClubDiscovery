/**
 * User profile page
 */
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

function ProfileContent() {
  const router = useRouter()
  const { user, logout, isLoading } = useAuth()

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

              {/* Logout Button */}
              <Button
                onClick={handleLogout}
                variant="outline"
                className="ml-4"
              >
                Logout
              </Button>
            </div>
          </Card>

          {/* Club Memberships Section */}
          <Card className="glass-card p-8">
            <h2 className="text-2xl font-bold text-white mb-4">
              My Club Memberships
            </h2>
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
