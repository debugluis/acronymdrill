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

  const [selectedAcr, setSelectedAcr] = useState<string | null>(null)
  const [selectedDef, setSelectedDef] = useState<string | null>(null)
  const [matched, setMatched] = useState<Record<string, string>>({})
  const [wrong, setWrong] = useState<{ acr: string; def: string } | null>(null)
  const [done, setDone] = useState(false)

  const correctMap = Object.fromEntries(pairs.map((p) => [p.left, p.right]))

  const tryMatch = (acr: string, def: string) => {
    const isCorrect = correctMap[acr] === def
    if (isCorrect) {
      const newMatched = { ...matched, [acr]: def }
      setMatched(newMatched)
      setSelectedAcr(null)
      setSelectedDef(null)
      hapticCorrect()
      if (Object.keys(newMatched).length === pairs.length) {
        setDone(true)
        onAnswer(true, 'all-correct')
      }
    } else {
      setWrong({ acr, def })
      hapticWrong()
      setTimeout(() => {
        setWrong(null)
        setSelectedAcr(null)
        setSelectedDef(null)
      }, 400)
    }
  }

  const handleAcronymClick = (acr: string) => {
    if (done || matched[acr]) return
    if (selectedDef !== null) {
      setSelectedAcr(acr)
      tryMatch(acr, selectedDef)
    } else {
      setSelectedAcr((prev) => (prev === acr ? null : acr))
    }
  }

  const handleDefClick = (def: string) => {
    if (done) return
    if (Object.values(matched).includes(def)) return
    if (selectedAcr !== null) {
      setSelectedDef(def)
      tryMatch(selectedAcr, def)
    } else {
      setSelectedDef((prev) => (prev === def ? null : def))
    }
  }

  const getAcrStyle = (acr: string) => {
    if (matched[acr]) return 'bg-[#788c5d]/20 border-[#788c5d] text-[#788c5d]'
    if (wrong?.acr === acr) return 'bg-[#c0392b]/20 border-[#c0392b] text-[#c0392b]'
    if (selectedAcr === acr) return 'bg-[#d97757]/20 border-[#d97757] text-[#d97757]'
    return 'bg-[#1c1c1a] border-[#e8e6dc20] text-[#faf9f5]'
  }

  const getDefStyle = (def: string) => {
    const matchedAcr = Object.entries(matched).find(([, d]) => d === def)?.[0]
    if (matchedAcr) return 'bg-[#788c5d]/20 border-[#788c5d] text-[#788c5d]'
    if (wrong?.def === def) return 'bg-[#c0392b]/20 border-[#c0392b] text-[#c0392b]'
    if (selectedDef === def) return 'bg-[#d97757]/20 border-[#d97757] text-[#d97757]'
    return 'bg-[#1c1c1a] border-[#e8e6dc20] text-[#faf9f5]'
  }

  return (
    <div className="flex flex-col flex-1 px-4 py-4 gap-3 justify-center">
      <div className="text-center">
        <p className="text-xs text-[#b0aea5] uppercase tracking-wide mb-0.5">Match each acronym to its meaning</p>
        <p className="text-xs text-[#b0aea5]">Tap either side first, then tap its match</p>
      </div>

      {/* Row-based layout: each row has one acronym + one definition, ensuring vertical alignment */}
      <div className="flex flex-col gap-2">
        {pairs.map((_, i) => (
          <div key={i} className="flex gap-3 h-16">
            <button
              onClick={() => handleAcronymClick(acronyms[i])}
              className={`flex-1 px-2 rounded-xl border text-sm font-bold font-sans transition-all flex items-center justify-center ${getAcrStyle(acronyms[i])}`}
            >
              {acronyms[i]}
            </button>
            <button
              onClick={() => handleDefClick(definitions[i])}
              className={`flex-1 px-2 rounded-xl border text-xs transition-all text-left leading-tight flex items-center ${getDefStyle(definitions[i])}`}
            >
              {definitions[i]}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
