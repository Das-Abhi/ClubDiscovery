/**
 * QuestionCard component for assessment questions
 */
'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'

interface Option {
  value: string
  label: string
  icon?: string
}

interface QuestionCardProps {
  question: string
  options: Option[]
  selectedValue?: string
  onSelect: (value: string) => void
}

export function QuestionCard({
  question,
  options,
  selectedValue,
  onSelect,
}: QuestionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <Card className="glass-card p-8">
        <h2 className="text-2xl font-bold text-white mb-6">{question}</h2>

        <div className="space-y-3">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => onSelect(option.value)}
              className={`w-full p-4 rounded-lg text-left transition-all duration-200 ${
                selectedValue === option.value
                  ? 'bg-red-600 text-white border-2 border-red-500'
                  : 'glass border-2 border-white/10 text-gray-300 hover:border-red-500/50 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                {option.icon && <span className="text-2xl">{option.icon}</span>}
                <span className="font-medium">{option.label}</span>
              </div>
            </button>
          ))}
        </div>
      </Card>
    </motion.div>
  )
}
