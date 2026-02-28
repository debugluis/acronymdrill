'use client'
import { useRouter } from 'next/navigation'
import { HapticButton } from '@/components/ui/HapticButton'
import { Brain, ClipboardList, Monitor } from 'lucide-react'

export function QuickLaunch() {
  const router = useRouter()

  return (
    <div className="px-4 py-2 space-y-2">
      <div className="grid grid-cols-3 gap-2">
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
        <HapticButton
          variant="ghost"
          className="py-3 text-base w-full !text-[#d97757] !border-[#d97757]/30"
          onClick={() => router.push('/exam')}
        >
          <div className="flex flex-col items-center gap-1">
            <Monitor className="w-5 h-5" />
            <span>Exam</span>
          </div>
        </HapticButton>
      </div>
    </div>
  )
}
