'use client'

import { Search, SlidersHorizontal, Filter, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ClubCategory } from '@/lib/types/club'
import { getSubcategoriesForCategory, Subcategory } from '@/lib/constants/subcategories'

interface ClubFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  sortBy: 'name' | 'members' | 'recent'
  onSortChange: (sort: 'name' | 'members' | 'recent') => void
  totalCount: number
  category?: ClubCategory
  selectedSubcategory?: string
  onSubcategoryChange?: (subcategory: string | undefined) => void
}

export function ClubFilters({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  totalCount,
  category,
  selectedSubcategory,
  onSubcategoryChange,
}: ClubFiltersProps) {
  const sortOptions = [
    { value: 'name' as const, label: 'Name' },
    { value: 'members' as const, label: 'Members' },
    { value: 'recent' as const, label: 'Recent' },
  ]

  const subcategories = category ? getSubcategoriesForCategory(category) : []

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

      {/* Subcategory Filters */}
      {subcategories.length > 0 && onSubcategoryChange && (
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Filter className="h-4 w-4" />
            <span>Filter:</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSubcategoryChange(undefined)}
            className={cn(
              "text-sm",
              !selectedSubcategory
                ? "text-red-500 bg-red-500/10"
                : "text-gray-400 hover:text-white"
            )}
          >
            All
          </Button>
          {subcategories.map((subcategory) => (
            <Button
              key={subcategory.value}
              variant="ghost"
              size="sm"
              onClick={() => onSubcategoryChange(subcategory.value)}
              className={cn(
                "text-sm",
                selectedSubcategory === subcategory.value
                  ? "text-red-500 bg-red-500/10"
                  : "text-gray-400 hover:text-white"
              )}
            >
              {subcategory.label}
            </Button>
          ))}
          {selectedSubcategory && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSubcategoryChange(undefined)}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}

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
