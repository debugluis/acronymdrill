'use client'
import { useState, useEffect, useRef } from 'react'
import { ExamQuestion, ExamAnswer } from '@/types/exam'
import { User } from 'firebase/auth'
import { updateExamSessionSummary } from '@/lib/exam-firestore'

interface AISummaryProps {
  wrongAnswers: { question: ExamQuestion; answer: ExamAnswer }[]
  user: User
  sessionId: string
  existingSummary?: string
  onBack: () => void
}

export function AISummary({ wrongAnswers, user, sessionId, existingSummary, onBack }: AISummaryProps) {
  const [summary, setSummary] = useState(existingSummary ?? '')
  const [loading, setLoading] = useState(!existingSummary)
  const [error, setError] = useState<string | null>(null)
  const fetched = useRef(false)

  useEffect(() => {
    if (existingSummary || fetched.current) return
    fetched.current = true

    const fetchSummary = async () => {
      try {
        const token = await user.getIdToken()
        const payload = wrongAnswers.map((w) => ({
          id: w.question.id,
          stem: w.question.stem,
          topic: w.question.topic,
          domain: w.question.domain,
          explanation: w.question.explanation,
        }))

        const res = await fetch('/api/exam-summary', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ wrongQuestions: payload }),
        })

        if (!res.ok) throw new Error('Failed to generate summary')

        const data = await res.json()
        setSummary(data.summary)
        setLoading(false)

        // Save to Firestore in background — don't block UI
        updateExamSessionSummary(user.uid, sessionId, data.summary).catch(console.error)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate summary')
        setLoading(false)
      }
    }

    fetchSummary()
  }, [wrongAnswers, user, sessionId, existingSummary])

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="w-10 h-10 border-2 border-[#d97757] border-t-transparent rounded-full animate-spin" />
            <p className="text-[#b0aea5] text-sm">Generating your personalized study summary...</p>
            <p className="text-[#b0aea5]/50 text-xs">Analyzing {wrongAnswers.length} missed questions</p>
          </div>
        )}

        {error && (
          <div className="bg-[#c0392b]/10 border border-[#c0392b]/30 rounded-xl p-4">
            <p className="text-[#c0392b] text-sm">{error}</p>
          </div>
        )}

        {!loading && summary && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[#d97757]">Study Summary</h2>
            <div className="prose prose-invert max-w-none">
              {summary.split('\n').map((line, i) => {
                if (!line.trim()) return <div key={i} className="h-3" />
                if (line.startsWith('## ')) {
                  return (
                    <h3 key={i} className="text-base font-bold text-[#faf9f5] mt-4 mb-2">
                      {line.replace('## ', '')}
                    </h3>
                  )
                }
                if (line.startsWith('### ')) {
                  return (
                    <h4 key={i} className="text-sm font-bold text-[#d97757] mt-3 mb-1">
                      {line.replace('### ', '')}
                    </h4>
                  )
                }
                if (line.startsWith('- ')) {
                  return (
                    <p key={i} className="text-sm text-[#faf9f5] pl-3 py-0.5 border-l-2 border-[#d97757]/30">
                      {line.replace('- ', '')}
                    </p>
                  )
                }
                return (
                  <p key={i} className="text-sm text-[#faf9f5]/90 leading-relaxed">
                    {line}
                  </p>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-3 border-t border-[#e8e6dc20]">
        <button
          onClick={onBack}
          className="w-full py-3 bg-[#1c1c1a] hover:bg-[#2a2a28] text-[#b0aea5] rounded-xl font-semibold border border-[#e8e6dc20] transition-colors active:scale-95"
        >
          Back to Results
        </button>
      </div>
    </div>
  )
}
