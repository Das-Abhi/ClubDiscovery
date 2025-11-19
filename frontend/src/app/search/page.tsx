'use client'

import { useState, useMemo, Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ClubGrid } from '@/components/clubs/ClubGrid'
import { ClubModal } from '@/components/clubs/ClubModal'
import { ClubFilters } from '@/components/clubs/ClubFilters'
import { clubsApi, type Club } from '@/lib/api/clubs'

function SearchPageContent() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''

  const [clubs, setClubs] = useState<Club[]>([])
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [sortBy, setSortBy] = useState<'name' | 'members' | 'recent'>('name')
  const [selectedClub, setSelectedClub] = useState<Club | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all clubs on mount
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        setIsLoading(true)
        const response = await clubsApi.getClubs({ per_page: 100 })
        setClubs(response.clubs)
      } catch (err: any) {
        setError(err.message || 'Failed to load clubs')
      } finally {
        setIsLoading(false)
      }
    }

    fetchClubs()
  }, [])

  // Filter clubs by search query
  const filteredClubs = useMemo(() => {
    let filtered = clubs

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (club) =>
          club.name.toLowerCase().includes(query) ||
          club.tagline?.toLowerCase().includes(query) ||
          club.description?.toLowerCase().includes(query) ||
          club.category.toLowerCase().includes(query)
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'members':
          return (b.member_count || 0) - (a.member_count || 0)
        case 'recent':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        default:
          return 0
      }
    })

    return filtered
  }, [clubs, searchQuery, sortBy])

  const handleClubClick = (club: Club) => {
    setSelectedClub(club)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setTimeout(() => setSelectedClub(null), 200)
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        {/* Page Header */}
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
            Search Clubs
          </h1>
          <p className="text-gray-400 text-lg">
            Find the perfect club that matches your interests
          </p>
        </div>

        {/* Filters */}
        {!isLoading && !error && (
          <div className="mb-8">
            <ClubFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortBy={sortBy}
              onSortChange={setSortBy}
              totalCount={filteredClubs.length}
            />
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading clubs...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-20">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        )}

        {/* Results */}
        {!isLoading && !error && (
          <>
            {searchQuery && filteredClubs.length === 0 ? (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full glass-card mb-4">
                  <span className="text-3xl">🔍</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  No clubs found for "{searchQuery}"
                </h3>
                <p className="text-gray-400 mb-6">
                  Try adjusting your search terms or browse all clubs
                </p>
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" onClick={() => setSearchQuery('')}>
                    Clear Search
                  </Button>
                  <Link href="/clubs/cocurricular">
                    <Button>Browse All Clubs</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <ClubGrid clubs={filteredClubs} onClubClick={handleClubClick} />
            )}
          </>
        )}

        {/* Club Modal */}
        {selectedClub && (
          <ClubModal
            club={selectedClub}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mb-4"></div>
          <p className="text-gray-400">Loading search...</p>
        </div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  )
}
