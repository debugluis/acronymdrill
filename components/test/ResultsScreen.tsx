'use client'
import { useRouter } from 'next/navigation'
import { HapticButton } from '@/components/ui/HapticButton'

interface DomainResult {
  domain: number
  correct: number
  total: number
}

interface ResultsScreenProps {
  correct: number
  total: number
  durationSeconds: number
  domainResults: DomainResult[]
}

const domainLabels: Record<number, string> = {
  1: 'D1 General',
  2: 'D2 Threats',
  3: 'D3 Architecture',
  4: 'D4 Operations',
  5: 'D5 Program',
}

function getGradeColor(pct: number): string {
  if (pct >= 80) return 'text-[#788c5d]'
  if (pct >= 60) return 'text-[#d97757]'
  return 'text-[#c0392b]'
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function ResultsScreen({ correct, total, durationSeconds, domainResults }: ResultsScreenProps) {
  const router = useRouter()
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0
  const gradeColor = getGradeColor(pct)

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-8">
      {/* Header */}
      <div className="text-center px-6 pt-8 pb-4">
        <p className="text-[#b0aea5] text-sm mb-2">Your Score</p>
        <p className={`text-6xl font-bold font-sans ${gradeColor}`}>{pct}%</p>
        <p className="text-2xl font-semibold text-[#faf9f5] mt-1">{correct} / {total}</p>
        <p className="text-[#b0aea5] text-sm mt-2">Time: {formatTime(durationSeconds)}</p>
      </div>

      {/* Domain breakdown */}
      <div className="px-4 pb-4 space-y-3">
        <h3 className="text-sm font-semibold text-[#b0aea5] uppercase tracking-wider">Domain Breakdown</h3>
        {domainResults.map((d) => {
          const domainPct = d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0
          const isWeakest = domainResults
            .filter((r) => r.total > 0)
            .sort((a, b) => (a.correct / a.total) - (b.correct / b.total))[0]?.domain === d.domain
          return (
            <div key={d.domain} className={`space-y-1 ${isWeakest && d.total > 0 ? 'opacity-100' : ''}`}>
              <div className="flex justify-between text-xs">
                <span className={`${isWeakest && d.total > 0 ? 'text-[#c0392b]' : 'text-[#b0aea5]'}`}>
                  {domainLabels[d.domain]}{isWeakest && d.total > 0 ? ' ← weakest' : ''}
                </span>
                <span className="text-[#b0aea5]">{d.correct}/{d.total}</span>
              </div>
              <div className="h-2 bg-[#e8e6dc20] rounded-full">
                <div
                  className={`h-full rounded-full ${getGradeColor(domainPct).replace('text-', 'bg-')}`}
                  style={{ width: `${domainPct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <div className="px-4 mt-auto">
        <HapticButton variant="primary" className="w-full py-4" onClick={() => router.push('/')}>
          Done
        </HapticButton>
      </div>
    </div>
  )
}
