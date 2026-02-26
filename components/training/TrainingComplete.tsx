'use client'
import { useRouter } from 'next/navigation'
import { HapticButton } from '@/components/ui/HapticButton'
import { Trophy, TrendingUp } from 'lucide-react'

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
      <div>{pct >= 70 ? <Trophy className="w-16 h-16 text-[#d97757]" /> : <TrendingUp className="w-16 h-16 text-[#6a9bcc]" />}</div>
      <div>
        <h2 className="text-3xl font-bold font-sans text-[#faf9f5] mb-2">Session Complete!</h2>
        <p className="text-[#b0aea5]">Here's how you did:</p>
      </div>

      <div className="w-full bg-[#1c1c1a] rounded-2xl p-6 border border-[#e8e6dc20] space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-[#788c5d] font-semibold">Confident</span>
          <span className="text-2xl font-bold font-sans text-[#faf9f5]">{stats.confident}</span>
        </div>
        <div className="h-px bg-[#e8e6dc20]" />
        <div className="flex justify-between items-center">
          <span className="text-[#c0392b] font-semibold">Needs Practice</span>
          <span className="text-2xl font-bold font-sans text-[#faf9f5]">{stats.practice}</span>
        </div>
        <div className="h-px bg-[#e8e6dc20]" />
        <div className="flex justify-between items-center">
          <span className="text-[#b0aea5]">Confidence Rate</span>
          <span className="text-2xl font-bold font-sans text-[#d97757]">{pct}%</span>
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
