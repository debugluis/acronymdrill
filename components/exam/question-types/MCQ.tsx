'use client'
import { useState } from 'react'
import { MCQuestion } from '@/types/exam'

interface MCQProps {
  question: MCQuestion
  onAnswer: (answer: string) => void
}

export function MCQ({ question, onAnswer }: MCQProps) {
  const [selected, setSelected] = useState<string | null>(null)

  const handleSelect = (optionId: string) => {
    if (selected) return
    setSelected(optionId)
    onAnswer(optionId)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <p className="text-[#faf9f5] text-base leading-relaxed">{question.stem}</p>
        <div className="space-y-2">
          {question.options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                selected === opt.id
                  ? 'bg-[#d97757]/20 border-[#d97757] text-[#d97757]'
                  : 'bg-[#1c1c1a] border-[#e8e6dc20] text-[#faf9f5] active:scale-[0.98]'
              }`}
            >
              <span className="font-semibold mr-2 text-sm uppercase">{opt.id}.</span>
              {opt.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
