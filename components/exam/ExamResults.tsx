'use client'
import { ExamSession } from '@/types/exam'

interface ExamResultsProps {
  session: ExamSession
  onViewSummary: () => void
  onHome: () => void
}

const DOMAIN_NAMES: Record<string, string> = {
  '1': 'General Security Concepts',
  '2': 'Threats, Vulnerabilities & Mitigations',
  '3': 'Security Architecture',
  '4': 'Security Operations',
  '5': 'Security Program Management',
}

export function ExamResults({ session, onViewSummary, onHome }: ExamResultsProps) {
  const minutes = Math.floor(session.timeUsedSeconds / 60)
  const seconds = session.timeUsedSeconds % 60

  const wrongCount = session.answers.filter((a) => !a.correct).length

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
      {/* Score circle */}
      <div className="flex flex-col items-center">
        <div
          className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center ${
            session.passed
              ? 'border-[#788c5d] bg-[#788c5d]/10'
              : 'border-[#c0392b] bg-[#c0392b]/10'
          }`}
        >
          <span
            className={`text-3xl font-bold ${
              session.passed ? 'text-[#788c5d]' : 'text-[#c0392b]'
            }`}
          >
            {Math.round(session.percentage)}%
          </span>
          <span className="text-xs text-[#b0aea5]">
            {session.totalPointsEarned.toFixed(1)}/{session.totalPointsPossible}
          </span>
        </div>
        <p
          className={`mt-3 text-lg font-bold ${
            session.passed ? 'text-[#788c5d]' : 'text-[#c0392b]'
          }`}
        >
          {session.passed ? 'PASS' : 'FAIL'}
        </p>
        <p className="text-[#b0aea5] text-sm">
          Passing: 83% ({session.preset} exam)
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#1c1c1a] rounded-xl p-3 text-center border border-[#e8e6dc20]">
          <p className="text-2xl font-bold text-[#faf9f5]">{session.totalQuestions}</p>
          <p className="text-xs text-[#b0aea5]">Questions</p>
        </div>
        <div className="bg-[#1c1c1a] rounded-xl p-3 text-center border border-[#e8e6dc20]">
          <p className="text-2xl font-bold text-[#faf9f5]">
            {minutes}:{String(seconds).padStart(2, '0')}
          </p>
          <p className="text-xs text-[#b0aea5]">Time Used</p>
        </div>
        <div className="bg-[#1c1c1a] rounded-xl p-3 text-center border border-[#e8e6dc20]">
          <p className="text-2xl font-bold text-[#c0392b]">{wrongCount}</p>
          <p className="text-xs text-[#b0aea5]">Wrong</p>
        </div>
      </div>

      {/* Domain breakdown */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-[#b0aea5] uppercase tracking-wider">
          Domain Breakdown
        </h2>
        {[1, 2, 3, 4, 5].map((d) => {
          const dk = String(d)
          const data = session.domainBreakdown[dk]
          if (!data || data.possible === 0) return null
          const pct = data.percentage
          return (
            <div key={d} className="bg-[#1c1c1a] rounded-xl p-3 border border-[#e8e6dc20]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-[#faf9f5]">
                  D{d}: {DOMAIN_NAMES[dk]}
                </span>
                <span
                  className={`text-sm font-bold ${
                    pct >= 83 ? 'text-[#788c5d]' : pct >= 60 ? 'text-[#d97757]' : 'text-[#c0392b]'
                  }`}
                >
                  {Math.round(pct)}%
                </span>
              </div>
              <div className="h-1.5 bg-[#e8e6dc20] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    pct >= 83 ? 'bg-[#788c5d]' : pct >= 60 ? 'bg-[#d97757]' : 'bg-[#c0392b]'
                  }`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
              <p className="text-xs text-[#b0aea5] mt-1">
                {data.earned.toFixed(1)}/{data.possible} pts
              </p>
            </div>
          )
        })}
      </div>

      {/* Actions */}
      <div className="space-y-2 pb-4">
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
          className="w-full py-3 bg-[#1c1c1a] hover:bg-[#2a2a28] text-[#b0aea5] rounded-xl font-semibold border border-[#e8e6dc20] transition-colors active:scale-95"
        >
          Return Home
        </button>
      </div>
    </div>
  )
}
