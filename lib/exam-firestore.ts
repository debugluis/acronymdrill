import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import { ExamSession, ExamAnswer, QuestionHistoryEntry } from '@/types/exam'

// ─── Question History ───

export async function getQuestionHistory(
  userId: string
): Promise<Map<string, QuestionHistoryEntry>> {
  const colRef = collection(db, 'users', userId, 'questionHistory')
  const snap = await getDocs(colRef)
  const map = new Map<string, QuestionHistoryEntry>()
  snap.forEach((d) => {
    const data = d.data()
    map.set(d.id, {
      questionId: d.id,
      timesSeen: data.timesSeen ?? 0,
      timesCorrect: data.timesCorrect ?? 0,
      timesWrong: data.timesWrong ?? 0,
      lastSeen: data.lastSeen?.toDate?.() ?? null,
    })
  })
  return map
}

export async function recordQuestionResults(
  userId: string,
  answers: ExamAnswer[]
): Promise<void> {
  for (const answer of answers) {
    const ref = doc(db, 'users', userId, 'questionHistory', answer.questionId)
    const snap = await getDoc(ref)
    const existing = snap.exists() ? snap.data() : {}

    const timesSeen = (existing.timesSeen ?? 0) + 1
    const timesCorrect = (existing.timesCorrect ?? 0) + (answer.correct ? 1 : 0)
    const timesWrong = (existing.timesWrong ?? 0) + (answer.correct ? 0 : 1)

    await setDoc(ref, {
      timesSeen,
      timesCorrect,
      timesWrong,
      lastSeen: serverTimestamp(),
    })
  }
}

// ─── Exam Sessions ───

export async function saveExamSession(
  userId: string,
  session: Omit<ExamSession, 'id'>
): Promise<string> {
  const colRef = collection(db, 'users', userId, 'examSessions')
  const ref = await addDoc(colRef, {
    preset: session.preset,
    totalQuestions: session.totalQuestions,
    timeLimitMinutes: session.timeLimitMinutes,
    startedAt: Timestamp.fromDate(session.startedAt),
    completedAt: Timestamp.fromDate(session.completedAt),
    timeUsedSeconds: session.timeUsedSeconds,
    totalPointsEarned: session.totalPointsEarned,
    totalPointsPossible: session.totalPointsPossible,
    percentage: session.percentage,
    passed: session.passed,
    answers: session.answers,
    domainBreakdown: session.domainBreakdown,
    aiSummary: session.aiSummary ?? null,
  })
  return ref.id
}

export async function updateExamSessionSummary(
  userId: string,
  sessionId: string,
  aiSummary: string
): Promise<void> {
  const ref = doc(db, 'users', userId, 'examSessions', sessionId)
  await updateDoc(ref, { aiSummary })
}
