/**
 * Reports API client
 */
import { apiClient, handleApiError } from './client'

export interface UserReport {
  id: string
  report_type: 'user' | 'club' | 'content' | 'other'
  reporter_id?: string
  reported_user_id?: string
  reported_club_id?: string
  reason: string
  description?: string
  status: 'pending' | 'reviewing' | 'resolved' | 'rejected'
  reviewed_by?: string
  admin_notes?: string
  reviewed_at?: string
  created_at: string
  updated_at: string
}

export interface DetailedReport extends UserReport {
  reporter_email?: string
  reporter_name?: string
  reported_user_email?: string
  reported_user_name?: string
  reported_club_name?: string
  reported_club_slug?: string
  reviewer_email?: string
  reviewer_name?: string
}

export interface ReportCreateData {
  report_type: 'user' | 'club' | 'content' | 'other'
  reported_user_id?: string
  reported_club_id?: string
  reason: string
  description?: string
}

export interface ReportUpdateData {
  status?: 'pending' | 'reviewing' | 'resolved' | 'rejected'
  admin_notes?: string
}

export interface ReportStats {
  total_reports: number
  by_status: {
    pending: number
    reviewing: number
    resolved: number
    rejected: number
  }
  by_type: {
    user: number
    club: number
    content: number
    other: number
  }
}

export const reportsApi = {
  /**
   * Create a new report
   */
  createReport: async (data: ReportCreateData): Promise<UserReport> => {
    try {
      const response = await apiClient.post<UserReport>('/reports', data)
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  },

  /**
   * Get all reports (admin only)
   */
  getAllReports: async (
    statusFilter?: string,
    reportType?: string,
    skip: number = 0,
    limit: number = 50
  ): Promise<DetailedReport[]> => {
    try {
      const params: any = { skip, limit }
      if (statusFilter) params.status_filter = statusFilter
      if (reportType) params.report_type = reportType

      const response = await apiClient.get<DetailedReport[]>('/reports', { params })
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  },

  /**
   * Get report by ID (admin only)
   */
  getReportById: async (reportId: string): Promise<DetailedReport> => {
    try {
      const response = await apiClient.get<DetailedReport>(`/reports/${reportId}`)
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  },

  /**
   * Update report status (admin only)
   */
  updateReport: async (reportId: string, data: ReportUpdateData): Promise<UserReport> => {
    try {
      const response = await apiClient.patch<UserReport>(`/reports/${reportId}`, data)
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  },

  /**
   * Delete report (admin only)
   */
  deleteReport: async (reportId: string): Promise<any> => {
    try {
      const response = await apiClient.delete(`/reports/${reportId}`)
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  },

  /**
   * Get report statistics (admin only)
   */
  getReportStats: async (): Promise<ReportStats> => {
    try {
      const response = await apiClient.get<ReportStats>('/reports/stats/summary')
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  }
}
