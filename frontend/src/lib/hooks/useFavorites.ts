/**
 * useFavorites - Hook for managing club favorites
 */
'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getFavorites, addFavorite, removeFavorite, checkFavorite, type Favorite } from '@/lib/api/favorites'
import { useToast } from './useToast'

interface FavoritesStore {
  favorites: Favorite[]
  isLoading: boolean
  error: string | null
  fetchFavorites: () => Promise<void>
  toggleFavorite: (clubId: string, clubName?: string) => Promise<void>
  isFavorited: (clubId: string) => boolean
  clearFavorites: () => void
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favorites: [],
      isLoading: false,
      error: null,

      fetchFavorites: async () => {
        set({ isLoading: true, error: null })
        try {
          const favorites = await getFavorites()
          set({ favorites, isLoading: false })
        } catch (error: any) {
          set({ error: error.message, isLoading: false })
        }
      },

      toggleFavorite: async (clubId: string, clubName?: string) => {
        const { favorites } = get()
        const isFavorited = favorites.some((fav) => fav.club_id === clubId)

        try {
          if (isFavorited) {
            // Remove from favorites
            await removeFavorite(clubId)
            set((state) => ({
              favorites: state.favorites.filter((fav) => fav.club_id !== clubId),
            }))
          } else {
            // Add to favorites
            const newFavorite = await addFavorite(clubId)
            set((state) => ({
              favorites: [...state.favorites, newFavorite],
            }))
          }
        } catch (error: any) {
          set({ error: error.message })
          throw error
        }
      },

      isFavorited: (clubId: string) => {
        const { favorites } = get()
        return favorites.some((fav) => fav.club_id === clubId)
      },

      clearFavorites: () => {
        set({ favorites: [], error: null })
      },
    }),
    {
      name: 'favorites-storage',
      partialize: (state) => ({ favorites: state.favorites }),
    }
  )
)

/**
 * Hook to use favorites functionality
 */
export function useFavorites() {
  const { favorites, isLoading, error, fetchFavorites, toggleFavorite, isFavorited, clearFavorites } = useFavoritesStore()
  const { toast } = useToast()

  const handleToggleFavorite = async (clubId: string, clubName?: string) => {
    try {
      const wasFavorited = isFavorited(clubId)
      await toggleFavorite(clubId, clubName)

      // Show success toast
      if (wasFavorited) {
        toast.info(`${clubName || 'Club'} removed from favorites`, 'Removed')
      } else {
        toast.success(`${clubName || 'Club'} added to favorites`, 'Saved')
      }
    } catch (error: any) {
      // Show error toast
      toast.error(error.message || 'Failed to update favorites', 'Error')
    }
  }

  return {
    favorites,
    isLoading,
    error,
    fetchFavorites,
    toggleFavorite: handleToggleFavorite,
    isFavorited,
    clearFavorites,
  }
}
