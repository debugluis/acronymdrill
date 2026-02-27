'use client'
import { useState, useRef } from 'react'
import { motion, PanInfo, useMotionValue, useTransform, AnimatePresence, animate } from 'framer-motion'
import { AcronymEntry } from '@/types'
import { AcronymCard } from './AcronymCard'
import { hapticCorrect, hapticWrong } from '@/lib/haptics'

interface SwipeContainerProps {
  entries: AcronymEntry[]
  onSwipe: (entry: AcronymEntry, direction: 'left' | 'right') => void
  onComplete: (stats: { confident: number; practice: number }) => void
}

export function SwipeContainer({ entries, onSwipe, onComplete }: SwipeContainerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [stats, setStats] = useState({ confident: 0, practice: 0 })
  const [flashColor, setFlashColor] = useState<string | null>(null)
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-15, 15])
  const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5])

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const threshold = 80
    if (Math.abs(info.offset.x) > threshold) {
      const dir = info.offset.x > 0 ? 'right' : 'left'
      flyOffAndAdvance(dir)
    } else {
      animate(x, 0, { type: 'spring', stiffness: 400, damping: 30 })
    }
  }

  const flyOffAndAdvance = (dir: 'left' | 'right') => {
    animate(x, dir === 'right' ? 600 : -600, { duration: 0.25 }).then(() => {
      advanceCard(dir)
    })
  }

  const advanceCard = (dir: 'left' | 'right') => {
    const entry = entries[currentIndex]
    if (!entry) return

    if (dir === 'right') {
      hapticCorrect()
      setFlashColor('#788c5d')
      setStats((s) => ({ ...s, confident: s.confident + 1 }))
    } else {
      hapticWrong()
      setFlashColor('#c0392b')
      setStats((s) => ({ ...s, practice: s.practice + 1 }))
    }

    onSwipe(entry, dir)

    setTimeout(() => {
      setFlashColor(null)
      x.set(0)
      const next = currentIndex + 1
      if (next >= entries.length) {
        onComplete({ confident: stats.confident + (dir === 'right' ? 1 : 0), practice: stats.practice + (dir === 'left' ? 1 : 0) })
      } else {
        setCurrentIndex(next)
      }
    }, 200)
  }

  const current = entries[currentIndex]
  if (!current) return null

  return (
    <div className="relative flex-1 flex flex-col">
      {/* Flash overlay */}
      {flashColor && (
        <div
          className="absolute inset-0 z-10 rounded-2xl pointer-events-none"
          style={{ backgroundColor: flashColor, opacity: 0.3 }}
        />
      )}

      {/* Progress */}
      <div className="px-4 pt-2 pb-1">
        <div className="flex items-center justify-between text-xs text-[#b0aea5] mb-1">
          <span>Card {currentIndex + 1} of {entries.length}</span>
        </div>
        <div className="h-1 bg-[#e8e6dc20] rounded-full">
          <div
            className="h-full bg-[#d97757] rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / entries.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <div className="flex-1 p-4">
        <motion.div
          style={{ x, rotate, opacity }}
          drag="x"
          onDragEnd={handleDragEnd}
          className="h-full cursor-grab active:cursor-grabbing"
          whileDrag={{ scale: 1.02 }}
        >
          <AcronymCard entry={current} isNew={true} />
        </motion.div>
      </div>

      {/* Manual swipe buttons */}
      <div className="flex gap-4 px-4 pb-4">
        <button
          onClick={() => flyOffAndAdvance('left')}
          className="flex-1 py-3 rounded-xl bg-[#c0392b]/20 border border-[#c0392b]/40 text-[#c0392b] font-semibold"
        >
          ← Needs Practice
        </button>
        <button
          onClick={() => flyOffAndAdvance('right')}
          className="flex-1 py-3 rounded-xl bg-[#788c5d]/20 border border-[#788c5d]/40 text-[#788c5d] font-semibold"
        >
          Confident →
        </button>
      </div>
    </div>
  )
}
