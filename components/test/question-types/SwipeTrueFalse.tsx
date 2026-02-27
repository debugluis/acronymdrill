'use client'
import { useState } from 'react'
import { motion, PanInfo, useMotionValue, useTransform, animate } from 'framer-motion'
import { Question } from '@/types'
import { hapticCorrect, hapticWrong } from '@/lib/haptics'

interface SwipeTrueFalseProps {
  question: Question
  onAnswer: (correct: boolean, selected: string) => void
}

export function SwipeTrueFalse({ question, onAnswer }: SwipeTrueFalseProps) {
  const [answered, setAnswered] = useState(false)
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-10, 10])
  const trueOpacity = useTransform(x, [0, 80], [0, 1])
  const falseOpacity = useTransform(x, [-80, 0], [1, 0])
  const statement = question.options?.[0] ?? ''

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (answered) return
    if (info.offset.x > 80) {
      animate(x, 600, { duration: 0.25 }).then(() => submit('true'))
    } else if (info.offset.x < -80) {
      animate(x, -600, { duration: 0.25 }).then(() => submit('false'))
    } else {
      animate(x, 0, { type: 'spring', stiffness: 400, damping: 30 })
    }
  }

  const submit = (answer: string) => {
    setAnswered(true)
    const correct = answer === question.correctAnswer
    if (correct) hapticCorrect()
    else hapticWrong()
    onAnswer(correct, answer)
  }

  return (
    <div className="flex flex-col h-full px-4 py-4 gap-4">
      <div className="text-center">
        <p className="text-xs text-[#b0aea5] uppercase tracking-wide">True or False? Swipe to answer.</p>
      </div>

      <div className="flex-1 flex items-center justify-center relative">
        {/* Direction hints */}
        <motion.div
          style={{ opacity: falseOpacity }}
          className="absolute left-4 text-[#c0392b] font-bold text-lg z-10"
        >
          FALSE ←
        </motion.div>
        <motion.div
          style={{ opacity: trueOpacity }}
          className="absolute right-4 text-[#788c5d] font-bold text-lg z-10"
        >
          → TRUE
        </motion.div>

        <motion.div
          style={{ x, rotate }}
          drag={answered ? false : 'x'}
          onDragEnd={handleDragEnd}
          className="w-full max-w-sm bg-[#1c1c1a] rounded-2xl p-6 border border-[#e8e6dc20] cursor-grab active:cursor-grabbing"
          whileDrag={{ scale: 1.02 }}
        >
          <p className="text-center text-lg font-semibold text-[#faf9f5] leading-snug">
            {statement}
          </p>
        </motion.div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => submit('false')}
          disabled={answered}
          className="flex-1 py-4 rounded-xl bg-[#c0392b]/20 border border-[#c0392b]/40 text-[#c0392b] font-semibold"
        >
          ← False
        </button>
        <button
          onClick={() => submit('true')}
          disabled={answered}
          className="flex-1 py-4 rounded-xl bg-[#788c5d]/20 border border-[#788c5d]/40 text-[#788c5d] font-semibold"
        >
          True →
        </button>
      </div>
    </div>
  )
}
