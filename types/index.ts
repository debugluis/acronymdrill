export type AcronymCategory =
  | 'protocol'
  | 'tool'
  | 'attack'
  | 'crypto'
  | 'access'
  | 'business'
  | 'hardware'
  | 'standard'
  | 'role'

export interface AcronymEntry {
  id: string
  fullName: string
  phonetic: string
  domain: 1 | 2 | 3 | 4 | 5
  category: AcronymCategory
  difficulty: 1 | 2 | 3
  mnemonic: string
  realWorldExample: string
  examTip: string
  confusedWith?: string[]
}

export type MasteryLevel = 'unseen' | 'learning' | 'practicing' | 'confident' | 'mastered'

export interface AcronymProgress {
  acronymId: string
  timesSeenInTraining: number
  timesTestedCorrect: number
  timesTestedWrong: number
  confidenceSwipes: number
  practiceSwipes: number
  lastSeen: Date | null
  lastTested: Date | null
  accuracyRate: number
  weaknessScore: number
  masteryLevel: MasteryLevel
  streak: number
}

export interface UserProfile {
  uid: string
  email: string
  displayName: string
  photoURL: string
  createdAt: Date
  lastActiveDate: Date
  totalStudyMinutes: number
  examDate?: Date
  weeklyActivity: {
    mon: boolean
    tue: boolean
    wed: boolean
    thu: boolean
    fri: boolean
    sat: boolean
    sun: boolean
  }
}

export type SessionMode = 'training-random' | 'training-reinforcement' | 'normal' | 'hard'

export interface StudySession {
  id: string
  mode: SessionMode
  startedAt: Date
  completedAt?: Date
  totalQuestions: number
  correctAnswers: number
  score: number
  durationSeconds: number
  acronymsMissed: string[]
  domainBreakdown: {
    [key: string]: { correct: number; total: number }
  }
  categoryBreakdown: {
    [key: string]: { correct: number; total: number }
  }
}

export type QuestionType = 1 | 2 | 3 | 4 | 5 | 6

export interface Question {
  type: QuestionType
  acronym: AcronymEntry
  options?: string[]
  correctAnswer: string
  pairItems?: { left: string; right: string }[]
  scenarioText?: string
}

export interface TestConfig {
  domain?: 1 | 2 | 3 | 4 | 5 | 'all'
  category?: AcronymCategory | 'all'
  length: 20 | 35 | 50
  timerEnabled: boolean
  mode: 'normal' | 'hard'
}

export interface TrainingConfig {
  mode: 'random' | 'reinforcement'
}
