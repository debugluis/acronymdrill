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
  const rotate = useTransform(x, [-200, 200], [-8, 8])

  // Aura effect — matches training card implementation
  const leftGlow = useTransform(x, [-180, 0], [0.22, 0])
  const rightGlow = useTransform(x, [0, 180], [0, 0.22])
  const boxShadow = useTransform(
    x,
    [-200, -30, 0, 30, 200],
    [
      '0 0 60px 18px rgba(192,57,43,0.5)',
      '0 0 20px 6px rgba(192,57,43,0.2)',
      '0 0 0px 0px rgba(0,0,0,0)',
      '0 0 20px 6px rgba(120,140,93,0.2)',
      '0 0 60px 18px rgba(120,140,93,0.5)',
    ]
  )

  const statement = question.options?.[0] ?? ''

  const submit = (answer: string) => {
    setAnswered(true)
    const correct = answer === question.correctAnswer
    if (correct) hapticCorrect()
    else hapticWrong()
    onAnswer(correct, answer)
  }

  // Animate card flying off then call submit — used by both drag and button tap
  const triggerAnswer = (answer: 'true' | 'false') => {
    if (answered) return
    const target = answer === 'true' ? 600 : -600
    animate(x, target, { duration: 0.25 }).then(() => submit(answer))
  }

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (answered) return
    if (info.offset.x > 80) {
      triggerAnswer('true')
    } else if (info.offset.x < -80) {
      triggerAnswer('false')
    } else {
      animate(x, 0, { type: 'spring', stiffness: 400, damping: 30 })
    }
  }

  return (
    <div className="flex flex-col flex-1 px-4 pt-3 pb-8">
      <div className="text-center mb-4">
        <p className="text-xs text-[#b0aea5] uppercase tracking-wide">True or False? Swipe to answer.</p>
      </div>

      {/* Card + buttons as a connected unit, centered vertically */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <motion.div
          style={{ x, rotate, boxShadow }}
          drag={answered ? false : 'x'}
          onDragEnd={handleDragEnd}
          className="relative w-full aspect-[10/11] bg-[#1c1c1a] rounded-2xl border border-[#e8e6dc20] cursor-grab active:cursor-grabbing flex items-center justify-center p-6"
          whileDrag={{ scale: 1.02 }}
        >
          {/* Red aura overlay — left swipe */}
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none z-10"
            style={{ backgroundColor: '#c0392b', opacity: leftGlow }}
          />
          {/* Green aura overlay — right swipe */}
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none z-10"
            style={{ backgroundColor: '#4d7a2a', opacity: rightGlow }}
          />
          <p className="text-center text-xl font-semibold text-[#faf9f5] leading-snug relative z-20">
            {statement}
          </p>
        </motion.div>

        <div className="flex gap-3 w-full">
          <button
            onClick={() => triggerAnswer('false')}
            disabled={answered}
            className="flex-1 py-4 rounded-xl bg-[#c0392b]/20 border border-[#c0392b]/40 text-[#c0392b] font-semibold"
          >
            ← False
          </button>
          <button
            onClick={() => triggerAnswer('true')}
            disabled={answered}
            className="flex-1 py-4 rounded-xl bg-[#788c5d]/20 border border-[#788c5d]/40 text-[#788c5d] font-semibold"
          >
            True →
          </button>
        </div>
      </div>
    </div>
  )
}
