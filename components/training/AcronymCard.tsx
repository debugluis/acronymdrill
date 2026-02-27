'use client'
import { useState, useEffect } from 'react'
import { AcronymEntry } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { autoPlayPhonetic, speakPhonetic } from '@/lib/speech'
import { Star, Lightbulb, Globe, GraduationCap, AlertTriangle, Volume2, Sparkles } from 'lucide-react'

interface AcronymCardProps {
  entry: AcronymEntry
  isNew?: boolean
}

export function AcronymCard({ entry, isNew }: AcronymCardProps) {
  const [explainOpen, setExplainOpen] = useState(false)
  const [explanation, setExplanation] = useState('')
  const [loadingExplain, setLoadingExplain] = useState(false)

  useEffect(() => {
    if (isNew) {
      autoPlayPhonetic(entry.phonetic, 300)
    }
  }, [entry.id, isNew])

  const handleExplain = async () => {
    setExplainOpen(true)
    setExplanation('')
    setLoadingExplain(true)
    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: entry.id, fullName: entry.fullName }),
      })
      const data = await res.json()
      setExplanation(data.explanation ?? 'No explanation available.')
    } catch {
      setExplanation('Failed to load explanation. Check your connection.')
    } finally {
      setLoadingExplain(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#1c1c1a] rounded-2xl border border-[#e8e6dc20] overflow-hidden">
      {/* Content */}
      <div className="flex-1 overflow-hidden p-3 space-y-1.5 min-h-0">
        {/* Header */}
        <div className="text-center space-y-1 pt-1">
          {/* Acronym + pronunciation on same line, centered as a unit */}
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-4xl font-bold text-[#d97757] font-sans tracking-wider">
              {entry.id}
            </h1>
            <button
              onClick={() => speakPhonetic(entry.phonetic)}
              className="p-1 rounded-lg text-[#6a9bcc] hover:text-[#7ab3e0] transition-colors"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-[#faf9f5] leading-snug">{entry.fullName}</p>
          <div className="flex gap-1.5 justify-center flex-wrap">
            <Badge type="domain" value={entry.domain} />
            <Badge type="category" value={entry.category} />
            <span className="px-1.5 py-0.5 rounded-full text-[10px] border border-[#e8e6dc20] bg-[#1c1c1a] text-[#b0aea5] flex items-center gap-0.5">
              {Array.from({ length: entry.difficulty }).map((_, i) => (
                <Star key={i} className="w-2.5 h-2.5 fill-[#b0aea5] text-[#b0aea5]" />
              ))}
            </span>
          </div>
        </div>

        {/* Info sections */}
        <div className="space-y-1.5">
          <div className="bg-[#141413] rounded-xl p-2">
            <div className="flex items-start gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-[#d97757] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-[#b0aea5] mb-0.5 uppercase tracking-wide">Mnemonic</p>
                <p className="text-[#faf9f5] text-xs leading-relaxed">{entry.mnemonic}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#141413] rounded-xl p-2">
            <div className="flex items-start gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#6a9bcc] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-[#b0aea5] mb-0.5 uppercase tracking-wide">Real World</p>
                <p className="text-[#faf9f5] text-xs leading-relaxed">{entry.realWorldExample}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#141413] rounded-xl p-2">
            <div className="flex items-start gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-[#788c5d] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-[#b0aea5] mb-0.5 uppercase tracking-wide">Exam Tip</p>
                <p className="text-[#faf9f5] text-xs leading-relaxed">{entry.examTip}</p>
              </div>
            </div>
          </div>

          {entry.confusedWith && entry.confusedWith.length > 0 && (
            <div className="bg-[#141413] rounded-xl p-2">
              <div className="flex items-start gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-[#d97757] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] text-[#b0aea5] mb-0.5 uppercase tracking-wide">Commonly Confused With</p>
                  <p className="text-[#faf9f5] text-xs">{entry.confusedWith.join(', ')}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Explain differently — bottom center */}
      <div className="flex justify-center pb-2 pt-1.5 border-t border-[#e8e6dc20]">
        <button
          onClick={handleExplain}
          className="flex items-center gap-1.5 text-[#b0aea5] hover:text-[#faf9f5] transition-colors text-xs px-3 py-1.5 rounded-xl border border-[#e8e6dc20]"
        >
          <Sparkles className="w-3 h-3" />
          <span>Explain differently</span>
        </button>
      </div>

      {/* Explain sheet */}
      <BottomSheet isOpen={explainOpen} onClose={() => setExplainOpen(false)} title="Different Explanation">
        {loadingExplain ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-2 border-[#d97757] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <p className="text-[#faf9f5] leading-relaxed">{explanation}</p>
        )}
      </BottomSheet>
    </div>
  )
}
