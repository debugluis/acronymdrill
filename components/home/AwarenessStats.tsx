'use client'
import { AcronymProgress } from '@/types'

interface AwarenessStatsProps {
  progressMap: Map<string, AcronymProgress>
  totalAcronyms: number
  totalStudyMinutes: number
  weeklyActivity: Record<string, boolean>
}

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export function AwarenessStats({
  progressMap,
  totalAcronyms,
  totalStudyMinutes,
  weeklyActivity,
}: AwarenessStatsProps) {
  const seen = Array.from(progressMap.values()).filter((p) => p.timesSeenInTraining > 0).length
  const tested = Array.from(progressMap.values()).filter(
    (p) => p.timesTestedCorrect + p.timesTestedWrong > 0
  ).length

  return (
    <div className="px-4 py-2 space-y-2">
      <h3 className="text-xs font-semibold text-[#b0aea5] uppercase tracking-wider">Awareness</h3>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-[#1c1c1a] rounded-xl p-2.5 border border-[#e8e6dc20]">
          <p className="text-[10px] text-[#b0aea5]">Asked about</p>
          <p className="text-base font-semibold text-[#faf9f5] font-sans">{tested} / {totalAcronyms}</p>
        </div>
        <div className="bg-[#1c1c1a] rounded-xl p-2.5 border border-[#e8e6dc20]">
          <p className="text-[10px] text-[#b0aea5]">Cards seen</p>
          <p className="text-base font-semibold text-[#faf9f5] font-sans">{seen} / {totalAcronyms}</p>
        </div>
        <div className="bg-[#1c1c1a] rounded-xl p-2.5 border border-[#e8e6dc20]">
          <p className="text-[10px] text-[#b0aea5]">Total study time</p>
          <p className="text-base font-semibold text-[#faf9f5] font-sans">{formatTime(totalStudyMinutes)}</p>
        </div>
        <div className="bg-[#1c1c1a] rounded-xl p-2.5 border border-[#e8e6dc20]">
          <p className="text-[10px] text-[#b0aea5]">Mastered</p>
          <p className="text-base font-semibold text-[#faf9f5] font-sans">
            {Array.from(progressMap.values()).filter((p) => p.masteryLevel === 'mastered').length}
          </p>
        </div>
      </div>

      {/* Weekly activity — dots with day letter labels */}
      <div className="flex gap-2 justify-center py-1">
        {DAY_KEYS.map((key, i) => (
          <div key={key} className="flex flex-col items-center gap-0.5">
            <div className={`w-2 h-2 rounded-full ${weeklyActivity[key] ? 'bg-[#d97757]' : 'bg-[#e8e6dc30]'}`} />
            <span className="text-[9px] text-[#b0aea5]">{DAY_LABELS[i]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
