'use client'
import { useState, useEffect } from 'react'
import { User } from 'firebase/auth'
import { onAuthChange } from '@/lib/auth'
import { createOrUpdateUserProfile, updateWeeklyActivity } from '@/lib/firestore'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthChange(async (u) => {
      setUser(u)
      setLoading(false)
      if (u) {
        await createOrUpdateUserProfile(u.uid, {
          email: u.email ?? '',
          displayName: u.displayName ?? '',
          photoURL: u.photoURL ?? '',
        })
        await updateWeeklyActivity(u.uid)
      }
    })
    return unsubscribe
  }, [])

  return { user, loading }
}
