'use client'
import { useState } from 'react'
import { Question } from '@/types'
import { hapticCorrect, hapticWrong } from '@/lib/haptics'

interface MatchPairsProps {
  question: Question
  onAnswer: (correct: boolean, selected: string) => void
}

export function MatchPairs({ question, onAnswer }: MatchPairsProps) {
  const pairs = question.pairItems ?? []
  const acronyms = pairs.map((p) => p.left)
  const [definitions] = useState(() =>
    pairs.map((p) => p.right).sort(() => Math.random() - 0.5)
  )

  const [selectedAcronym, setSelectedAcronym] = useState<string | null>(null)
  const [matched, setMatched] = useState<Record<string, string>>({})
  const [wrong, setWrong] = useState<{ acr: string; def: string } | null>(null)
  const [done, setDone] = useState(false)

  const correctMap = Object.fromEntries(pairs.map((p) => [p.left, p.right]))

  const handleAcronymClick = (acr: string) => {
    if (done || matched[acr]) return
    setSelectedAcronym(acr)
  }

  const handleDefClick = (def: string) => {
    if (done || !selectedAcronym) return
    const isCorrect = correctMap[selectedAcronym] === def
    if (isCorrect) {
      const newMatched = { ...matched, [selectedAcronym]: def }
      setMatched(newMatched)
      setSelectedAcronym(null)
      hapticCorrect()
      if (Object.keys(newMatched).length === pairs.length) {
        setDone(true)
        onAnswer(true, 'all-correct')
      }
    } else {
      setWrong({ acr: selectedAcronym, def })
      hapticWrong()
      setTimeout(() => {
        setWrong(null)
        setSelectedAcronym(null)
      }, 600)
    }
  }

  const getAcrStyle = (acr: string) => {
    if (matched[acr]) return 'bg-[#788c5d]/20 border-[#788c5d] text-[#788c5d]'
    if (wrong?.acr === acr) return 'bg-[#c0392b]/20 border-[#c0392b] text-[#c0392b]'
    if (selectedAcronym === acr) return 'bg-[#d97757]/20 border-[#d97757] text-[#d97757]'
    return 'bg-[#1c1c1a] border-[#e8e6dc20] text-[#faf9f5]'
  }

  const getDefStyle = (def: string) => {
    const matchedAcr = Object.entries(matched).find(([, d]) => d === def)?.[0]
    if (matchedAcr) return 'bg-[#788c5d]/20 border-[#788c5d] text-[#788c5d]'
    if (wrong?.def === def) return 'bg-[#c0392b]/20 border-[#c0392b] text-[#c0392b]'
    return 'bg-[#1c1c1a] border-[#e8e6dc20] text-[#faf9f5]'
  }

  return (
    <div className="flex flex-col h-full px-4 py-4 gap-4">
      <div className="text-center">
        <p className="text-xs text-[#b0aea5] uppercase tracking-wide mb-1">Match each acronym to its meaning</p>
        <p className="text-xs text-[#b0aea5]">Tap an acronym, then tap its definition</p>
      </div>
      <div className="flex gap-3 flex-1">
        {/* Acronyms */}
        <div className="flex-1 flex flex-col gap-2">
          {acronyms.map((acr) => (
            <button
              key={acr}
              onClick={() => handleAcronymClick(acr)}
              className={`w-full py-3 px-2 rounded-xl border text-sm font-bold font-sans transition-all ${getAcrStyle(acr)}`}
            >
              {acr}
            </button>
          ))}
        </div>
        {/* Definitions */}
        <div className="flex-1 flex flex-col gap-2">
          {definitions.map((def) => (
            <button
              key={def}
              onClick={() => handleDefClick(def)}
              className={`w-full py-3 px-2 rounded-xl border text-xs transition-all text-left leading-tight ${getDefStyle(def)}`}
            >
              {def}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
