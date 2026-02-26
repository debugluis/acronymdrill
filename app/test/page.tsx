'use client'
import { useState, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useProgress } from '@/hooks/useProgress'
import { useAcronyms } from '@/hooks/useAcronyms'
import {
  selectHardModeAcronyms,
  generateQuestion,
  pickRandomQuestionType,
} from '@/lib/algorithm'
import { QuestionRenderer } from '@/components/test/QuestionRenderer'
import { WrongAnswerSheet } from '@/components/test/WrongAnswerSheet'
import { ResultsScreen } from '@/components/test/ResultsScreen'
import { ProgressBar } from '@/components/test/ProgressBar'
import { HapticButton } from '@/components/ui/HapticButton'
import { AcronymEntry, Question, AcronymCategory } from '@/types'
import { saveSession, updateTotalStudyTime } from '@/lib/firestore'
import { Zap, ChevronLeft } from 'lucide-react'

type Phase = 'config' | 'testing' | 'wrong-answer' | 'results'

interface TestState {
  questions: Question[]
  currentIndex: number
  correct: number
  wrong: number
  missedIds: string[]
  answered: boolean
  selectedAnswer: string
  domainBreakdown: Record<number, { correct: number; total: number }>
  startTime: Date
}

function TestContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isHardMode = searchParams.get('mode') === 'hard'
  const { user, loading: authLoading } = useAuth()
  const { progressMap, recordAnswer } = useProgress(user?.uid ?? null)
  const { allAcronyms } = useAcronyms()

  const [phase, setPhase] = useState<Phase>(isHardMode ? 'testing' : 'config')
  const [testState, setTestState] = useState<TestState | null>(null)
  const [filterDomain, setFilterDomain] = useState<string>('all')
  const [filterLength, setFilterLength] = useState<20 | 35 | 50>(35)

  // Auto-start hard mode
  useEffect(() => {
    if (isHardMode && allAcronyms.length > 0 && phase === 'testing' && !testState) {
      startTest('hard')
    }
  }, [isHardMode, allAcronyms.length, phase, testState])

  const buildQuestions = useCallback(
    (pool: AcronymEntry[], count: number, mode: 'normal' | 'hard'): Question[] => {
      const shuffled = [...pool].sort(() => Math.random() - 0.5)
      const selected = shuffled.slice(0, count)
      return selected.map((entry) => {
        const type = pickRandomQuestionType(mode)
        // Type 5 only for difficulty 1
        const safeType = type === 5 && entry.difficulty !== 1 ? 1 : type
        return generateQuestion(entry, allAcronyms, safeType)
      })
    },
    [allAcronyms]
  )

  const startTest = useCallback(
    (mode: 'normal' | 'hard') => {
      let pool: AcronymEntry[]
      if (mode === 'hard') {
        pool = selectHardModeAcronyms(allAcronyms, progressMap, 35)
      } else {
        pool =
          filterDomain === 'all'
            ? allAcronyms
            : allAcronyms.filter((a) => String(a.domain) === filterDomain)
      }

      const questions = buildQuestions(pool, filterLength, mode)
      const domainBreakdown: Record<number, { correct: number; total: number }> = {}
      ;[1, 2, 3, 4, 5].forEach((d) => {
        domainBreakdown[d] = { correct: 0, total: 0 }
      })

      setTestState({
        questions,
        currentIndex: 0,
        correct: 0,
        wrong: 0,
        missedIds: [],
        answered: false,
        selectedAnswer: '',
        domainBreakdown,
        startTime: new Date(),
      })
      setPhase('testing')
    },
    [allAcronyms, progressMap, filterDomain, filterLength, buildQuestions]
  )

  const handleAnswer = useCallback(
    async (correct: boolean, selected: string) => {
      if (!testState || !user) return
      const question = testState.questions[testState.currentIndex]
      await recordAnswer(question.acronym.id, correct)

      const newDomainBreakdown = { ...testState.domainBreakdown }
      const d = question.acronym.domain
      newDomainBreakdown[d] = {
        correct: (newDomainBreakdown[d]?.correct ?? 0) + (correct ? 1 : 0),
        total: (newDomainBreakdown[d]?.total ?? 0) + 1,
      }

      setTestState((prev) =>
        prev
          ? {
              ...prev,
              correct: prev.correct + (correct ? 1 : 0),
              wrong: prev.wrong + (correct ? 0 : 1),
              missedIds: correct ? prev.missedIds : [...prev.missedIds, question.acronym.id],
              answered: true,
              selectedAnswer: selected,
              domainBreakdown: newDomainBreakdown,
            }
          : prev
      )

      if (correct) {
        setTimeout(() => advanceQuestion(), 1500)
      } else {
        setPhase('wrong-answer')
      }
    },
    [testState, user, recordAnswer]
  )

  const advanceQuestion = useCallback(() => {
    setTestState((prev) => {
      if (!prev) return prev
      const next = prev.currentIndex + 1
      if (next >= prev.questions.length) {
        return { ...prev, currentIndex: next, answered: false, selectedAnswer: '' }
      }
      return { ...prev, currentIndex: next, answered: false, selectedAnswer: '' }
    })
    setPhase('testing')
  }, [])

  useEffect(() => {
    if (
      testState &&
      testState.currentIndex >= testState.questions.length &&
      phase === 'testing'
    ) {
      finishTest()
    }
  }, [testState?.currentIndex, phase])

  const finishTest = useCallback(async () => {
    if (!testState || !user) return
    const duration = Math.round((Date.now() - testState.startTime.getTime()) / 1000)
    await updateTotalStudyTime(user.uid, Math.round(duration / 60))
    await saveSession(user.uid, {
      mode: isHardMode ? 'hard' : 'normal',
      startedAt: testState.startTime,
      completedAt: new Date(),
      totalQuestions: testState.questions.length,
      correctAnswers: testState.correct,
      score: (testState.correct / testState.questions.length) * 100,
      durationSeconds: duration,
      acronymsMissed: testState.missedIds,
      domainBreakdown: Object.fromEntries(
        Object.entries(testState.domainBreakdown).map(([k, v]) => [k, v])
      ),
      categoryBreakdown: {},
    })
    setPhase('results')
  }, [testState, user, isHardMode])

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#141413]">
        <div className="w-10 h-10 border-2 border-[#d97757] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    router.push('/')
    return null
  }

  if (phase === 'results' && testState) {
    const duration = Math.round((Date.now() - testState.startTime.getTime()) / 1000)
    const domainResults = [1, 2, 3, 4, 5].map((d) => ({
      domain: d,
      correct: testState.domainBreakdown[d]?.correct ?? 0,
      total: testState.domainBreakdown[d]?.total ?? 0,
    }))
    return (
      <div className="min-h-screen bg-[#141413] flex flex-col max-w-lg mx-auto">
        <header className="flex items-center px-4 py-4 border-b border-[#e8e6dc20] gap-3">
          <h1 className="text-lg font-semibold text-[#faf9f5] font-sans">Results</h1>
        </header>
        <div className="flex-1">
          <ResultsScreen
            correct={testState.correct}
            total={testState.questions.length}
            durationSeconds={duration}
            domainResults={domainResults}
          />
        </div>
      </div>
    )
  }

  if (phase === 'wrong-answer' && testState) {
    const question = testState.questions[testState.currentIndex]
    return (
      <div className="min-h-screen bg-[#141413] flex flex-col max-w-lg mx-auto">
        <header className="flex items-center px-4 py-4 border-b border-[#e8e6dc20] gap-3">
          <h1 className="text-lg font-semibold text-[#faf9f5] font-sans">Incorrect</h1>
        </header>
        <div className="flex-1">
          <WrongAnswerSheet question={question} onNext={advanceQuestion} />
        </div>
      </div>
    )
  }

  if (phase === 'testing' && testState) {
    const question = testState.questions[testState.currentIndex]
    if (!question) return null
    const remaining = testState.questions.length - testState.currentIndex

    return (
      <div className="min-h-screen bg-[#141413] flex flex-col max-w-lg mx-auto">
        <header className="flex items-center px-4 py-3 border-b border-[#e8e6dc20] justify-between">
          <button
            onClick={() => {
              finishTest()
            }}
            className="text-[#b0aea5] text-sm flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" /> Exit
          </button>
          <span className="text-sm text-[#b0aea5] font-sans flex items-center gap-1">
            {isHardMode ? <><Zap className="w-3.5 h-3.5" /> Hard Mode</> : 'Test'}
          </span>
          <span className="text-sm text-[#d97757] font-semibold">
            {testState.correct}/{testState.currentIndex}
          </span>
        </header>
        <ProgressBar
          current={remaining}
          total={testState.questions.length}
        />
        <div className="flex-1 overflow-hidden">
          <QuestionRenderer
            question={question}
            onAnswer={handleAnswer}
            answered={testState.answered}
            selectedAnswer={testState.selectedAnswer}
          />
        </div>
      </div>
    )
  }

  // Config screen
  return (
    <div className="min-h-screen bg-[#141413] flex flex-col max-w-lg mx-auto">
      <header className="flex items-center px-4 py-4 border-b border-[#e8e6dc20] gap-3">
        <button onClick={() => router.push('/')} className="text-[#b0aea5] flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> Home</button>
        <h1 className="text-lg font-semibold text-[#faf9f5] font-sans">Configure Test</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-[#b0aea5] uppercase tracking-wider">Domain Filter</h2>
          <div className="grid grid-cols-3 gap-2">
            {['all', '1', '2', '3', '4', '5'].map((d) => (
              <button
                key={d}
                onClick={() => setFilterDomain(d)}
                className={`py-2 px-3 rounded-xl border text-sm transition-all ${
                  filterDomain === d
                    ? 'bg-[#d97757] border-[#d97757] text-white font-semibold'
                    : 'bg-[#1c1c1a] border-[#e8e6dc20] text-[#b0aea5]'
                }`}
              >
                {d === 'all' ? 'All' : `D${d}`}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-[#b0aea5] uppercase tracking-wider">Test Length</h2>
          <div className="grid grid-cols-3 gap-2">
            {([20, 35, 50] as const).map((len) => (
              <button
                key={len}
                onClick={() => setFilterLength(len)}
                className={`py-2 px-3 rounded-xl border text-sm transition-all ${
                  filterLength === len
                    ? 'bg-[#d97757] border-[#d97757] text-white font-semibold'
                    : 'bg-[#1c1c1a] border-[#e8e6dc20] text-[#b0aea5]'
                }`}
              >
                {len === 20 ? 'Quick (20)' : len === 35 ? 'Standard (35)' : 'Full (50)'}
              </button>
            ))}
          </div>
        </div>

        <HapticButton
          variant="primary"
          className="w-full py-5 text-lg mt-4"
          onClick={() => startTest('normal')}
        >
          Start Test
        </HapticButton>
      </div>
    </div>
  )
}

export default function TestPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-[#141413]">
        <div className="w-10 h-10 border-2 border-[#d97757] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <TestContent />
    </Suspense>
  )
}
