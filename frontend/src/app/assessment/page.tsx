/**
 * Assessment page - Club recommendation quiz
 */
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QuestionCard } from '@/components/assessment/QuestionCard'
import { ResultsDisplay } from '@/components/assessment/ResultsDisplay'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { assessmentApi } from '@/lib/api/assessment'
import { useAuth } from '@/lib/hooks/useAuth'
import type {
  AssessmentResponses,
  AssessmentResult,
} from '@/lib/types/assessment'

// Assessment questions and options
const QUESTIONS = [
  {
    key: 'enjoy' as keyof AssessmentResponses,
    question: 'What do you enjoy most?',
    options: [
      { value: 'coding', label: 'Coding / Problem Solving', icon: '💻' },
      { value: 'designing', label: 'Designing and Building Things', icon: '🔧' },
      { value: 'organizing', label: 'Organizing Events', icon: '📅' },
      { value: 'public_speaking', label: 'Public Speaking', icon: '🎤' },
      { value: 'creative', label: 'Creative Arts', icon: '🎨' },
    ],
  },
  {
    key: 'time' as keyof AssessmentResponses,
    question: 'How much time can you commit per week?',
    options: [
      { value: 'low', label: '1-2 hours (Light commitment)', icon: '⏰' },
      { value: 'medium', label: '3-5 hours (Moderate commitment)', icon: '⏱️' },
      { value: 'high', label: '6+ hours (High commitment)', icon: '🔥' },
    ],
  },
  {
    key: 'domain' as keyof AssessmentResponses,
    question: 'Which domain are you most drawn to?',
    options: [
      { value: 'ai', label: 'Artificial Intelligence / Data Science', icon: '🤖' },
      { value: 'robotics', label: 'Robotics / IoT', icon: '🤖' },
      { value: 'web', label: 'Web / Mobile Development', icon: '📱' },
      { value: 'electronics', label: 'Electronics / Hardware', icon: '⚡' },
      { value: 'management', label: 'Management / Entrepreneurship', icon: '💼' },
    ],
  },
  {
    key: 'impact' as keyof AssessmentResponses,
    question: 'What kind of impact do you want to create?',
    options: [
      { value: 'tech', label: 'Technological Innovation', icon: '🚀' },
      { value: 'social', label: 'Social Change', icon: '🤝' },
      { value: 'cultural', label: 'Cultural Enrichment', icon: '🎭' },
      { value: 'entrepreneurship', label: 'Entrepreneurship / Business', icon: '💡' },
    ],
  },
  {
    key: 'past' as keyof AssessmentResponses,
    question: "What's your past experience with clubs?",
    options: [
      { value: 'coding', label: 'Coding Competitions', icon: '🏆' },
      { value: 'technical', label: 'Technical Projects', icon: '🔬' },
      { value: 'cultural', label: 'Cultural Events', icon: '🎪' },
      { value: 'sports', label: 'Sports Events', icon: '⚽' },
      { value: 'none', label: 'None, First Time!', icon: '🌟' },
    ],
  },
]

export default function AssessmentPage() {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [responses, setResponses] = useState<Partial<AssessmentResponses>>({})
  const [results, setResults] = useState<AssessmentResult | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentQuestion = QUESTIONS[currentStep]
  const progress = ((currentStep + 1) / QUESTIONS.length) * 100

  const handleSelect = (value: string) => {
    setResponses((prev) => ({
      ...prev,
      [currentQuestion.key]: value,
    }))
  }

  const handleNext = () => {
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      handleSubmit()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      const result = await assessmentApi.submitAssessment(
        responses as AssessmentResponses,
        user?.id
      )
      setResults(result)

      // Save to localStorage for anonymous users
      if (!user) {
        localStorage.setItem('last_assessment', JSON.stringify(result))
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit assessment. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRetake = () => {
    setCurrentStep(0)
    setResponses({})
    setResults(null)
    setError(null)
  }

  const isStepComplete = responses[currentQuestion.key] !== undefined
  const canProceed = isStepComplete

  // Show results if available
  if (results) {
    return (
      <div className="min-h-screen px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <ResultsDisplay
            recommendations={results.recommendations}
            onRetake={handleRetake}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-red-500 bg-clip-text text-transparent mb-3">
            Find Your Perfect Club
          </h1>
          <p className="text-gray-400">
            Answer a few questions to get personalized club recommendations
          </p>
        </motion.div>

        {/* Progress Bar */}
        <Card className="glass-card p-4 mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">
              Question {currentStep + 1} of {QUESTIONS.length}
            </span>
            <span className="text-sm text-gray-400">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-red-600 to-red-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </Card>

        {/* Question */}
        <AnimatePresence mode="wait">
          <QuestionCard
            key={currentStep}
            question={currentQuestion.question}
            options={currentQuestion.options}
            selectedValue={responses[currentQuestion.key]}
            onSelect={handleSelect}
          />
        </AnimatePresence>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4"
          >
            <Card className="p-4 bg-red-500/10 border-red-500/20">
              <p className="text-red-500 text-sm">{error}</p>
            </Card>
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            variant="outline"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceed || isSubmitting}
            variant="glass"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : currentStep === QUESTIONS.length - 1 ? (
              <>
                Submit
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>

        {/* Info */}
        {!user && (
          <Card className="glass-card p-4 mt-8 text-center">
            <p className="text-sm text-gray-400">
              💡 <span className="text-white">Tip:</span> Login to save your assessment
              history and track your club recommendations over time.
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}
