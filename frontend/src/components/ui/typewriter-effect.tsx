'use client'

import { motion, stagger, useAnimate, useInView } from 'framer-motion'
import { useEffect } from 'react'

export function TypewriterEffect({ words, className = '' }: { words: string; className?: string }) {
  const [scope, animate] = useAnimate()
  const isInView = useInView(scope)
  const wordsArray = words.split('')

  useEffect(() => {
    if (isInView) {
      animate(
        'span',
        {
          opacity: 1,
        },
        {
          duration: 0.1,
          delay: stagger(0.1),
        }
      )
    }
  }, [isInView, animate])

  const renderWords = () => {
    return (
      <motion.div ref={scope} className="inline">
        {wordsArray.map((word, idx) => {
          return (
            <motion.span
              key={`${word}-${idx}`}
              className="opacity-0"
            >
              {word}
            </motion.span>
          )
        })}
      </motion.div>
    )
  }

  return (
    <div className={className}>
      {renderWords()}
    </div>
  )
}
