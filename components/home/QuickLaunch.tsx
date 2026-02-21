'use client'
import { useRouter } from 'next/navigation'
import { HapticButton } from '@/components/ui/HapticButton'

export function QuickLaunch() {
  const router = useRouter()

  return (
    <div className="px-4 py-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <HapticButton
          variant="primary"
          className="py-5 text-lg w-full"
          onClick={() => router.push('/train')}
        >
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl">🃏</span>
            <span>Train</span>
          </div>
        </HapticButton>
        <HapticButton
          variant="secondary"
          className="py-5 text-lg w-full"
          onClick={() => router.push('/test')}
        >
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl">📝</span>
            <span>Test</span>
          </div>
        </HapticButton>
      </div>
      <HapticButton
        variant="ghost"
        className="w-full py-3 text-sm"
        onClick={() => router.push('/test?mode=hard')}
      >
        ⚡ Hard Mode
      </HapticButton>
    </div>
  )
}
