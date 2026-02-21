'use client'
import { Question } from '@/types'
import { AcronymCard } from '@/components/training/AcronymCard'
import { HapticButton } from '@/components/ui/HapticButton'
import { useState } from 'react'

interface WrongAnswerSheetProps {
  question: Question
  onNext: () => void
}

export function WrongAnswerSheet({ question, onNext }: WrongAnswerSheetProps) {
  const [showFull, setShowFull] = useState(false)

  if (showFull) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-4">
          <AcronymCard entry={question.acronym} />
        </div>
        <div className="p-4">
          <HapticButton variant="primary" className="w-full py-4" onClick={onNext}>
            Next Question
          </HapticButton>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 gap-6 text-center">
      <div className="text-5xl">❌</div>
      <div className="w-full bg-[#1c1c1a] rounded-2xl p-5 border border-[#788c5d]/40">
        <p className="text-xs text-[#b0aea5] mb-1">Correct Answer</p>
        <p className="text-xl font-bold text-[#788c5d] font-poppins">{question.correctAnswer}</p>
        {question.type === 1 && (
          <p className="text-sm text-[#faf9f5] mt-1 font-lora">{question.acronym.fullName}</p>
        )}
        {question.type === 2 && (
          <p className="text-sm text-[#faf9f5] mt-1 font-lora">{question.acronym.id}</p>
        )}
      </div>
      <div className="bg-[#141413] rounded-xl p-4 text-left w-full">
        <p className="text-xs text-[#b0aea5] mb-1">📝 Exam Tip</p>
        <p className="text-sm text-[#faf9f5] font-lora leading-relaxed">{question.acronym.examTip}</p>
      </div>
      <div className="w-full space-y-3">
        <HapticButton
          variant="ghost"
          className="w-full py-3 text-sm"
          onClick={() => setShowFull(true)}
        >
          Show me more
        </HapticButton>
        <HapticButton variant="primary" className="w-full py-4" onClick={onNext}>
          Next
        </HapticButton>
      </div>
    </div>
  )
}
