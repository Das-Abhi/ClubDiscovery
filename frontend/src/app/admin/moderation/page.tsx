/**
 * Admin Moderation Queue Page
 */
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Clock, RefreshCw, AlertTriangle, Building2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { useAuth } from '@/lib/hooks/useAuth'
import { useToast } from '@/lib/hooks/useToast'
import { adminApi, type AdminClub } from '@/lib/api/admin'

function AdminModerationContent() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { toast } = useToast()
  const [pendingClubs, setPendingClubs] = useState<AdminClub[]>([])
  const [stats, setStats] = useState<any>(null)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedClub, setSelectedClub] = useState<AdminClub | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [revisionFeedback, setRevisionFeedback] = useState('')
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'revision' | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return

    // Check if user is admin
    if (!user || !user.is_admin) {
      router.push('/')
      return
    }

    loadPendingClubs()
    loadStats()
  }, [user, authLoading, router])

  const loadPendingClubs = async () => {
    setIsLoadingData(true)
    setError(null)
    try {
      const data = await adminApi.getPendingClubs()
      setPendingClubs(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load pending clubs')
    } finally {
      setIsLoadingData(false)
    }
  }

  const loadStats = async () => {
    try {
      const data = await adminApi.getModerationStats()
      setStats(data)
    } catch (err: any) {
      console.error('Failed to load stats:', err)
    }
  }

  const handleOpenModal = (club: AdminClub, action: 'approve' | 'reject' | 'revision') => {
    setSelectedClub(club)
    setActionType(action)
    setRejectionReason('')
    setRevisionFeedback('')
    setIsModalOpen(true)
  }

  const handleApprove = async () => {
    if (!selectedClub) return

    setIsProcessing(true)
    try {
      await adminApi.approveClub(selectedClub.id)
      setPendingClubs(pendingClubs.filter(c => c.id !== selectedClub.id))
      toast.success(`Club "${selectedClub.name}" approved`, 'Success')
      setIsModalOpen(false)
      loadStats()
    } catch (err: any) {
      toast.error(err.message || 'Failed to approve club', 'Error')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedClub || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason', 'Error')
      return
    }

    setIsProcessing(true)
    try {
      await adminApi.rejectClub(selectedClub.id, rejectionReason)
      setPendingClubs(pendingClubs.filter(c => c.id !== selectedClub.id))
      toast.success(`Club "${selectedClub.name}" rejected`, 'Success')
      setIsModalOpen(false)
      loadStats()
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject club', 'Error')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRequestRevision = async () => {
    if (!selectedClub || !revisionFeedback.trim()) {
      toast.error('Please provide revision feedback', 'Error')
      return
    }

    setIsProcessing(true)
    try {
      await adminApi.requestRevision(selectedClub.id, revisionFeedback)
      setPendingClubs(pendingClubs.filter(c => c.id !== selectedClub.id))
      toast.success(`Revision requested for "${selectedClub.name}"`, 'Success')
      setIsModalOpen(false)
      loadStats()
    } catch (err: any) {
      toast.error(err.message || 'Failed to request revision', 'Error')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAction = () => {
    switch (actionType) {
      case 'approve':
        handleApprove()
        break
      case 'reject':
        handleReject()
        break
      case 'revision':
        handleRequestRevision()
        break
    }
  }

  if ((authLoading || isLoadingData) && pendingClubs.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400">Loading moderation queue...</p>
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
            <h1 className="text-4xl font-bold gradient-text mb-2">Moderation Queue</h1>
            <p className="text-gray-400">Review and approve pending clubs</p>
          </div>
          <Button onClick={loadPendingClubs} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="glass-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Pending</p>
                  <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </Card>
            <Card className="glass-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Approved</p>
                  <p className="text-2xl font-bold text-green-500">{stats.approved}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </Card>
            <Card className="glass-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Rejected</p>
                  <p className="text-2xl font-bold text-red-500">{stats.rejected}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </Card>
            <Card className="glass-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Needs Revision</p>
                  <p className="text-2xl font-bold text-orange-500">{stats.needs_revision}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-500" />
              </div>
            </Card>
          </div>
        )}

        {/* Pending Clubs */}
        {error && (
          <Card className="glass-card p-6 mb-6">
            <p className="text-red-500 text-center">{error}</p>
          </Card>
        )}

        {pendingClubs.length === 0 && !error ? (
          <Card className="glass-card p-12">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">All Caught Up!</h2>
              <p className="text-gray-400">No clubs pending moderation</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {pendingClubs.map((club) => (
              <Card key={club.id} className="glass-card p-6">
                <div className="flex items-start gap-6">
                  {/* Club Logo */}
                  <div className="flex-shrink-0">
                    {club.logo_url ? (
                      <img
                        src={club.logo_url}
                        alt={club.name}
                        className="w-24 h-24 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-2xl font-bold text-white">
                        {club.name
                          .split(' ')
                          .map((w) => w[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </div>
                    )}
                  </div>

                  {/* Club Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-1">{club.name}</h3>
                        {club.tagline && (
                          <p className="text-gray-400 mb-2">{club.tagline}</p>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-gray-800 text-gray-300 capitalize">
                            {club.category}
                          </span>
                          {club.subcategory && (
                            <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-gray-700 text-gray-300 capitalize">
                              {club.subcategory}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {club.description && (
                      <p className="text-gray-300 mb-4 line-clamp-3">{club.description}</p>
                    )}

                    {/* Faculty Info */}
                    {(club.faculty_name || club.faculty_email) && (
                      <div className="mb-4 p-3 bg-white/5 rounded-lg">
                        <p className="text-sm text-gray-400 mb-1">Faculty Coordinator</p>
                        {club.faculty_name && (
                          <p className="text-white font-medium">{club.faculty_name}</p>
                        )}
                        {club.faculty_email && (
                          <p className="text-gray-400 text-sm">{club.faculty_email}</p>
                        )}
                      </div>
                    )}

                    {/* Social Links */}
                    {(club.instagram || club.linkedin || club.twitter || club.website) && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-400 mb-2">Social Media</p>
                        <div className="flex gap-2 flex-wrap">
                          {club.instagram && (
                            <span className="text-xs px-2 py-1 bg-pink-500/20 text-pink-400 rounded">
                              Instagram: {club.instagram}
                            </span>
                          )}
                          {club.linkedin && (
                            <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                              LinkedIn
                            </span>
                          )}
                          {club.website && (
                            <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded">
                              Website
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleOpenModal(club, 'approve')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleOpenModal(club, 'revision')}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Request Revision
                      </Button>
                      <Button
                        onClick={() => handleOpenModal(club, 'reject')}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Back Button */}
        <div className="mt-6">
          <Button variant="outline" onClick={() => router.push('/admin')}>
            Back to Dashboard
          </Button>
        </div>

        {/* Action Modal */}
        {isModalOpen && selectedClub && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <Card className="glass-card w-full max-w-lg m-4">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    {actionType === 'approve' && 'Approve Club'}
                    {actionType === 'reject' && 'Reject Club'}
                    {actionType === 'revision' && 'Request Revision'}
                  </h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                {/* Club Name */}
                <div className="mb-6">
                  <p className="text-gray-400 mb-2">Club</p>
                  <p className="text-white font-medium text-lg">{selectedClub.name}</p>
                </div>

                {/* Approve Confirmation */}
                {actionType === 'approve' && (
                  <div className="mb-6">
                    <p className="text-gray-300">
                      Are you sure you want to approve this club? It will become visible to all users.
                    </p>
                  </div>
                )}

                {/* Reject Reason */}
                {actionType === 'reject' && (
                  <div className="mb-6">
                    <label className="text-sm text-gray-400 mb-2 block">
                      Rejection Reason <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={4}
                      className="w-full rounded-md border border-gray-700 bg-gray-900 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Explain why this club is being rejected..."
                      required
                    />
                  </div>
                )}

                {/* Revision Feedback */}
                {actionType === 'revision' && (
                  <div className="mb-6">
                    <label className="text-sm text-gray-400 mb-2 block">
                      Revision Feedback <span className="text-orange-500">*</span>
                    </label>
                    <textarea
                      value={revisionFeedback}
                      onChange={(e) => setRevisionFeedback(e.target.value)}
                      rows={4}
                      className="w-full rounded-md border border-gray-700 bg-gray-900 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Provide specific feedback on what needs to be revised..."
                      required
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleAction}
                    disabled={isProcessing}
                    className={
                      actionType === 'approve'
                        ? 'bg-green-600 hover:bg-green-700 flex-1'
                        : actionType === 'reject'
                        ? 'bg-red-600 hover:bg-red-700 flex-1'
                        : 'bg-orange-600 hover:bg-orange-700 flex-1'
                    }
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        {actionType === 'approve' && 'Approve Club'}
                        {actionType === 'reject' && 'Reject Club'}
                        {actionType === 'revision' && 'Request Revision'}
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => setIsModalOpen(false)}
                    disabled={isProcessing}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminModerationPage() {
  return (
    <AuthGuard requireAuth={true}>
      <AdminModerationContent />
    </AuthGuard>
  )
}
