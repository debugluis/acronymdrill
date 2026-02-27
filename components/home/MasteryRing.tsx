'use client'

interface MasteryRingProps {
  percent: number
  total: number
  mastered: number
}

export function MasteryRing({ percent, total, mastered }: MasteryRingProps) {
  const radius = 60
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (percent / 100) * circumference

  return (
    <div className="flex flex-col items-center py-2">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 144 144">
          <circle
            cx="72"
            cy="72"
            r={radius}
            fill="none"
            stroke="#e8e6dc20"
            strokeWidth="10"
          />
          <circle
            cx="72"
            cy="72"
            r={radius}
            fill="none"
            stroke="#d97757"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-[#d97757] font-sans">{Math.round(percent)}%</span>
          <span className="text-xs text-[#b0aea5] mt-0.5">mastery</span>
          <span className="text-[10px] text-[#b0aea5]">{mastered}/{total}</span>
        </div>
      </div>
    </div>
  )
}
