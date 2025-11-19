'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Clock, TrendingUp } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { clubsApi, type Club } from '@/lib/api/clubs'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface SearchAutocompleteProps {
  className?: string
  onSelect?: () => void
}

export function SearchAutocomplete({ className, onSelect }: SearchAutocompleteProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Club[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Load recent searches from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('clubcompass_recent_searches')
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load recent searches:', e)
      }
    }
  }, [])

  // Fetch suggestions as user types
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 2) {
        setSuggestions([])
        return
      }

      setIsLoading(true)
      try {
        const response = await clubsApi.getClubs({ search: searchQuery, per_page: 5 })
        setSuggestions(response.clubs)
      } catch (error) {
        console.error('Failed to fetch suggestions:', error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }

    const debounce = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(debounce)
  }, [searchQuery])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const saveRecentSearch = (query: string) => {
    const updated = [query, ...recentSearches.filter((s) => s !== query)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('clubcompass_recent_searches', JSON.stringify(updated))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery.trim())
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
      setIsOpen(false)
      onSelect?.()
    }
  }

  const handleSelectClub = (club: Club) => {
    saveRecentSearch(club.name)
    router.push(`/clubs/${club.slug}`)
    setSearchQuery('')
    setIsOpen(false)
    onSelect?.()
  }

  const handleSelectRecent = (query: string) => {
    setSearchQuery(query)
    router.push(`/search?q=${encodeURIComponent(query)}`)
    setIsOpen(false)
    onSelect?.()
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('clubcompass_recent_searches')
  }

  return (
    <div className={cn('relative', className)}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center gap-2 glass rounded-lg px-3 py-1.5">
          <Search className="h-4 w-4 text-gray-400" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search clubs..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setIsOpen(true)
            }}
            onFocus={() => setIsOpen(true)}
            className="border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm h-auto p-0"
          />
        </div>
      </form>

      {/* Dropdown */}
      {isOpen && (searchQuery.trim().length > 0 || recentSearches.length > 0) && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 glass-card rounded-lg shadow-lg z-50 max-h-[400px] overflow-y-auto"
        >
          {isLoading && (
            <div className="p-4 text-center">
              <LoadingSpinner size="sm" text="Searching..." />
            </div>
          )}

          {!isLoading && searchQuery.trim().length >= 2 && (
            <>
              {suggestions.length > 0 ? (
                <div className="py-2">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase">
                    Clubs
                  </div>
                  {suggestions.map((club) => (
                    <button
                      key={club.id}
                      onClick={() => handleSelectClub(club)}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 transition-colors text-left"
                    >
                      {club.logo_url ? (
                        <img
                          src={club.logo_url}
                          alt={club.name}
                          className="w-8 h-8 rounded object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-xs font-bold text-white">
                          {club.name
                            .split(' ')
                            .map((w) => w[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {club.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {club.tagline || club.category}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-gray-400">
                  No clubs found for "{searchQuery}"
                </div>
              )}
            </>
          )}

          {!isLoading && searchQuery.trim().length < 2 && recentSearches.length > 0 && (
            <div className="py-2">
              <div className="px-3 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase">
                  <Clock className="w-3 h-3" />
                  Recent Searches
                </div>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-gray-400 hover:text-white transition-colors"
                >
                  Clear
                </button>
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectRecent(search)}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 transition-colors text-left"
                >
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-white">{search}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
