/**
 * Dropdown - Reusable dropdown menu component
 */
'use client'

import { useState, useRef, useEffect, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface DropdownItem {
  label: string
  value: string
  icon?: ReactNode
  disabled?: boolean
  onClick?: () => void
}

interface DropdownProps {
  items: DropdownItem[]
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  className?: string
  disabled?: boolean
  variant?: 'default' | 'glass'
}

export function Dropdown({
  items,
  placeholder = 'Select an option',
  value,
  onChange,
  className,
  disabled = false,
  variant = 'default',
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedItem = items.find((item) => item.value === value)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close on Escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const handleItemClick = (item: DropdownItem) => {
    if (item.disabled) return

    if (item.onClick) {
      item.onClick()
    }

    if (onChange) {
      onChange(item.value)
    }

    setIsOpen(false)
  }

  const baseStyles = variant === 'glass' ? 'glass-card' : 'bg-gray-900 border border-gray-700'

  return (
    <div ref={dropdownRef} className={cn('relative inline-block w-full', className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-lg',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-red-500/50',
          baseStyles,
          disabled && 'opacity-50 cursor-not-allowed',
          !disabled && 'hover:border-red-500/50 cursor-pointer'
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 flex-1 text-left">
          {selectedItem?.icon && (
            <span className="flex-shrink-0">{selectedItem.icon}</span>
          )}
          <span className={cn('text-sm', selectedItem ? 'text-white' : 'text-gray-400')}>
            {selectedItem?.label || placeholder}
          </span>
        </div>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-gray-400 transition-transform duration-200',
            isOpen && 'transform rotate-180'
          )}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute z-50 w-full mt-2 py-2 rounded-lg shadow-xl',
              'max-h-60 overflow-y-auto',
              baseStyles
            )}
            role="listbox"
          >
            {items.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => handleItemClick(item)}
                disabled={item.disabled}
                className={cn(
                  'w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm',
                  'transition-colors duration-150',
                  'focus:outline-none',
                  item.disabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-red-500/10 cursor-pointer',
                  item.value === value && 'bg-red-500/20 text-red-400'
                )}
                role="option"
                aria-selected={item.value === value}
              >
                {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                <span className={cn(item.value === value ? 'text-red-400' : 'text-gray-300')}>
                  {item.label}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
