/**
 * ResultsDisplay component for showing assessment results
 */
'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trophy, Star, TrendingUp } from 'lucide-react'
import type { ClubRecommendation } from '@/lib/types/assessment'

interface ResultsDisplayProps {
  recommendations: ClubRecommendation[]
  onRetake: () => void
}

export function ResultsDisplay({
  recommendations,
  onRetake,
}: ResultsDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full space-y-6"
    >
      {/* Header */}
      <Card className="glass-card p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-700 mb-4">
          <Trophy className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-red-500 bg-clip-text text-transparent mb-2">
          Your Perfect Clubs
        </h1>
        <p className="text-gray-400">
          Based on your responses, here are the clubs that match your interests
        </p>
      </Card>

      {/* Recommendations */}
      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <motion.div
            key={rec.club.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-card p-6 hover:scale-[1.02] transition-transform">
              <div className="flex items-start gap-4">
                {/* Rank Badge */}
                <div className="flex-shrink-0">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                      rec.rank === 1
                        ? 'bg-gradient-to-br from-yellow-400 to-yellow-600'
                        : rec.rank === 2
                        ? 'bg-gradient-to-br from-gray-300 to-gray-500'
                        : rec.rank === 3
                        ? 'bg-gradient-to-br from-orange-400 to-orange-600'
                        : 'bg-gradient-to-br from-red-500 to-red-700'
                    }`}
                  >
                    {rec.rank}
                  </div>
                </div>

                {/* Club Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">
                        {rec.club.name}
                      </h3>
                      {rec.club.tagline && (
                        <p className="text-gray-400 text-sm">
                          {rec.club.tagline}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-yellow-500">
                      <Star className="w-5 h-5 fill-current" />
                      <span className="font-bold">{rec.score}</span>
                    </div>
                  </div>

                  {/* Reasoning */}
                  {rec.reasoning && rec.reasoning.length > 0 && (
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-gray-300 font-medium flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Why this match?
                      </p>
                      <div className="space-y-1">
                        {rec.reasoning.map((reason, idx) => (
                          <div
                            key={idx}
                            className="text-sm text-gray-400 flex items-start gap-2"
                          >
                            <span className="text-red-500 mt-1">•</span>
                            <div>
                              <span className="text-gray-300">
                                {reason.answer}
                              </span>
                              <span className="text-gray-500 ml-2">
                                (+{reason.contribution} points)
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <Link href={`/clubs/${rec.club.slug}`}>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Actions */}
      <Card className="glass-card p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">
              Not satisfied with the results?
            </h3>
            <p className="text-gray-400 text-sm">
              Retake the assessment to get different recommendations
            </p>
          </div>
          <Button onClick={onRetake} variant="glass">
            Retake Assessment
          </Button>
        </div>
      </Card>
    </motion.div>
  )
}
