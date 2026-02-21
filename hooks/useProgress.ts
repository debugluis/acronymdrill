'use client'
import { useState, useEffect, useCallback } from 'react'
import { AcronymProgress } from '@/types'
import { getUserProgress, recordTrainingSwipe, recordTestAnswer } from '@/lib/firestore'

export function useProgress(userId: string | null) {
  const [progressMap, setProgressMap] = useState<Map<string, AcronymProgress>>(new Map())
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    if (!userId) {
      setProgressMap(new Map())
      setLoading(false)
      return
    }
    setLoading(true)
    const map = await getUserProgress(userId)
    setProgressMap(map)
    setLoading(false)
  }, [userId])

  useEffect(() => {
    reload()
  }, [reload])

  const swipe = useCallback(
    async (acronymId: string, direction: 'left' | 'right') => {
      if (!userId) return
      await recordTrainingSwipe(userId, acronymId, direction)
      await reload()
    },
    [userId, reload]
  )

  const recordAnswer = useCallback(
    async (acronymId: string, correct: boolean) => {
      if (!userId) return
      await recordTestAnswer(userId, acronymId, correct)
      await reload()
    },
    [userId, reload]
  )

  return { progressMap, loading, swipe, recordAnswer, reload }
}
