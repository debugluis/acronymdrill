'use client'
import { useState, useEffect } from 'react'
import { MSQuestion } from '@/types/exam'

interface MSQProps {
  question: MSQuestion
  onAnswer: (answer: string[]) => void
}

export function MSQ({ question, onAnswer }: MSQProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [submitted, setSubmitted] = useState(false)
  const requiredCount = question.correct_answers.length

  // Extract count from stem (e.g., "Choose two" or "Choose 2")
  const countMatch = question.stem.match(/choose\s+(\w+)/i)
  const displayCount = countMatch ? countMatch[1] : String(requiredCount)

  useEffect(() => {
    if (selected.size === requiredCount && !submitted) {
      setSubmitted(true)
      onAnswer(Array.from(selected))
    }
  }, [selected, requiredCount, submitted, onAnswer])

  const toggleOption = (optionId: string) => {
    if (submitted) return
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(optionId)) {
        next.delete(optionId)
      } else if (next.size < requiredCount) {
        next.add(optionId)
      }
      return next
    })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <p className="text-[#faf9f5] text-base leading-relaxed">{question.stem}</p>
        <p className="text-[#b0aea5] text-xs">
          Select {displayCount} — {selected.size}/{requiredCount} chosen
        </p>
        <div className="space-y-2">
          {question.options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => toggleOption(opt.id)}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                selected.has(opt.id)
                  ? 'bg-[#d97757]/20 border-[#d97757] text-[#d97757]'
                  : 'bg-[#1c1c1a] border-[#e8e6dc20] text-[#faf9f5] active:scale-[0.98]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                    selected.has(opt.id)
                      ? 'border-[#d97757] bg-[#d97757]'
                      : 'border-[#e8e6dc40]'
                  }`}
                >
                  {selected.has(opt.id) && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span>
                  <span className="font-semibold mr-2 text-sm uppercase">{opt.id}.</span>
                  {opt.text}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
