'use client'
import { ExamSession } from '@/types/exam'

interface ExamResultsProps {
  session: ExamSession
  onViewSummary: () => void
  onHome: () => void
}

const DOMAIN_NAMES: Record<string, string> = {
  '1': 'General Security Concepts',
  '2': 'Threats, Vulns & Mitigations',
  '3': 'Security Architecture',
  '4': 'Security Operations',
  '5': 'Program Management',
}

export function ExamResults({ session, onViewSummary, onHome }: ExamResultsProps) {
  const minutes = Math.floor(session.timeUsedSeconds / 60)
  const seconds = session.timeUsedSeconds % 60
  const wrongCount = session.answers.filter((a) => !a.correct).length

  return (
    <div className="flex-1 flex flex-col px-4 py-3 overflow-hidden">
      {/* Score + PASS/FAIL + stats row */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-20 h-20 rounded-full border-[3px] flex flex-col items-center justify-center flex-shrink-0 ${
            session.passed
              ? 'border-[#788c5d] bg-[#788c5d]/10'
              : 'border-[#c0392b] bg-[#c0392b]/10'
          }`}
        >
          <span
            className={`text-xl font-bold ${
              session.passed ? 'text-[#788c5d]' : 'text-[#c0392b]'
            }`}
          >
            {Math.round(session.percentage)}%
          </span>
          <span className="text-[10px] text-[#b0aea5]">
            {session.totalPointsEarned.toFixed(1)}/{session.totalPointsPossible}
          </span>
        </div>
        <div className="flex-1 space-y-1">
          <p
            className={`text-lg font-bold ${
              session.passed ? 'text-[#788c5d]' : 'text-[#c0392b]'
            }`}
          >
            {session.passed ? 'PASS' : 'FAIL'}
          </p>
          <div className="flex gap-3 text-xs text-[#b0aea5]">
            <span>{session.totalQuestions} questions</span>
            <span>{minutes}:{String(seconds).padStart(2, '0')} used</span>
            <span className="text-[#c0392b]">{wrongCount} wrong</span>
          </div>
          <p className="text-[10px] text-[#b0aea5]">Passing: 83% ({session.preset})</p>
        </div>
      </div>

      {/* Domain breakdown */}
      <div className="flex-1 overflow-y-auto space-y-1.5 min-h-0">
        <h2 className="text-xs font-semibold text-[#b0aea5] uppercase tracking-wider">
          Domain Breakdown
        </h2>
        {[1, 2, 3, 4, 5].map((d) => {
          const dk = String(d)
          const data = session.domainBreakdown[dk]
          if (!data || data.possible === 0) return null
          const pct = data.percentage
          return (
            <div key={d} className="bg-[#1c1c1a] rounded-lg px-3 py-2 border border-[#e8e6dc20]">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-[#faf9f5]">
                  D{d}: {DOMAIN_NAMES[dk]}
                </span>
                <span
                  className={`text-xs font-bold ${
                    pct >= 83 ? 'text-[#788c5d]' : pct >= 60 ? 'text-[#d97757]' : 'text-[#c0392b]'
                  }`}
                >
                  {Math.round(pct)}%
                </span>
              </div>
              <div className="h-1 bg-[#e8e6dc20] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    pct >= 83 ? 'bg-[#788c5d]' : pct >= 60 ? 'bg-[#d97757]' : 'bg-[#c0392b]'
                  }`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Actions */}
      <div className="space-y-2 pt-3">
        {wrongCount > 0 && (
          <button
            onClick={onViewSummary}
            className="w-full py-3 bg-[#d97757] hover:bg-[#c86846] text-white rounded-xl font-semibold transition-colors active:scale-95"
          >
            View AI Study Summary
          </button>
        )}
        <button
          onClick={onHome}
          className="w-full py-2.5 bg-[#1c1c1a] hover:bg-[#2a2a28] text-[#b0aea5] rounded-xl font-semibold border border-[#e8e6dc20] transition-colors active:scale-95 text-sm"
        >
          Return Home
        </button>
      </div>
    </div>
  )
}
