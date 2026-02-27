'use client'
import { Question } from '@/types'
import { hapticCorrect, hapticWrong } from '@/lib/haptics'

interface ScenarioProps {
  question: Question
  onAnswer: (correct: boolean, selected: string) => void
  answered?: boolean
  selectedAnswer?: string
}

export function Scenario({ question, onAnswer, answered, selectedAnswer }: ScenarioProps) {
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
      <div className="text-center">
        <p className="text-xs text-[#b0aea5] uppercase tracking-wide mb-2">Scenario — pick the best answer</p>
      </div>
      <div className="bg-[#1c1c1a] rounded-xl border border-[#6a9bcc]/40 p-4">
        <p className="text-[#faf9f5] text-sm leading-relaxed">{question.scenarioText}</p>
        <p className="text-[#6a9bcc] text-xs mt-2">Which technology best applies here?</p>
      </div>
      <div className="flex flex-col gap-3">
        {question.options?.map((option) => (
          <button
            key={option}
            onClick={() => handleSelect(option)}
            disabled={answered}
            className={`w-full text-left px-4 py-3 rounded-xl border transition-all font-bold font-sans text-base ${getOptionStyle(option)}`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}
