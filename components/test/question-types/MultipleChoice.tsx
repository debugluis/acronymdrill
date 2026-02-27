'use client'
import { Question } from '@/types'
import { hapticCorrect, hapticWrong } from '@/lib/haptics'

interface MultipleChoiceProps {
  question: Question
  onAnswer: (correct: boolean, selected: string) => void
  answered?: boolean
  selectedAnswer?: string
}

export function MultipleChoice({ question, onAnswer, answered, selectedAnswer }: MultipleChoiceProps) {
  const isType1 = question.type === 1

  const handleSelect = (option: string) => {
    if (answered) return
    const correct = option === question.correctAnswer
    if (correct) hapticCorrect()
    else hapticWrong()
    onAnswer(correct, option)
  }

  const getOptionStyle = (option: string) => {
    if (!answered) return 'bg-[#1c1c1a] border-[#e8e6dc20] text-[#faf9f5]'
    if (option === question.correctAnswer) return 'bg-[#788c5d]/20 border-[#788c5d] text-[#788c5d]'
    if (option === selectedAnswer) return 'bg-[#c0392b]/20 border-[#c0392b] text-[#c0392b]'
    return 'bg-[#1c1c1a] border-[#e8e6dc20] text-[#b0aea5]'
  }

  return (
    <div className="flex flex-col h-full px-4 py-4 gap-4 justify-center">
      {/* Prompt */}
      <div className="text-center">
        {isType1 ? (
          <>
            <p className="text-xs text-[#b0aea5] mb-2 uppercase tracking-wide">What does this stand for?</p>
            <h2 className="text-5xl font-bold text-[#d97757] font-sans">{question.acronym.id}</h2>
          </>
        ) : (
          <>
            <p className="text-xs text-[#b0aea5] mb-2 uppercase tracking-wide">Which acronym matches?</p>
            <h2 className="text-xl font-semibold text-[#faf9f5] leading-snug px-2">
              {question.acronym.fullName}
            </h2>
          </>
        )}
      </div>

      {/* Options */}
      <div className="flex flex-col gap-3">
        {question.options?.map((option) => (
          <button
            key={option}
            onClick={() => handleSelect(option)}
            disabled={answered}
            className={`w-full text-left px-4 py-3 rounded-xl border transition-all text-sm ${getOptionStyle(option)}`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}
