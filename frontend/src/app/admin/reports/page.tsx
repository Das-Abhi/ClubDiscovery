/**
 * Admin Reports Management Page
 */
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, RefreshCw, Eye, CheckCircle, XCircle, Clock, Filter } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { useAuth } from '@/lib/hooks/useAuth'
import { useToast } from '@/lib/hooks/useToast'
import { reportsApi, type DetailedReport, type ReportStats } from '@/lib/api/reports'

function AdminReportsContent() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { toast } = useToast()
  const [reports, setReports] = useState<DetailedReport[]>([])
  const [filteredReports, setFilteredReports] = useState<DetailedReport[]>([])
  const [stats, setStats] = useState<ReportStats | null>(null)
  const [isLoadingReports, setIsLoadingReports] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [selectedReport, setSelectedReport] = useState<DetailedReport | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [adminNotes, setAdminNotes] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return

    // Check if user is admin
    if (!user || !user.is_admin) {
      router.push('/')
      return
    }

    loadReports()
    loadStats()
  }, [user, authLoading, router])

  useEffect(() => {
    filterReports()
  }, [reports, statusFilter, typeFilter])

  const loadReports = async () => {
    setIsLoadingReports(true)
    setError(null)
    try {
      const data = await reportsApi.getAllReports(
        statusFilter !== 'all' ? statusFilter : undefined,
        typeFilter !== 'all' ? typeFilter : undefined
      )
      setReports(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load reports')
    } finally {
      setIsLoadingReports(false)
    }
  }

  const loadStats = async () => {
    try {
      const data = await reportsApi.getReportStats()
      setStats(data)
    } catch (err: any) {
      console.error('Failed to load stats:', err)
    }
  }

  const filterReports = () => {
    let filtered = [...reports]

    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter)
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(r => r.report_type === typeFilter)
    }

    setFilteredReports(filtered)
  }

  const handleViewReport = (report: DetailedReport) => {
    setSelectedReport(report)
    setAdminNotes(report.admin_notes || '')
    setIsDetailModalOpen(true)
  }

  const handleUpdateStatus = async (reportId: string, newStatus: string) => {
    setIsUpdating(true)
    try {
      await reportsApi.updateReport(reportId, {
        status: newStatus as any,
        admin_notes: adminNotes
      })

      // Update local state
      setReports(reports.map(r =>
        r.id === reportId
          ? { ...r, status: newStatus as any, admin_notes: adminNotes }
          : r
      ))

      toast.success('Report updated successfully', 'Success')
      setIsDetailModalOpen(false)
      loadStats()
    } catch (err: any) {
      toast.error(err.message || 'Failed to update report', 'Error')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return

    try {
      await reportsApi.deleteReport(reportId)
      setReports(reports.filter(r => r.id !== reportId))
      toast.success('Report deleted successfully', 'Success')
      setIsDetailModalOpen(false)
      loadStats()
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete report', 'Error')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'
      case 'reviewing': return 'bg-blue-500/20 text-blue-500 border-blue-500/30'
      case 'resolved': return 'bg-green-500/20 text-green-500 border-green-500/30'
      case 'rejected': return 'bg-red-500/20 text-red-500 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-500 border-gray-500/30'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'user': return 'bg-purple-500/20 text-purple-400'
      case 'club': return 'bg-blue-500/20 text-blue-400'
      case 'content': return 'bg-orange-500/20 text-orange-400'
      case 'other': return 'bg-gray-500/20 text-gray-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  if ((authLoading || isLoadingReports) && reports.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400">Loading reports...</p>
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
            <h1 className="text-4xl font-bold gradient-text mb-2">User Reports</h1>
            <p className="text-gray-400">Review and manage user-submitted reports</p>
          </div>
          <Button onClick={loadReports} variant="outline" size="sm">
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
                  <p className="text-gray-400 text-sm">Total Reports</p>
                  <p className="text-2xl font-bold text-white">{stats.total_reports}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-blue-500" />
              </div>
            </Card>
            <Card className="glass-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Pending</p>
                  <p className="text-2xl font-bold text-yellow-500">{stats.by_status.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </Card>
            <Card className="glass-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Resolved</p>
                  <p className="text-2xl font-bold text-green-500">{stats.by_status.resolved}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </Card>
            <Card className="glass-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Rejected</p>
                  <p className="text-2xl font-bold text-red-500">{stats.by_status.rejected}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="glass-card p-4 mb-6">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full h-10 rounded-md border border-gray-700 bg-gray-900 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="reviewing">Reviewing</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full h-10 rounded-md border border-gray-700 bg-gray-900 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="all">All Types</option>
                  <option value="user">User</option>
                  <option value="club">Club</option>
                  <option value="content">Content</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              Showing: <span className="text-white font-medium">{filteredReports.length}</span>
            </div>
          </div>
        </Card>

        {/* Reports Table */}
        <Card className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left p-4 text-sm font-semibold text-gray-300">Type</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-300">Reporter</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-300">Subject</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-300">Reason</th>
                  <th className="text-center p-4 text-sm font-semibold text-gray-300">Status</th>
                  <th className="text-center p-4 text-sm font-semibold text-gray-300">Date</th>
                  <th className="text-center p-4 text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-8 text-gray-400">
                      {error || 'No reports found'}
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((report) => (
                    <tr
                      key={report.id}
                      className="border-b border-gray-800 hover:bg-white/5 transition-colors"
                    >
                      <td className="p-4">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium capitalize ${getTypeColor(report.report_type)}`}>
                          {report.report_type}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="text-white text-sm">{report.reporter_name || 'Anonymous'}</div>
                        <div className="text-gray-400 text-xs">{report.reporter_email || 'N/A'}</div>
                      </td>
                      <td className="p-4">
                        {report.reported_user_name && (
                          <div className="text-white text-sm">User: {report.reported_user_name}</div>
                        )}
                        {report.reported_club_name && (
                          <div className="text-white text-sm">Club: {report.reported_club_name}</div>
                        )}
                        {!report.reported_user_name && !report.reported_club_name && (
                          <div className="text-gray-400 text-sm">N/A</div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="text-white text-sm max-w-xs truncate">{report.reason}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium capitalize border ${getStatusColor(report.status)}`}>
                            {report.status}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-center text-sm text-gray-400">
                        {new Date(report.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewReport(report)}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
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

        {/* Report Detail Modal */}
        {isDetailModalOpen && selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <Card className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Report Details</h2>
                  <button
                    onClick={() => setIsDetailModalOpen(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                {/* Report Info */}
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-sm text-gray-400">Type</label>
                    <p className="text-white capitalize">{selectedReport.report_type}</p>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400">Reporter</label>
                    <p className="text-white">{selectedReport.reporter_name || 'Anonymous'}</p>
                    <p className="text-gray-400 text-sm">{selectedReport.reporter_email || 'N/A'}</p>
                  </div>

                  {selectedReport.reported_user_name && (
                    <div>
                      <label className="text-sm text-gray-400">Reported User</label>
                      <p className="text-white">{selectedReport.reported_user_name}</p>
                      <p className="text-gray-400 text-sm">{selectedReport.reported_user_email}</p>
                    </div>
                  )}

                  {selectedReport.reported_club_name && (
                    <div>
                      <label className="text-sm text-gray-400">Reported Club</label>
                      <p className="text-white">{selectedReport.reported_club_name}</p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm text-gray-400">Reason</label>
                    <p className="text-white">{selectedReport.reason}</p>
                  </div>

                  {selectedReport.description && (
                    <div>
                      <label className="text-sm text-gray-400">Description</label>
                      <p className="text-white whitespace-pre-wrap">{selectedReport.description}</p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm text-gray-400">Status</label>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium capitalize border ${getStatusColor(selectedReport.status)}`}>
                      {selectedReport.status}
                    </span>
                  </div>

                  <div>
                    <label className="text-sm text-gray-400">Submitted</label>
                    <p className="text-white">{new Date(selectedReport.created_at).toLocaleString()}</p>
                  </div>
                </div>

                {/* Admin Notes */}
                <div className="mb-6">
                  <label className="text-sm text-gray-400 mb-2 block">Admin Notes</label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={4}
                    className="w-full rounded-md border border-gray-700 bg-gray-900 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Add notes about this report..."
                  />
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Button
                    onClick={() => handleUpdateStatus(selectedReport.id, 'reviewing')}
                    disabled={isUpdating || selectedReport.status === 'reviewing'}
                    className="bg-blue-600 hover:bg-blue-700"
                    size="sm"
                  >
                    Mark Reviewing
                  </Button>
                  <Button
                    onClick={() => handleUpdateStatus(selectedReport.id, 'resolved')}
                    disabled={isUpdating || selectedReport.status === 'resolved'}
                    className="bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    Resolve
                  </Button>
                  <Button
                    onClick={() => handleUpdateStatus(selectedReport.id, 'rejected')}
                    disabled={isUpdating || selectedReport.status === 'rejected'}
                    className="bg-red-600 hover:bg-red-700"
                    size="sm"
                  >
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleDeleteReport(selectedReport.id)}
                    disabled={isUpdating}
                    variant="outline"
                    size="sm"
                  >
                    Delete
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

export default function AdminReportsPage() {
  return (
    <AuthGuard requireAuth={true}>
      <AdminReportsContent />
    </AuthGuard>
  )
}
