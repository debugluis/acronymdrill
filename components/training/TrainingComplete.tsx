'use client'
import { useRouter } from 'next/navigation'
import { HapticButton } from '@/components/ui/HapticButton'

interface TrainingCompleteProps {
  stats: { confident: number; practice: number }
  onTrainAgain: () => void
}

export function TrainingComplete({ stats, onTrainAgain }: TrainingCompleteProps) {
  const router = useRouter()
  const total = stats.confident + stats.practice
  const pct = total > 0 ? Math.round((stats.confident / total) * 100) : 0

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center gap-6">
      <div className="text-6xl">{pct >= 70 ? '🎉' : '💪'}</div>
      <div>
        <h2 className="text-3xl font-bold font-poppins text-[#faf9f5] mb-2">Session Complete!</h2>
        <p className="text-[#b0aea5] font-lora">Here's how you did:</p>
      </div>

      <div className="w-full bg-[#1c1c1a] rounded-2xl p-6 border border-[#e8e6dc20] space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-[#788c5d] font-semibold">Confident</span>
          <span className="text-2xl font-bold font-poppins text-[#faf9f5]">{stats.confident}</span>
        </div>
        <div className="h-px bg-[#e8e6dc20]" />
        <div className="flex justify-between items-center">
          <span className="text-[#c0392b] font-semibold">Needs Practice</span>
          <span className="text-2xl font-bold font-poppins text-[#faf9f5]">{stats.practice}</span>
        </div>
        <div className="h-px bg-[#e8e6dc20]" />
        <div className="flex justify-between items-center">
          <span className="text-[#b0aea5]">Confidence Rate</span>
          <span className="text-2xl font-bold font-poppins text-[#d97757]">{pct}%</span>
        </div>
      </div>

      <div className="w-full space-y-3">
        <HapticButton variant="primary" className="w-full py-4" onClick={onTrainAgain}>
          Train Again
        </HapticButton>
        <HapticButton variant="ghost" className="w-full py-3" onClick={() => router.push('/')}>
          Go Home
        </HapticButton>
      </div>
    </div>
  )
}
