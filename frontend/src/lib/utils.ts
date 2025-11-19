import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind CSS classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d)
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }

    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Generate initials from name for avatar fallback
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Slugify string for URLs
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Validate BMSCE email
 */
export function isValidBMSCEEmail(email: string): boolean {
  const emailRegex = /^[A-Za-z0-9._%+-]+@bmsce\.ac\.in$/
  return emailRegex.test(email)
}

/**
 * Truncate text with ellipsis
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

/**
 * Highlight matching text in a string (case-insensitive)
 * Returns an array of objects with text and highlighted flag
 */
export function highlightText(
  text: string,
  query: string
): Array<{ text: string; highlighted: boolean }> {
  if (!query || query.trim() === '') {
    return [{ text, highlighted: false }]
  }

  const parts: Array<{ text: string; highlighted: boolean }> = []
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const matches = text.split(regex)

  matches.forEach((part) => {
    if (part) {
      const isHighlighted = part.toLowerCase() === query.toLowerCase()
      parts.push({ text: part, highlighted: isHighlighted })
    }
  })

  return parts
}
