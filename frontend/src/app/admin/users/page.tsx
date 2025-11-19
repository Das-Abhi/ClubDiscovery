/**
 * Admin User Management Page
 */
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Search, Shield, UserCheck, UserX, RefreshCw, Mail, Eye } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { useAuth } from '@/lib/hooks/useAuth'
import { useToast } from '@/lib/hooks/useToast'
import { adminApi, type AdminUser } from '@/lib/api/admin'

function AdminUsersContent() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { toast } = useToast()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return

    // Check if user is admin
    if (!user || !user.is_admin) {
      router.push('/')
      return
    }

    loadUsers()
  }, [user, authLoading, router])

  useEffect(() => {
    // Filter users based on search and filters
    let filtered = users

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (u) =>
          u.full_name.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query)
      )
    }

    if (roleFilter === 'admin') {
      filtered = filtered.filter((u) => u.is_admin)
    } else if (roleFilter === 'user') {
      filtered = filtered.filter((u) => !u.is_admin)
    }

    if (statusFilter === 'active') {
      filtered = filtered.filter((u) => u.is_active)
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter((u) => !u.is_active)
    }

    setFilteredUsers(filtered)
  }, [users, searchQuery, roleFilter, statusFilter])

  const loadUsers = async () => {
    setIsLoadingUsers(true)
    setError(null)
    try {
      const data = await adminApi.getUsers()
      setUsers(data)
      setFilteredUsers(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load users')
    } finally {
      setIsLoadingUsers(false)
    }
  }

  const handleToggleAdmin = async (userId: string, currentStatus: boolean, userName: string) => {
    const action = currentStatus ? 'remove admin privileges from' : 'grant admin privileges to'
    if (!confirm(`Are you sure you want to ${action} "${userName}"?`)) {
      return
    }

    try {
      await adminApi.updateUserRole(userId, !currentStatus)
      // Update local state
      setUsers(
        users.map((u) => (u.id === userId ? { ...u, is_admin: !currentStatus } : u))
      )
      toast.success(`User role updated successfully`, 'Success')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update user role', 'Error')
    }
  }

  const handleToggleActive = async (userId: string, currentStatus: boolean, userName: string) => {
    const action = currentStatus ? 'deactivate' : 'activate'
    if (!confirm(`Are you sure you want to ${action} "${userName}"?`)) {
      return
    }

    try {
      await adminApi.updateUserStatus(userId, !currentStatus)
      // Update local state
      setUsers(
        users.map((u) => (u.id === userId ? { ...u, is_active: !currentStatus } : u))
      )
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`, 'Success')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update user status', 'Error')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (authLoading || isLoadingUsers) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400">Loading users...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={loadUsers}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">User Management</h1>
            <p className="text-gray-400">Manage user accounts, roles, and permissions</p>
          </div>
          <Button onClick={loadUsers} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Filters and Search */}
        <Card className="glass-card p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Role Filter */}
            <div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full h-10 rounded-md border border-gray-700 bg-gray-900 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admins</option>
                <option value="user">Users</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-10 rounded-md border border-gray-700 bg-gray-900 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 flex items-center gap-6 text-sm text-gray-400">
            <span>
              Total: <span className="text-white font-medium">{users.length}</span>
            </span>
            <span>
              Showing: <span className="text-white font-medium">{filteredUsers.length}</span>
            </span>
            <span>
              Admins:{' '}
              <span className="text-white font-medium">
                {users.filter((u) => u.is_admin).length}
              </span>
            </span>
            <span>
              Active:{' '}
              <span className="text-white font-medium">
                {users.filter((u) => u.is_active).length}
              </span>
            </span>
          </div>
        </Card>

        {/* Users Table */}
        <Card className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left p-4 text-sm font-semibold text-gray-300">User</th>
                  <th className="text-center p-4 text-sm font-semibold text-gray-300">Joined</th>
                  <th className="text-center p-4 text-sm font-semibold text-gray-300">Role</th>
                  <th className="text-center p-4 text-sm font-semibold text-gray-300">Status</th>
                  <th className="text-center p-4 text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center p-8 text-gray-400">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b border-gray-800 hover:bg-white/5 transition-colors"
                    >
                      {/* User Info */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-xs font-bold text-white">
                            {u.full_name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-white font-medium flex items-center gap-2">
                              {u.full_name}
                              {!u.email_verified && (
                                <span
                                  className="text-gray-400"
                                  title="Email not verified"
                                >
                                  <Mail className="w-3 h-3" />
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-gray-400">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Joined Date */}
                      <td className="p-4 text-center text-gray-300">
                        {formatDate(u.created_at)}
                      </td>

                      {/* Role */}
                      <td className="p-4 text-center">
                        {u.is_admin ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-purple-500/20 text-purple-400">
                            <Shield className="w-3 h-3" />
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-gray-700 text-gray-300">
                            <Users className="w-3 h-3" />
                            User
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-4 text-center">
                        {u.is_active ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-400">
                            <UserCheck className="w-3 h-3" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-red-500/20 text-red-400">
                            <UserX className="w-3 h-3" />
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          {/* View Details */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/admin/users/${u.id}`)}
                            className="text-blue-400 hover:text-blue-300"
                            title="View user details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>

                          {/* Toggle Admin Role */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleAdmin(u.id, u.is_admin, u.full_name)}
                            className={
                              u.is_admin
                                ? 'text-purple-400 hover:text-purple-300'
                                : 'text-gray-400 hover:text-purple-400'
                            }
                            title={u.is_admin ? 'Remove admin privileges' : 'Grant admin privileges'}
                            disabled={u.id === user?.id}
                          >
                            <Shield
                              className="w-4 h-4"
                              fill={u.is_admin ? 'currentColor' : 'none'}
                            />
                          </Button>

                          {/* Toggle Active Status */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleActive(u.id, u.is_active, u.full_name)}
                            className={
                              u.is_active
                                ? 'text-green-400 hover:text-green-300'
                                : 'text-gray-400 hover:text-green-400'
                            }
                            title={u.is_active ? 'Deactivate user' : 'Activate user'}
                            disabled={u.id === user?.id}
                          >
                            {u.is_active ? (
                              <UserCheck className="w-4 h-4" />
                            ) : (
                              <UserX className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Back Button */}
        <div className="mt-6">
          <Button variant="outline" onClick={() => router.push('/admin')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function AdminUsersPage() {
  return (
    <AuthGuard requireAuth={true}>
      <AdminUsersContent />
    </AuthGuard>
  )
}
