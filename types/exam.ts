// ─── Question Bank Types ───

export interface QuestionOption {
  id: string
  text: string
}

export interface QuestionFlags {
  scenario_based: boolean
  acronym_focus: boolean
  requires_elimination: boolean
}

interface BaseQuestion {
  id: string
  domain: number
  subdomain: string
  topic: string
  difficulty: 1 | 2 | 3
  stem: string
  explanation: string
  flags: QuestionFlags
}

export interface MCQuestion extends BaseQuestion {
  type: 'mcq'
  options: QuestionOption[]
  correct_answer: string
}

export interface MSQuestion extends BaseQuestion {
  type: 'msq'
  options: QuestionOption[]
  correct_answers: string[]
}

export interface PBQOrderQuestion extends BaseQuestion {
  type: 'pbq_order'
  items: { id: string; text: string }[]
  correct_order: string[]
}

export interface PBQDragQuestion extends BaseQuestion {
  type: 'pbq_drag'
  zones: { id: string; label: string }[]
  items: { id: string; text: string }[]
  correct_mapping: Record<string, string>
}

export type ExamQuestion = MCQuestion | MSQuestion | PBQOrderQuestion | PBQDragQuestion

// ─── Question Bank Root ───

export interface QuestionBank {
  meta: {
    version: string
    exam: string
    generated_at: string
    generator: string
    total_questions: number
    domain_counts: Record<string, number>
    scoring: {
      mcq: { points: number; partial: boolean }
      msq: { points: number; partial: boolean; points_per_correct: number }
      pbq_order: { points: number; partial: boolean; points_per_position: number }
      pbq_drag: { points: number; partial: boolean; points_per_item: number }
    }
  }
  questions: ExamQuestion[]
}

// ─── Exam Config ───

export type ExamPreset = 'quick' | 'standard' | 'full'

export interface ExamConfig {
  preset: ExamPreset
  totalQuestions: number
  timeLimitMinutes: number
}

export const EXAM_PRESETS: Record<ExamPreset, ExamConfig> = {
  quick: { preset: 'quick', totalQuestions: 45, timeLimitMinutes: 45 },
  standard: { preset: 'standard', totalQuestions: 65, timeLimitMinutes: 65 },
  full: { preset: 'full', totalQuestions: 90, timeLimitMinutes: 90 },
}

export const DOMAIN_DISTRIBUTION: Record<ExamPreset, Record<number, number>> = {
  quick: { 1: 5, 2: 10, 3: 8, 4: 13, 5: 9 },
  standard: { 1: 8, 2: 14, 3: 12, 4: 18, 5: 13 },
  full: { 1: 11, 2: 20, 3: 16, 4: 25, 5: 18 },
}

export const PBQ_COUNTS: Record<ExamPreset, number> = {
  quick: 3,
  standard: 4,
  full: 5,
}

// ─── Exam Answer ───

export interface ExamAnswer {
  questionId: string
  type: ExamQuestion['type']
  answer: string | string[] | Record<string, string>
  pointsEarned: number
  pointsPossible: number
  correct: boolean
  domain: number
}

// ─── Exam Session (Firestore) ───

export interface ExamSession {
  id?: string
  preset: ExamPreset
  totalQuestions: number
  timeLimitMinutes: number
  startedAt: Date
  completedAt: Date
  timeUsedSeconds: number
  totalPointsEarned: number
  totalPointsPossible: number
  percentage: number
  passed: boolean
  answers: ExamAnswer[]
  domainBreakdown: Record<string, { earned: number; possible: number; percentage: number }>
  aiSummary?: string
}

// ─── Question History (Firestore) ───

export interface QuestionHistoryEntry {
  questionId: string
  timesSeen: number
  timesCorrect: number
  timesWrong: number
  lastSeen: Date | null
}
