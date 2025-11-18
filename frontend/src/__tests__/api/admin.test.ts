/**
 * Unit tests for Admin API client
 */
import { adminApi } from '@/lib/api/admin'
import axios from 'axios'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('Admin API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getDashboardStats', () => {
    it('fetches dashboard statistics successfully', async () => {
      const mockStats = {
        total_users: 100,
        total_clubs: 50,
        total_memberships: 200,
        total_assessments: 150,
        new_users_30d: 10,
        active_clubs: 45,
        featured_clubs: 5,
        popular_clubs: [],
        recent_assessments_count: 20,
        category_distribution: { cocurricular: 20, extracurricular: 15, department: 15 }
      }

      mockedAxios.get.mockResolvedValueOnce({ data: mockStats })

      const result = await adminApi.getDashboardStats()

      expect(result).toEqual(mockStats)
      expect(mockedAxios.get).toHaveBeenCalledWith('/admin/dashboard/stats')
    })

    it('handles API errors gracefully', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'))

      await expect(adminApi.getDashboardStats()).rejects.toThrow()
    })
  })

  describe('getUsers', () => {
    it('fetches users list with default pagination', async () => {
      const mockUsers = [
        {
          id: '1',
          email: 'user1@bmsce.ac.in',
          full_name: 'User One',
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
          email_verified: true,
          is_active: true,
          is_admin: false
        }
      ]

      mockedAxios.get.mockResolvedValueOnce({ data: mockUsers })

      const result = await adminApi.getUsers()

      expect(result).toEqual(mockUsers)
      expect(mockedAxios.get).toHaveBeenCalledWith('/admin/users', {
        params: { skip: 0, limit: 50 }
      })
    })

    it('fetches users with custom pagination', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [] })

      await adminApi.getUsers(10, 20)

      expect(mockedAxios.get).toHaveBeenCalledWith('/admin/users', {
        params: { skip: 10, limit: 20 }
      })
    })
  })

  describe('updateUserRole', () => {
    it('updates user admin role successfully', async () => {
      const mockResponse = {
        id: '1',
        email: 'user@bmsce.ac.in',
        full_name: 'Test User',
        is_admin: true
      }

      mockedAxios.patch.mockResolvedValueOnce({ data: mockResponse })

      const result = await adminApi.updateUserRole('1', true)

      expect(result).toEqual(mockResponse)
      expect(mockedAxios.patch).toHaveBeenCalledWith(
        '/admin/users/1/role',
        null,
        { params: { is_admin: true } }
      )
    })
  })

  describe('toggleClubFeatured', () => {
    it('toggles club featured status', async () => {
      const mockResponse = {
        id: '1',
        name: 'Test Club',
        is_featured: true
      }

      mockedAxios.patch.mockResolvedValueOnce({ data: mockResponse })

      const result = await adminApi.toggleClubFeatured('1', true)

      expect(result).toEqual(mockResponse)
      expect(mockedAxios.patch).toHaveBeenCalledWith(
        '/admin/clubs/1/featured',
        null,
        { params: { is_featured: true } }
      )
    })
  })

  describe('deleteClub', () => {
    it('deletes club successfully', async () => {
      const mockResponse = { message: 'Club deleted successfully' }

      mockedAxios.delete.mockResolvedValueOnce({ data: mockResponse })

      const result = await adminApi.deleteClub('1')

      expect(result).toEqual(mockResponse)
      expect(mockedAxios.delete).toHaveBeenCalledWith('/admin/clubs/1')
    })
  })
})
