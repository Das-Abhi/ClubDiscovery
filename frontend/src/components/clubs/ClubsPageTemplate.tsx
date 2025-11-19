'use client'

import { useState, useMemo } from 'react'
import { Club, ClubCategory } from '@/lib/types/club'
import { ClubGrid } from './ClubGrid'
import { ClubModal } from './ClubModal'
import { ClubFilters } from './ClubFilters'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface ClubsPageTemplateProps {
  clubs: Club[]
  category: ClubCategory
  title: string
  description: string
  icon?: string
}

export function ClubsPageTemplate({
  clubs,
  category,
  title,
  description,
  icon,
}: ClubsPageTemplateProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'members' | 'recent'>('name')
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | undefined>(undefined)
  const [selectedClub, setSelectedClub] = useState<Club | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Filter clubs by category, subcategory, and search query
  const filteredClubs = useMemo(() => {
    let filtered = clubs.filter((club) => club.category === category)

    // Apply subcategory filter
    if (selectedSubcategory) {
      filtered = filtered.filter((club) => club.subcategory === selectedSubcategory)
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (club) =>
          club.name.toLowerCase().includes(query) ||
          club.tagline?.toLowerCase().includes(query) ||
          club.description?.toLowerCase().includes(query)
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
  }, [clubs, category, selectedSubcategory, searchQuery, sortBy])

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
          {icon && <div className="text-6xl mb-4">{icon}</div>}
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
            {title}
          </h1>
          <p className="text-gray-400 text-lg">{description}</p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <ClubFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
            totalCount={filteredClubs.length}
            category={category}
            selectedSubcategory={selectedSubcategory}
            onSubcategoryChange={setSelectedSubcategory}
          />
        </div>

        {/* Clubs Grid */}
        <ClubGrid
          clubs={filteredClubs}
          onClubClick={handleClubClick}
          searchQuery={searchQuery}
        />

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
