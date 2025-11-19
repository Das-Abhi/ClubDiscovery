/**
 * LoadingSpinner - Reusable loading spinner component
 */
import { Compass } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'spinner' | 'compass'
  className?: string
  text?: string
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
}

const textSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg',
}

export function LoadingSpinner({
  size = 'md',
  variant = 'spinner',
  className,
  text,
}: LoadingSpinnerProps) {
  if (variant === 'compass') {
    return (
      <div className={cn('flex flex-col items-center gap-3', className)}>
        <Compass
          className={cn(
            sizeClasses[size],
            'animate-spin text-red-500'
          )}
        />
        {text && (
          <p className={cn('text-gray-400', textSizeClasses[size])}>
            {text}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <div
        className={cn(
          sizeClasses[size],
          'border-4 border-red-500 border-t-transparent rounded-full animate-spin'
        )}
      />
      {text && (
        <p className={cn('text-gray-400', textSizeClasses[size])}>{text}</p>
      )}
    </div>
  )
}
