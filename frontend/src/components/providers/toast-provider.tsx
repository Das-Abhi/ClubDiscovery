/**
 * ToastProvider - Provider component for toast notifications
 */
'use client'

import { ToastContainer } from '@/components/ui/toast'
import { useToastStore } from '@/lib/hooks/useToast'

export function ToastProvider() {
  const toasts = useToastStore((state) => state.toasts)
  const removeToast = useToastStore((state) => state.removeToast)

  return <ToastContainer toasts={toasts} onClose={removeToast} />
}
