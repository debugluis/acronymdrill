'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useProgress } from '@/hooks/useProgress'
import { useAcronyms } from '@/hooks/useAcronyms'
import { selectReinforcementAcronyms } from '@/lib/algorithm'
import { SwipeContainer } from '@/components/training/SwipeContainer'
import { TrainingComplete } from '@/components/training/TrainingComplete'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { HapticButton } from '@/components/ui/HapticButton'
import { AcronymEntry } from '@/types'
import { saveSession, updateTotalStudyTime } from '@/lib/firestore'
import { Shuffle, Target, ChevronLeft } from 'lucide-react'

type Phase = 'select' | 'training' | 'complete'

export default function TrainPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { progressMap, swipe } = useProgress(user?.uid ?? null)
  const { allAcronyms } = useAcronyms()
  const [phase, setPhase] = useState<Phase>('select')
  const [deck, setDeck] = useState<AcronymEntry[]>([])
  const [finalStats, setFinalStats] = useState({ confident: 0, practice: 0 })
  const [startTime, setStartTime] = useState<Date | null>(null)

  const startTraining = (mode: 'random' | 'reinforcement') => {
    let selected: AcronymEntry[]
    if (mode === 'random') {
      const shuffled = [...allAcronyms].sort(() => Math.random() - 0.5)
      selected = shuffled.slice(0, 20)
    } else {
      selected = selectReinforcementAcronyms(allAcronyms, progressMap, 20)
      if (selected.length < 20) {
        const extras = allAcronyms
          .filter((a) => !selected.find((s) => s.id === a.id))
          .sort(() => Math.random() - 0.5)
          .slice(0, 20 - selected.length)
        selected = [...selected, ...extras]
      }
    }
    setDeck(selected)
    setStartTime(new Date())
    setPhase('training')
  }

  const handleSwipe = useCallback(
    async (entry: AcronymEntry, direction: 'left' | 'right') => {
      await swipe(entry.id, direction)
    },
    [swipe]
  )

  const handleComplete = useCallback(
    async (stats: { confident: number; practice: number }) => {
      setFinalStats(stats)
      setPhase('complete')
      if (user && startTime) {
        const duration = Math.round((Date.now() - startTime.getTime()) / 1000)
        const minutes = Math.round(duration / 60)
        await updateTotalStudyTime(user.uid, minutes)
        await saveSession(user.uid, {
          mode: 'training-random',
          startedAt: startTime,
          completedAt: new Date(),
          totalQuestions: deck.length,
          correctAnswers: stats.confident,
          score: deck.length > 0 ? (stats.confident / deck.length) * 100 : 0,
          durationSeconds: duration,
          acronymsMissed: [],
          domainBreakdown: {},
          categoryBreakdown: {},
        })
      }
    },
    [user, startTime, deck]
  )

  const handleTrainAgain = () => {
    setPhase('select')
    setDeck([])
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen overflow-hidden bg-[#141413]">
        <div className="w-10 h-10 border-2 border-[#d97757] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    router.push('/')
    return null
  }

  if (phase === 'complete') {
    return (
      <div className="h-screen overflow-hidden bg-[#141413] flex flex-col max-w-lg mx-auto">
        <header className="flex items-center px-4 py-4 border-b border-[#e8e6dc20] gap-3">
          <button onClick={() => router.push('/')} className="text-[#b0aea5] flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> Home</button>
          <h1 className="text-lg font-semibold text-[#faf9f5] font-sans">Training Complete</h1>
        </header>
        <div className="flex-1">
          <TrainingComplete stats={finalStats} onTrainAgain={handleTrainAgain} />
        </div>
      </div>
    )
  }

  if (phase === 'training' && deck.length > 0) {
    return (
      <div className="h-screen overflow-hidden bg-[#141413] flex flex-col max-w-lg mx-auto">
        <header className="flex items-center px-4 py-4 border-b border-[#e8e6dc20] gap-3">
          <button onClick={() => setPhase('select')} className="text-[#b0aea5] flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> Back</button>
          <h1 className="text-lg font-semibold text-[#faf9f5] font-sans">Training</h1>
        </header>
        <div className="flex-1 flex flex-col overflow-hidden">
          <SwipeContainer
            entries={deck}
            onSwipe={handleSwipe}
            onComplete={handleComplete}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen overflow-hidden bg-[#141413] flex flex-col max-w-lg mx-auto">
      <header className="flex items-center px-4 py-4 border-b border-[#e8e6dc20] gap-3">
        <button onClick={() => router.push('/')} className="text-[#b0aea5] flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> Home</button>
        <h1 className="text-lg font-semibold text-[#faf9f5] font-sans">Choose Training Mode</h1>
      </header>

      <div className="flex-1 flex flex-col justify-center px-6 gap-4">
        <p className="text-[#b0aea5] text-sm text-center">
          Each session covers 20 cards. Swipe right if you&apos;re confident, left if you need more practice.
        </p>

        <div className="space-y-4 mt-4">
          <button
            onClick={() => startTraining('random')}
            className="w-full bg-[#1c1c1a] border border-[#e8e6dc20] rounded-2xl p-5 text-left hover:border-[#d97757] transition-colors"
          >
            <div className="flex items-center gap-3 mb-2">
              <Shuffle className="w-6 h-6 text-[#d97757]" />
              <h2 className="text-lg font-bold text-[#faf9f5] font-sans">Random</h2>
            </div>
            <p className="text-sm text-[#b0aea5]">20 random acronyms from any domain or category</p>
          </button>

          <button
            onClick={() => startTraining('reinforcement')}
            className="w-full bg-[#1c1c1a] border border-[#e8e6dc20] rounded-2xl p-5 text-left hover:border-[#d97757] transition-colors"
          >
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-6 h-6 text-[#d97757]" />
              <h2 className="text-lg font-bold text-[#faf9f5] font-sans">Reinforcement</h2>
            </div>
            <p className="text-sm text-[#b0aea5]">Focuses on your weakest and unseen acronyms</p>
          </button>
        </div>
      </div>
    </div>
  )
}
