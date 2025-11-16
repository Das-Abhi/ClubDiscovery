'use client'

import { useEffect, useState } from 'react'
import { ClubsPageTemplate } from '@/components/clubs/ClubsPageTemplate'
import { clubsApi, type Club } from '@/lib/api/clubs'

export default function DepartmentPage() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        setIsLoading(true)
        const response = await clubsApi.getClubs({ category: 'department' })
        setClubs(response.clubs)
      } catch (err: any) {
        setError(err.message || 'Failed to load clubs')
      } finally {
        setIsLoading(false)
      }
    }

    fetchClubs()
  }, [])

  if (isLoading) {
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
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-500 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <ClubsPageTemplate
      clubs={clubs}
      category="department"
      title="Department Clubs"
      description="Join your department's club to connect with peers, work on projects, and enhance your domain expertise"
      icon="🏛️"
    />
  )
}
