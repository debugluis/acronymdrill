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
      {/* Header */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold text-[#d97757] font-sans tracking-wider">
            {entry.id}
          </h1>
          <p className="text-xl text-[#faf9f5] leading-snug">{entry.fullName}</p>
          <div className="flex gap-2 justify-center flex-wrap">
            <Badge type="domain" value={entry.domain} />
            <Badge type="category" value={entry.category} />
            <span className="px-2 py-0.5 rounded-full text-xs border border-[#e8e6dc20] bg-[#1c1c1a] text-[#b0aea5] flex items-center gap-0.5">
              {Array.from({ length: entry.difficulty }).map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-[#b0aea5] text-[#b0aea5]" />
              ))}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-[#141413] rounded-xl p-4">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-5 h-5 text-[#d97757] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-[#b0aea5] mb-1 uppercase tracking-wide">Mnemonic</p>
                <p className="text-[#faf9f5] text-sm leading-relaxed">{entry.mnemonic}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#141413] rounded-xl p-4">
            <div className="flex items-start gap-2">
              <Globe className="w-5 h-5 text-[#6a9bcc] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-[#b0aea5] mb-1 uppercase tracking-wide">Real World</p>
                <p className="text-[#faf9f5] text-sm leading-relaxed">{entry.realWorldExample}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#141413] rounded-xl p-4">
            <div className="flex items-start gap-2">
              <GraduationCap className="w-5 h-5 text-[#788c5d] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-[#b0aea5] mb-1 uppercase tracking-wide">Exam Tip</p>
                <p className="text-[#faf9f5] text-sm leading-relaxed">{entry.examTip}</p>
              </div>
            </div>
          </div>

          {entry.confusedWith && entry.confusedWith.length > 0 && (
            <div className="bg-[#141413] rounded-xl p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-[#d97757] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-[#b0aea5] mb-1 uppercase tracking-wide">Commonly Confused With</p>
                  <p className="text-[#faf9f5] text-sm">{entry.confusedWith.join(', ')}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between p-4 border-t border-[#e8e6dc20] bg-[#141413]">
        <button
          onClick={() => speakPhonetic(entry.phonetic)}
          className="flex items-center gap-2 text-[#6a9bcc] hover:text-[#7ab3e0] transition-colors px-3 py-2 rounded-xl"
        >
          <Volume2 className="w-5 h-5" />
          <span className="text-sm">{entry.phonetic}</span>
        </button>
        <button
          onClick={handleExplain}
          className="flex items-center gap-2 text-[#b0aea5] hover:text-[#faf9f5] transition-colors px-3 py-2 rounded-xl border border-[#e8e6dc20]"
        >
          <span className="text-sm">Explain differently</span>
          <Sparkles className="w-4 h-4" />
        </button>
      </div>

      {/* Swipe hint */}
      <div className="flex items-center justify-between px-6 pb-4 bg-[#141413] text-xs text-[#b0aea5]">
        <span>← needs practice</span>
        <span>confident →</span>
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
