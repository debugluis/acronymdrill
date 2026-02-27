'use client'
import { useRouter } from 'next/navigation'
import { HapticButton } from '@/components/ui/HapticButton'
import { Brain, ClipboardList } from 'lucide-react'

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
    </div>
  )
}
