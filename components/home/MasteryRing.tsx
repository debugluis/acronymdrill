'use client'

interface MasteryRingProps {
  percent: number
  total: number
  mastered: number
}

export function MasteryRing({ percent, total, mastered }: MasteryRingProps) {
  const radius = 80
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (percent / 100) * circumference

  return (
    <div className="flex flex-col items-center py-4">
      <div className="relative w-48 h-48">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 192 192">
          <circle
            cx="96"
            cy="96"
            r={radius}
            fill="none"
            stroke="#e8e6dc20"
            strokeWidth="12"
          />
          <circle
            cx="96"
            cy="96"
            r={radius}
            fill="none"
            stroke="#d97757"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-[#d97757] font-sans">{Math.round(percent)}%</span>
          <span className="text-sm text-[#b0aea5] mt-1">mastery</span>
          <span className="text-xs text-[#b0aea5]">{mastered}/{total}</span>
        </div>
      </div>
    </div>
  )
}
