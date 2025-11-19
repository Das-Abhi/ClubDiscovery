/**
 * Admin Club Management Page
 */
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Search, Star, Eye, EyeOff, Trash2, RefreshCw, Plus, Edit, Upload } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { useAuth } from '@/lib/hooks/useAuth'
import { useToast } from '@/lib/hooks/useToast'
import { adminApi, type AdminClub } from '@/lib/api/admin'
import { ClubFormModal, type ClubFormData } from '@/components/admin/ClubFormModal'
import { CSVImportModal } from '@/components/admin/CSVImportModal'

function AdminClubsContent() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { toast } = useToast()
  const [clubs, setClubs] = useState<AdminClub[]>([])
  const [filteredClubs, setFilteredClubs] = useState<AdminClub[]>([])
  const [isLoadingClubs, setIsLoadingClubs] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedClub, setSelectedClub] = useState<AdminClub | null>(null)
  const [isCSVImportOpen, setIsCSVImportOpen] = useState(false)

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return

    // Check if user is admin
    if (!user || !user.is_admin) {
      router.push('/')
      return
    }

    loadClubs()
  }, [user, authLoading, router])

  useEffect(() => {
    // Filter clubs based on search and filters
    let filtered = clubs

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (club) =>
          club.name.toLowerCase().includes(query) ||
          club.category.toLowerCase().includes(query) ||
          club.tagline?.toLowerCase().includes(query)
      )
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((club) => club.category === categoryFilter)
    }

    if (statusFilter === 'active') {
      filtered = filtered.filter((club) => club.is_active)
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter((club) => !club.is_active)
    }

    setFilteredClubs(filtered)
  }, [clubs, searchQuery, categoryFilter, statusFilter])

  const loadClubs = async () => {
    setIsLoadingClubs(true)
    setError(null)
    try {
      const data = await adminApi.getClubs()
      setClubs(data)
      setFilteredClubs(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load clubs')
    } finally {
      setIsLoadingClubs(false)
    }
  }

  const handleToggleFeatured = async (clubId: string, currentStatus: boolean) => {
    try {
      await adminApi.toggleClubFeatured(clubId, !currentStatus)
      // Update local state
      setClubs(
        clubs.map((club) =>
          club.id === clubId ? { ...club, is_featured: !currentStatus } : club
        )
      )
      toast.success(`Club ${!currentStatus ? 'marked as featured' : 'unmarked as featured'}`, 'Success')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update featured status', 'Error')
    }
  }

  const handleToggleActive = async (clubId: string, currentStatus: boolean) => {
    try {
      await adminApi.toggleClubActive(clubId, !currentStatus)
      // Update local state
      setClubs(
        clubs.map((club) =>
          club.id === clubId ? { ...club, is_active: !currentStatus } : club
        )
      )
      toast.success(`Club ${!currentStatus ? 'activated' : 'deactivated'}`, 'Success')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update active status', 'Error')
    }
  }

  const handleDeleteClub = async (clubId: string, clubName: string) => {
    if (!confirm(`Are you sure you want to delete "${clubName}"? This action cannot be undone.`)) {
      return
    }

    try {
      await adminApi.deleteClub(clubId)
      // Remove from local state
      setClubs(clubs.filter((club) => club.id !== clubId))
      toast.success('Club deleted successfully', 'Success')
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete club', 'Error')
    }
  }

  const handleOpenCreateModal = () => {
    setModalMode('create')
    setSelectedClub(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (club: AdminClub) => {
    setModalMode('edit')
    setSelectedClub(club)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedClub(null)
  }

  const handleSubmitClub = async (data: ClubFormData) => {
    if (modalMode === 'create') {
      // Create new club
      const newClub = await adminApi.createClub(data)
      setClubs([newClub, ...clubs])
      toast.success('Club created successfully', 'Success')
    } else if (modalMode === 'edit' && selectedClub) {
      // Update existing club
      const updatedClub = await adminApi.updateClub(selectedClub.id, data)
      setClubs(clubs.map((club) => (club.id === selectedClub.id ? updatedClub : club)))
      toast.success('Club updated successfully', 'Success')
    }
  }

  if (authLoading || isLoadingClubs) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400">Loading clubs...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={loadClubs}>Retry</Button>
        </div>
      </div>
    )
  }

  const categories = ['all', 'cocurricular', 'extracurricular', 'department']

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">Club Management</h1>
            <p className="text-gray-400">
              Manage all clubs, featured status, and visibility
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => setIsCSVImportOpen(true)} variant="glass">
              <Upload className="w-4 h-4 mr-2" />
              Import CSV
            </Button>
            <Button onClick={handleOpenCreateModal} variant="glass">
              <Plus className="w-4 h-4 mr-2" />
              Create Club
            </Button>
            <Button onClick={loadClubs} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
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
                  placeholder="Search clubs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full h-10 rounded-md border border-gray-700 bg-gray-900 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
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
              Total: <span className="text-white font-medium">{clubs.length}</span>
            </span>
            <span>
              Showing: <span className="text-white font-medium">{filteredClubs.length}</span>
            </span>
            <span>
              Featured:{' '}
              <span className="text-white font-medium">
                {clubs.filter((c) => c.is_featured).length}
              </span>
            </span>
            <span>
              Active:{' '}
              <span className="text-white font-medium">
                {clubs.filter((c) => c.is_active).length}
              </span>
            </span>
          </div>
        </Card>

        {/* Clubs Table */}
        <Card className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left p-4 text-sm font-semibold text-gray-300">Club</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-300">Category</th>
                  <th className="text-center p-4 text-sm font-semibold text-gray-300">Members</th>
                  <th className="text-center p-4 text-sm font-semibold text-gray-300">Views</th>
                  <th className="text-center p-4 text-sm font-semibold text-gray-300">Status</th>
                  <th className="text-center p-4 text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClubs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-8 text-gray-400">
                      No clubs found
                    </td>
                  </tr>
                ) : (
                  filteredClubs.map((club) => (
                    <tr
                      key={club.id}
                      className="border-b border-gray-800 hover:bg-white/5 transition-colors"
                    >
                      {/* Club Info */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {club.logo_url ? (
                            <img
                              src={club.logo_url}
                              alt={club.name}
                              className="w-10 h-10 rounded object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-xs font-bold text-white">
                              {club.name
                                .split(' ')
                                .map((w) => w[0])
                                .join('')
                                .toUpperCase()
                                .slice(0, 2)}
                            </div>
                          )}
                          <div>
                            <p className="text-white font-medium">{club.name}</p>
                            <p className="text-xs text-gray-400 truncate max-w-[200px]">
                              {club.tagline || 'No tagline'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-4">
                        <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-gray-800 text-gray-300 capitalize">
                          {club.category}
                        </span>
                      </td>

                      {/* Members */}
                      <td className="p-4 text-center text-white">{club.member_count || 0}</td>

                      {/* Views */}
                      <td className="p-4 text-center text-white">{club.view_count || 0}</td>

                      {/* Status */}
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          {club.is_featured && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-yellow-500/20 text-yellow-500">
                              <Star className="w-3 h-3" />
                              Featured
                            </span>
                          )}
                          {!club.is_active && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-red-500/20 text-red-500">
                              Inactive
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          {/* Edit */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditModal(club)}
                            className="text-blue-400 hover:text-blue-300"
                            title="Edit club"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>

                          {/* Toggle Featured */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleFeatured(club.id, club.is_featured)}
                            className={
                              club.is_featured
                                ? 'text-yellow-500 hover:text-yellow-400'
                                : 'text-gray-400 hover:text-yellow-500'
                            }
                            title={club.is_featured ? 'Remove from featured' : 'Mark as featured'}
                          >
                            <Star className="w-4 h-4" fill={club.is_featured ? 'currentColor' : 'none'} />
                          </Button>

                          {/* Toggle Active */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleActive(club.id, club.is_active)}
                            className={
                              club.is_active
                                ? 'text-green-500 hover:text-green-400'
                                : 'text-gray-400 hover:text-green-500'
                            }
                            title={club.is_active ? 'Deactivate club' : 'Activate club'}
                          >
                            {club.is_active ? (
                              <Eye className="w-4 h-4" />
                            ) : (
                              <EyeOff className="w-4 h-4" />
                            )}
                          </Button>

                          {/* Delete */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClub(club.id, club.name)}
                            className="text-red-400 hover:text-red-300"
                            title="Delete club"
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* Club Form Modal */}
        <ClubFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmitClub}
          initialData={selectedClub || undefined}
          mode={modalMode}
        />

        {/* CSV Import Modal */}
        <CSVImportModal
          isOpen={isCSVImportOpen}
          onClose={() => setIsCSVImportOpen(false)}
          onSuccess={() => {
            setIsCSVImportOpen(false)
            loadClubs()
            toast.success('Clubs imported successfully', 'Success')
          }}
        />
      </div>
    </div>
  )
}

export default function AdminClubsPage() {
  return (
    <AuthGuard requireAuth={true}>
      <AdminClubsContent />
    </AuthGuard>
  )
}
