'use client'

import { Search, SlidersHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ClubFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  sortBy: 'name' | 'members' | 'recent'
  onSortChange: (sort: 'name' | 'members' | 'recent') => void
  totalCount: number
}

export function ClubFilters({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  totalCount,
}: ClubFiltersProps) {
  const sortOptions = [
    { value: 'name' as const, label: 'Name' },
    { value: 'members' as const, label: 'Members' },
    { value: 'recent' as const, label: 'Recent' },
  ]

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search clubs by name, description..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 glass-card border-red-900/30 h-12"
          />
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-2 glass-card rounded-lg px-4 py-2 h-12">
          <SlidersHorizontal className="h-5 w-5 text-gray-400" />
          <span className="text-sm text-gray-400 hidden sm:inline">Sort:</span>
          <div className="flex gap-1">
            {sortOptions.map((option) => (
              <Button
                key={option.value}
                variant="ghost"
                size="sm"
                onClick={() => onSortChange(option.value)}
                className={cn(
                  "text-sm",
                  sortBy === option.value
                    ? "text-red-500 bg-red-500/10"
                    : "text-gray-400 hover:text-white"
                )}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">
          {totalCount} {totalCount === 1 ? 'club' : 'clubs'} found
        </span>
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="text-red-500 hover:text-red-400 transition-colors"
          >
            Clear search
          </button>
        )}
      </div>
    </div>
  )
}
