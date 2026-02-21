'use client'
import { useMemo } from 'react'
import { acronyms } from '@/data/acronyms'
import { AcronymEntry } from '@/types'

export function useAcronyms() {
  const allAcronyms = useMemo(() => acronyms, [])

  const byDomain = useMemo(() => {
    const map = new Map<number, AcronymEntry[]>()
    for (const a of allAcronyms) {
      const list = map.get(a.domain) ?? []
      list.push(a)
      map.set(a.domain, list)
    }
    return map
  }, [allAcronyms])

  const byCategory = useMemo(() => {
    const map = new Map<string, AcronymEntry[]>()
    for (const a of allAcronyms) {
      const list = map.get(a.category) ?? []
      list.push(a)
      map.set(a.category, list)
    }
    return map
  }, [allAcronyms])

  return { allAcronyms, byDomain, byCategory }
}
