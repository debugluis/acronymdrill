'use client'
import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { ExamQuestionRenderer } from '@/components/exam/ExamQuestionRenderer'
import { ExamResults } from '@/components/exam/ExamResults'
import { AISummary } from '@/components/exam/AISummary'
import { HapticButton } from '@/components/ui/HapticButton'
import {
  ExamPreset,
  ExamConfig,
  ExamQuestion,
  ExamAnswer,
  ExamSession,
  EXAM_PRESETS,
} from '@/types/exam'
import { selectExamQuestions, scoreAnswer, calculateExamResults } from '@/lib/exam-algorithm'
import { getQuestionHistory, recordQuestionResults, saveExamSession } from '@/lib/exam-firestore'
import { updateTotalStudyTime } from '@/lib/firestore'
import { ChevronLeft, Clock, FileText, Gauge } from 'lucide-react'

type Phase = 'config' | 'exam' | 'results' | 'summary'

interface ExamState {
  config: ExamConfig
  questions: ExamQuestion[]
  currentIndex: number
  answers: ExamAnswer[]
  startTime: Date
  timeRemainingSeconds: number
}

export default function ExamPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [phase, setPhase] = useState<Phase>('config')
  const [examState, setExamState] = useState<ExamState | null>(null)
  const [session, setSession] = useState<ExamSession | null>(null)
  const [sessionId, setSessionId] = useState<string>('')
  const [selectedPreset, setSelectedPreset] = useState<ExamPreset>('standard')
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Countdown timer
  useEffect(() => {
    if (phase !== 'exam' || !examState) return

    timerRef.current = setInterval(() => {
      setExamState((prev) => {
        if (!prev) return prev
        const remaining = prev.timeRemainingSeconds - 1
        if (remaining <= 0) {
          // Time's up — auto-submit
          clearInterval(timerRef.current!)
          return { ...prev, timeRemainingSeconds: 0 }
        }
        return { ...prev, timeRemainingSeconds: remaining }
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [phase, examState?.config.preset])

  // Auto-finish when time runs out
  useEffect(() => {
    if (examState && examState.timeRemainingSeconds <= 0 && phase === 'exam') {
      finishExam()
    }
  }, [examState?.timeRemainingSeconds])

  const startExam = useCallback(async () => {
    if (!user) return
    setLoadingQuestions(true)

    try {
      const history = await getQuestionHistory(user.uid)
      const config = EXAM_PRESETS[selectedPreset]
      const questions = selectExamQuestions(selectedPreset, history)

      setExamState({
        config,
        questions,
        currentIndex: 0,
        answers: [],
        startTime: new Date(),
        timeRemainingSeconds: config.timeLimitMinutes * 60,
      })
      setPhase('exam')
    } finally {
      setLoadingQuestions(false)
    }
  }, [user, selectedPreset])

  const handleAnswer = useCallback(
    (answer: string | string[] | Record<string, string>) => {
      if (!examState) return
      const question = examState.questions[examState.currentIndex]
      const result = scoreAnswer(question, answer)

      const examAnswer: ExamAnswer = {
        questionId: question.id,
        type: question.type,
        answer,
        pointsEarned: result.pointsEarned,
        pointsPossible: result.pointsPossible,
        correct: result.correct,
        domain: question.domain,
      }

      setExamState((prev) => {
        if (!prev) return prev
        const newAnswers = [...prev.answers, examAnswer]
        const nextIndex = prev.currentIndex + 1

        if (nextIndex >= prev.questions.length) {
          return { ...prev, answers: newAnswers, currentIndex: nextIndex }
        }
        return { ...prev, answers: newAnswers, currentIndex: nextIndex }
      })
    },
    [examState]
  )

  // Check if exam is complete
  useEffect(() => {
    if (
      examState &&
      examState.currentIndex >= examState.questions.length &&
      phase === 'exam'
    ) {
      finishExam()
    }
  }, [examState?.currentIndex, phase])

  const finishExam = useCallback(async () => {
    if (!examState || !user) return
    if (timerRef.current) clearInterval(timerRef.current)

    const timeUsed = Math.round(
      (Date.now() - examState.startTime.getTime()) / 1000
    )
    const results = calculateExamResults(examState.answers)

    const examSession: Omit<ExamSession, 'id'> = {
      preset: examState.config.preset,
      totalQuestions: examState.config.totalQuestions,
      timeLimitMinutes: examState.config.timeLimitMinutes,
      startedAt: examState.startTime,
      completedAt: new Date(),
      timeUsedSeconds: timeUsed,
      ...results,
      answers: examState.answers,
    }

    // Save session + record question history + update study time
    const sid = await saveExamSession(user.uid, examSession)
    await recordQuestionResults(user.uid, examState.answers)
    await updateTotalStudyTime(user.uid, Math.round(timeUsed / 60))

    setSession({ ...examSession, id: sid })
    setSessionId(sid)
    setPhase('results')
  }, [examState, user])

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#141413]">
        <div className="w-10 h-10 border-2 border-[#d97757] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    router.push('/')
    return null
  }

  // ─── Summary Phase ───
  if (phase === 'summary' && session && examState) {
    const wrongAnswers = examState.answers
      .filter((a) => !a.correct)
      .map((a) => ({
        question: examState.questions.find((q) => q.id === a.questionId)!,
        answer: a,
      }))
      .filter((w) => w.question)

    return (
      <div className="h-screen overflow-hidden bg-[#141413] flex flex-col max-w-lg mx-auto">
        <header className="flex items-center px-4 py-3 border-b border-[#e8e6dc20] gap-3">
          <button
            onClick={() => setPhase('results')}
            className="text-[#b0aea5] text-sm flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" /> Results
          </button>
          <h1 className="text-lg font-semibold text-[#faf9f5] font-sans">AI Study Summary</h1>
        </header>
        <AISummary
          wrongAnswers={wrongAnswers}
          user={user}
          sessionId={sessionId}
          existingSummary={session.aiSummary}
          onBack={() => setPhase('results')}
        />
      </div>
    )
  }

  // ─── Results Phase ───
  if (phase === 'results' && session) {
    return (
      <div className="h-screen overflow-hidden bg-[#141413] flex flex-col max-w-lg mx-auto">
        <header className="flex items-center px-4 py-3 border-b border-[#e8e6dc20] gap-3">
          <h1 className="text-lg font-semibold text-[#faf9f5] font-sans">Exam Results</h1>
        </header>
        <ExamResults
          session={session}
          onViewSummary={() => setPhase('summary')}
          onHome={() => router.push('/')}
        />
      </div>
    )
  }

  // ─── Exam Phase ───
  if (phase === 'exam' && examState) {
    const question = examState.questions[examState.currentIndex]
    if (!question) return null

    const mins = Math.floor(examState.timeRemainingSeconds / 60)
    const secs = examState.timeRemainingSeconds % 60
    const isLowTime = examState.timeRemainingSeconds < 300 // < 5 min
    const progress =
      ((examState.currentIndex) / examState.questions.length) * 100
    const isPBQ = question.type === 'pbq_order' || question.type === 'pbq_drag'

    return (
      <div className="h-screen overflow-hidden bg-[#141413] flex flex-col max-w-lg mx-auto">
        {/* Header */}
        <header className="flex items-center px-4 py-3 border-b border-[#e8e6dc20] justify-between">
          <button
            onClick={finishExam}
            className="text-[#b0aea5] text-sm flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" /> End
          </button>
          <div className="flex items-center gap-2">
            {isPBQ && (
              <span className="text-[10px] px-1.5 py-0.5 bg-[#d97757]/20 text-[#d97757] rounded font-semibold uppercase">
                PBQ
              </span>
            )}
            <span className="text-sm text-[#b0aea5]">
              {examState.currentIndex + 1}/{examState.questions.length}
            </span>
          </div>
          <span
            className={`text-sm font-mono font-semibold flex items-center gap-1 ${
              isLowTime ? 'text-[#c0392b]' : 'text-[#b0aea5]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            {mins}:{String(secs).padStart(2, '0')}
          </span>
        </header>

        {/* Progress bar */}
        <div className="px-4 pt-2 pb-1">
          <div className="h-1.5 bg-[#e8e6dc20] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#d97757] rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <ExamQuestionRenderer question={question} onAnswer={handleAnswer} />
        </div>
      </div>
    )
  }

  // ─── Config Phase ───
  const presetOptions: { key: ExamPreset; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      key: 'quick',
      label: 'Quick',
      desc: '45 questions / 45 min',
      icon: <Gauge className="w-5 h-5" />,
    },
    {
      key: 'standard',
      label: 'Standard',
      desc: '65 questions / 65 min',
      icon: <FileText className="w-5 h-5" />,
    },
    {
      key: 'full',
      label: 'Full',
      desc: '90 questions / 90 min',
      icon: <Clock className="w-5 h-5" />,
    },
  ]

  return (
    <div className="h-screen overflow-hidden bg-[#141413] flex flex-col max-w-lg mx-auto">
      <header className="flex items-center px-4 py-4 border-b border-[#e8e6dc20] gap-3">
        <button
          onClick={() => router.push('/')}
          className="text-[#b0aea5] flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" /> Home
        </button>
        <h1 className="text-lg font-semibold text-[#faf9f5] font-sans">Exam Simulation</h1>
      </header>

      <div className="flex-1 px-4 py-6 space-y-6">
        <div className="text-center space-y-2">
          <p className="text-[#b0aea5] text-sm">
            Simulates the CompTIA Security+ exam experience. No feedback during the exam — answers are revealed at the end.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-[#b0aea5] uppercase tracking-wider">
            Select Exam Length
          </h2>
          {presetOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSelectedPreset(opt.key)}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl border transition-all ${
                selectedPreset === opt.key
                  ? 'bg-[#d97757]/10 border-[#d97757]'
                  : 'bg-[#1c1c1a] border-[#e8e6dc20]'
              }`}
            >
              <div
                className={`${
                  selectedPreset === opt.key ? 'text-[#d97757]' : 'text-[#b0aea5]'
                }`}
              >
                {opt.icon}
              </div>
              <div className="text-left flex-1">
                <p
                  className={`font-semibold ${
                    selectedPreset === opt.key ? 'text-[#d97757]' : 'text-[#faf9f5]'
                  }`}
                >
                  {opt.label}
                </p>
                <p className="text-xs text-[#b0aea5]">{opt.desc}</p>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedPreset === opt.key
                    ? 'border-[#d97757]'
                    : 'border-[#e8e6dc40]'
                }`}
              >
                {selectedPreset === opt.key && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#d97757]" />
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="bg-[#1c1c1a] rounded-xl p-4 border border-[#e8e6dc20] space-y-2">
          <h3 className="text-sm font-semibold text-[#faf9f5]">What to expect</h3>
          <ul className="text-xs text-[#b0aea5] space-y-1">
            <li>- MCQs, multi-select, and performance-based questions</li>
            <li>- Countdown timer — exam ends when time expires</li>
            <li>- No answer feedback until the end</li>
            <li>- Domain-weighted question selection</li>
            <li>- AI-generated study summary for missed questions</li>
          </ul>
        </div>

        <HapticButton
          variant="primary"
          className="w-full py-4 text-base"
          onClick={startExam}
          disabled={loadingQuestions}
        >
          {loadingQuestions ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Loading questions...
            </div>
          ) : (
            'Start Exam'
          )}
        </HapticButton>
      </div>
    </div>
  )
}
