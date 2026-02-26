'use client'
import { useState, useRef } from 'react'
import { Question } from '@/types'
import { hapticCorrect, hapticWrong } from '@/lib/haptics'

interface FillBlankProps {
  question: Question
  onAnswer: (correct: boolean, selected: string) => void
}

export function FillBlank({ question, onAnswer }: FillBlankProps) {
  const [input, setInput] = useState('')
  const [answered, setAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = () => {
    if (answered || !input.trim()) return
    const correct = input.trim().toUpperCase() === question.correctAnswer.toUpperCase()
    setAnswered(true)
    setIsCorrect(correct)
    if (correct) hapticCorrect()
    else hapticWrong()
    onAnswer(correct, input.trim())
  }

  return (
    <div className="flex flex-col h-full px-4 py-4 gap-4">
      <div className="text-center py-4">
        <p className="text-xs text-[#b0aea5] mb-3 uppercase tracking-wide">Fill in the acronym</p>
        <div className="bg-[#1c1c1a] rounded-xl border border-[#e8e6dc20] p-5">
          <p className="text-xl font-semibold text-[#faf9f5]">
            <span className={`font-bold font-sans text-2xl ${answered ? (isCorrect ? 'text-[#788c5d]' : 'text-[#c0392b]') : 'text-[#d97757]'}`}>
              {answered ? question.correctAnswer : '___'}
            </span>
            <span className="text-[#b0aea5]"> = </span>
            {question.acronym.fullName}
          </p>
        </div>
      </div>

      {!answered && (
        <div className="space-y-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Type the acronym..."
            autoFocus
            className="w-full bg-[#1c1c1a] border border-[#e8e6dc20] rounded-xl px-4 py-3 text-[#faf9f5] text-center text-xl font-bold font-sans tracking-widest focus:outline-none focus:border-[#d97757]"
          />
          <button
            onClick={handleSubmit}
            className="w-full py-3 bg-[#d97757] text-white rounded-xl font-semibold"
          >
            Submit
          </button>
        </div>
      )}

      {answered && (
        <div className={`rounded-xl p-4 border ${isCorrect ? 'bg-[#788c5d]/10 border-[#788c5d]/40' : 'bg-[#c0392b]/10 border-[#c0392b]/40'}`}>
          <p className="text-center font-semibold">
            {isCorrect ? '✓ Correct!' : `✗ You wrote: ${input} — correct: ${question.correctAnswer}`}
          </p>
        </div>
      )}
    </div>
  )
}
