import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  Timestamp,
  FieldValue,
} from 'firebase/firestore'
import { db } from './firebase'
import { UserProfile, AcronymProgress, StudySession, MasteryLevel } from '@/types'
import { calculateMasteryLevel, calculateWeaknessScore } from './algorithm'

// Firestore data type that can contain FieldValue for writes
type FirestoreProgressData = {
  timesSeenInTraining: number
  timesTestedCorrect: number
  timesTestedWrong: number
  confidenceSwipes: number
  practiceSwipes: number
  lastSeen: FieldValue | null
  lastTested: FieldValue | null
  accuracyRate: number
  weaknessScore: number
  masteryLevel?: MasteryLevel
  streak: number
}

// --- User Profile ---

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const ref = doc(db, 'users', userId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  const data = snap.data()
  return {
    ...data,
    uid: userId,
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
    lastActiveDate: data.lastActiveDate?.toDate?.() ?? new Date(),
    examDate: data.examDate?.toDate?.() ?? undefined,
  } as UserProfile
}

export async function createOrUpdateUserProfile(
  userId: string,
  partial: Partial<UserProfile>
): Promise<void> {
  const ref = doc(db, 'users', userId)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, {
      ...partial,
      createdAt: serverTimestamp(),
      lastActiveDate: serverTimestamp(),
      totalStudyMinutes: 0,
      weeklyActivity: { mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false },
    })
  } else {
    await updateDoc(ref, { ...partial, lastActiveDate: serverTimestamp() })
  }
}

