'use client'
import { useRouter } from 'next/navigation'
import { HapticButton } from '@/components/ui/HapticButton'
import { Brain, ClipboardList, Zap } from 'lucide-react'

export function QuickLaunch() {
  const router = useRouter()

  return (
    <div className="px-4 py-2 space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <HapticButton
          variant="primary"
          className="py-3 text-base w-full"
          onClick={() => router.push('/train')}
        >
          <div className="flex flex-col items-center gap-1">
            <Brain className="w-5 h-5" />
            <span>Train</span>
          </div>
        </HapticButton>
        <HapticButton
          variant="secondary"
          className="py-3 text-base w-full"
          onClick={() => router.push('/test')}
        >
          <div className="flex flex-col items-center gap-1">
            <ClipboardList className="w-5 h-5" />
            <span>Test</span>
          </div>
        </HapticButton>
      </div>
      <HapticButton
        variant="ghost"
        className="w-full py-2 text-sm"
        onClick={() => router.push('/test?mode=hard')}
      >
        <span className="flex items-center justify-center gap-2">
          <Zap className="w-4 h-4" /> Hard Mode
        </span>
      </HapticButton>
    </div>
  )
}
