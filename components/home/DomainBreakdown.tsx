'use client'

interface DomainStat {
  domain: number
  label: string
  percent: number
  mastered: number
  total: number
}

interface DomainBreakdownProps {
  stats: DomainStat[]
}

const domainLabels: Record<number, string> = {
  1: 'D1 General',
  2: 'D2 Threats',
  3: 'D3 Architecture',
  4: 'D4 Operations',
  5: 'D5 Program',
}

function getBarColor(percent: number): string {
  if (percent >= 80) return 'bg-[#788c5d]'
  if (percent >= 50) return 'bg-[#d97757]'
  return 'bg-[#c0392b]'
}

export function DomainBreakdown({ stats }: DomainBreakdownProps) {
  return (
    <div className="px-4 py-2 space-y-3">
      <h3 className="text-sm font-semibold text-[#b0aea5] uppercase tracking-wider">Domain Progress</h3>
      {stats.map((s) => (
        <div key={s.domain} className="space-y-1">
          <div className="flex justify-between text-xs text-[#b0aea5]">
            <span>{domainLabels[s.domain] ?? `D${s.domain}`}</span>
            <span>{s.mastered}/{s.total}</span>
          </div>
          <div className="h-2 bg-[#e8e6dc20] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${getBarColor(s.percent)}`}
              style={{ width: `${s.percent}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
