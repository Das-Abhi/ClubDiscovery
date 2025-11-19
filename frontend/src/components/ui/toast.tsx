/**
 * Toast - Toast notification component with animations
 */
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

export interface ToastProps {
  id: string
  title?: string
  message: string
  variant?: ToastVariant
  duration?: number
  onClose: (id: string) => void
}

const variantStyles = {
  success: {
    bg: 'bg-green-500/80 border-green-500/50',
    icon: CheckCircle,
    iconColor: 'text-white',
  },
  error: {
    bg: 'bg-red-500/80 border-red-500/50',
    icon: XCircle,
    iconColor: 'text-white',
  },
  warning: {
    bg: 'bg-yellow-500/80 border-yellow-500/50',
    icon: AlertCircle,
    iconColor: 'text-white',
  },
  info: {
    bg: 'bg-blue-500/80 border-blue-500/50',
    icon: Info,
    iconColor: 'text-white',
  },
}

export function Toast({
  id,
  title,
  message,
  variant = 'info',
  onClose,
}: ToastProps) {
  const style = variantStyles[variant]
  const Icon = style.icon

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'backdrop-blur-md min-w-[320px] max-w-[420px] p-4 shadow-lg rounded-lg',
        style.bg,
        'border'
      )}
    >
      <div className="flex gap-3">
        <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', style.iconColor)} />

        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="text-sm font-semibold text-white mb-1">{title}</h4>
          )}
          <p className="text-sm text-white/90">{message}</p>
        </div>

        <button
          onClick={() => onClose(id)}
          className="flex-shrink-0 text-white/60 hover:text-white transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}

interface ToastContainerProps {
  toasts: Omit<ToastProps, 'onClose'>[]
  onClose: (id: string) => void
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast {...toast} onClose={onClose} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}
