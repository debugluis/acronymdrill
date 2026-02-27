'use client'

interface ProgressBarProps {
  current: number
  total: number
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percent = total > 0 ? ((total - current) / total) * 100 : 0

  return (
    <div className="px-4 pt-2 pb-1">
      <div className="flex items-center text-xs text-[#b0aea5] mb-1">
        <span>Question {total - current + 1} of {total}</span>
      </div>
      <div className="h-1.5 bg-[#e8e6dc20] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#d97757] rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
