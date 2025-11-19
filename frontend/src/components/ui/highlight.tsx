import { highlightText } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface HighlightProps {
  text: string
  query: string
  className?: string
  highlightClassName?: string
}

/**
 * Component to highlight matching text in search results
 * @param text - The text to display
 * @param query - The search query to highlight
 * @param className - Optional className for the wrapper
 * @param highlightClassName - Optional className for highlighted parts
 */
export function Highlight({
  text,
  query,
  className,
  highlightClassName = 'bg-red-500/30 text-red-200 font-semibold',
}: HighlightProps) {
  const parts = highlightText(text, query)

  return (
    <span className={className}>
      {parts.map((part, index) => (
        <span
          key={index}
          className={cn(part.highlighted && highlightClassName)}
        >
          {part.text}
        </span>
      ))}
    </span>
  )
}
