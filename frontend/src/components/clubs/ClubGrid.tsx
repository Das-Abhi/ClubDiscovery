'use client'

import { Club } from '@/lib/types/club'
import { ClubCard } from './ClubCard'

interface ClubGridProps {
  clubs: Club[]
  onClubClick?: (club: Club) => void
  searchQuery?: string
}

export function ClubGrid({ clubs, onClubClick, searchQuery }: ClubGridProps) {
  if (clubs.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full glass-card mb-4">
          <span className="text-3xl">🔍</span>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No clubs found</h3>
        <p className="text-gray-400">
          Try adjusting your search or filter criteria
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {clubs.map((club, index) => (
        <ClubCard
          key={club.id}
          club={club}
          index={index}
          onClick={() => onClubClick?.(club)}
          searchQuery={searchQuery}
        />
      ))}
    </div>
  )
}