function getWeekStart(d: Date): number {
  const date = new Date(d)
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day // back to Monday
  date.setDate(date.getDate() + diff)
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

export async function updateWeeklyActivity(userId: string): Promise<void> {
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
  const today = days[new Date().getDay()]
  const ref = doc(db, 'users', userId)
  const snap = await getDoc(ref)
  const lastActive = snap.data()?.lastActiveDate?.toDate?.() as Date | undefined
  const isNewWeek = !lastActive || getWeekStart(lastActive) < getWeekStart(new Date())

  if (isNewWeek) {
    await updateDoc(ref, {
      weeklyActivity: { mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false, [today]: true },
      lastActiveDate: serverTimestamp(),
    })
  } else {
    await updateDoc(ref, { [`weeklyActivity.${today}`]: true, lastActiveDate: serverTimestamp() })
  }
}

// --- Acronym Progress ---

export async function getUserProgress(userId: string): Promise<Map<string, AcronymProgress>> {
  const colRef = collection(db, 'users', userId, 'progress')
  const snap = await getDocs(colRef)
  const map = new Map<string, AcronymProgress>()
  snap.forEach((d) => {
    const data = d.data()
    map.set(d.id, {
      acronymId: d.id,
      timesSeenInTraining: data.timesSeenInTraining ?? 0,
      timesTestedCorrect: data.timesTestedCorrect ?? 0,
      timesTestedWrong: data.timesTestedWrong ?? 0,
      confidenceSwipes: data.confidenceSwipes ?? 0,
      practiceSwipes: data.practiceSwipes ?? 0,
      lastSeen: data.lastSeen?.toDate?.() ?? null,
      lastTested: data.lastTested?.toDate?.() ?? null,
      accuracyRate: data.accuracyRate ?? 0,
      weaknessScore: data.weaknessScore ?? 0.5,
      masteryLevel: (data.masteryLevel as MasteryLevel) ?? 'unseen',
      streak: data.streak ?? 0,
    })
  })
  return map
}

export async function recordTrainingSwipe(
  userId: string,
  acronymId: string,
  direction: 'left' | 'right'
): Promise<void> {
  const ref = doc(db, 'users', userId, 'progress', acronymId)
  const snap = await getDoc(ref)
  const existing = snap.exists() ? snap.data() : {}
  const timesSeenInTraining = (existing.timesSeenInTraining ?? 0) + 1
  const confidenceSwipes = (existing.confidenceSwipes ?? 0) + (direction === 'right' ? 1 : 0)
  const practiceSwipes = (existing.practiceSwipes ?? 0) + (direction === 'left' ? 1 : 0)
  const timesTestedCorrect = existing.timesTestedCorrect ?? 0
  const timesTestedWrong = existing.timesTestedWrong ?? 0
  const accuracyRate = existing.accuracyRate ?? 0
  const weaknessScore = existing.weaknessScore ?? 0.5
  const streak = existing.streak ?? 0

  const masteryLevel = calculateMasteryLevel({
    acronymId,
    timesSeenInTraining,
    timesTestedCorrect,
    timesTestedWrong,
    confidenceSwipes,
    practiceSwipes,
    lastSeen: null,
    lastTested: null,
    accuracyRate,
    weaknessScore,
    masteryLevel: 'unseen',
    streak,
  })

  const progressData: FirestoreProgressData = {
    timesSeenInTraining,
    confidenceSwipes,
    practiceSwipes,
    lastSeen: serverTimestamp(),
    timesTestedCorrect,
    timesTestedWrong,
    accuracyRate,
    weaknessScore,
    streak,
    masteryLevel,
    lastTested: existing.lastTested ?? null,
  }

  await setDoc(ref, progressData, { merge: true })
}

export async function recordTestAnswer(
  userId: string,
  acronymId: string,
  correct: boolean
): Promise<void> {
  const ref = doc(db, 'users', userId, 'progress', acronymId)
  const snap = await getDoc(ref)
  const existing = snap.exists() ? snap.data() : {}

  const timesTestedCorrect = (existing.timesTestedCorrect ?? 0) + (correct ? 1 : 0)
  const timesTestedWrong = (existing.timesTestedWrong ?? 0) + (correct ? 0 : 1)
  const accuracyRate = timesTestedCorrect / (timesTestedCorrect + timesTestedWrong)
  const weaknessScore = calculateWeaknessScore(timesTestedCorrect, timesTestedWrong)
  const streak = correct ? (existing.streak ?? 0) + 1 : 0

  const masteryLevel = calculateMasteryLevel({
    acronymId,
    timesTestedCorrect,
    timesTestedWrong,
    accuracyRate,
    weaknessScore,
    streak,
    timesSeenInTraining: existing.timesSeenInTraining ?? 0,
    confidenceSwipes: existing.confidenceSwipes ?? 0,
    practiceSwipes: existing.practiceSwipes ?? 0,
    lastSeen: null,
    lastTested: null,
    masteryLevel: 'unseen',
  })

  const progressData: FirestoreProgressData = {
    timesTestedCorrect,
    timesTestedWrong,
    accuracyRate,
    weaknessScore,
    streak,
    lastTested: serverTimestamp(),
    timesSeenInTraining: existing.timesSeenInTraining ?? 0,
    confidenceSwipes: existing.confidenceSwipes ?? 0,
    practiceSwipes: existing.practiceSwipes ?? 0,
    lastSeen: existing.lastSeen ?? null,
    masteryLevel,
  }

  await setDoc(ref, progressData, { merge: true })
}

// --- Sessions ---

export async function saveSession(
  userId: string,
  session: Omit<StudySession, 'id'>
): Promise<string> {
  const colRef = collection(db, 'users', userId, 'sessions')
  const ref = await addDoc(colRef, {
    ...session,
    startedAt: Timestamp.fromDate(session.startedAt),
    completedAt: session.completedAt ? Timestamp.fromDate(session.completedAt) : null,
  })
  return ref.id
}

export async function updateTotalStudyTime(userId: string, minutes: number): Promise<void> {
  const ref = doc(db, 'users', userId)
  const snap = await getDoc(ref)
  const current = snap.exists() ? (snap.data().totalStudyMinutes ?? 0) : 0
  await updateDoc(ref, { totalStudyMinutes: current + minutes })
}
