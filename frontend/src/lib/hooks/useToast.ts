/**
 * useToast - Hook for managing toast notifications
 */
'use client'

import { create } from 'zustand'
import type { ToastVariant } from '@/components/ui/toast'

export interface Toast {
  id: string
  title?: string
  message: string
  variant?: ToastVariant
  duration?: number
}

interface ToastStore {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  clearAll: () => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9)
    const duration = toast.duration || 5000

    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }))

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }))
      }, duration)
    }
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  clearAll: () => set({ toasts: [] }),
}))

export function useToast() {
  const { addToast, removeToast, clearAll } = useToastStore()

  const toast = {
    success: (message: string, title?: string, duration?: number) => {
      addToast({ message, title, variant: 'success', duration })
    },
    error: (message: string, title?: string, duration?: number) => {
      addToast({ message, title, variant: 'error', duration })
    },
    warning: (message: string, title?: string, duration?: number) => {
      addToast({ message, title, variant: 'warning', duration })
    },
    info: (message: string, title?: string, duration?: number) => {
      addToast({ message, title, variant: 'info', duration })
    },
    custom: (message: string, options?: Partial<Omit<Toast, 'id' | 'message'>>) => {
      addToast({ message, ...options })
    },
  }

  return {
    toast,
    removeToast,
    clearAll,
  }
}
