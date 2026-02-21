'use client'
import { AcronymProgress } from '@/types'
import { AcronymEntry } from '@/types'

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

const DOW = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

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
    <div className="px-4 py-4 space-y-3">
      <h3 className="text-sm font-semibold text-[#b0aea5] uppercase tracking-wider">Awareness</h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#1c1c1a] rounded-xl p-3 border border-[#e8e6dc20]">
          <p className="text-xs text-[#b0aea5]">Asked about</p>
          <p className="text-lg font-semibold text-[#faf9f5] font-poppins">{tested} / {totalAcronyms}</p>
        </div>
        <div className="bg-[#1c1c1a] rounded-xl p-3 border border-[#e8e6dc20]">
          <p className="text-xs text-[#b0aea5]">Cards seen</p>
          <p className="text-lg font-semibold text-[#faf9f5] font-poppins">{seen} / {totalAcronyms}</p>
        </div>
        <div className="bg-[#1c1c1a] rounded-xl p-3 border border-[#e8e6dc20]">
          <p className="text-xs text-[#b0aea5]">Total study time</p>
          <p className="text-lg font-semibold text-[#faf9f5] font-poppins">{formatTime(totalStudyMinutes)}</p>
        </div>
        <div className="bg-[#1c1c1a] rounded-xl p-3 border border-[#e8e6dc20]">
          <p className="text-xs text-[#b0aea5]">Mastered</p>
          <p className="text-lg font-semibold text-[#faf9f5] font-poppins">
            {Array.from(progressMap.values()).filter((p) => p.masteryLevel === 'mastered').length}
          </p>
        </div>
      </div>

      <div className="bg-[#1c1c1a] rounded-xl p-3 border border-[#e8e6dc20]">
        <p className="text-xs text-[#b0aea5] mb-2">This week</p>
        <div className="flex gap-2 justify-between">
          {DAY_KEYS.map((key, i) => (
            <div key={key} className="flex flex-col items-center gap-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                  weeklyActivity[key]
                    ? 'bg-[#d97757] text-white'
                    : 'bg-[#e8e6dc10] text-[#b0aea5]'
                }`}
              >
                {DOW[i]}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
