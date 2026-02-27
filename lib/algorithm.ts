import { AcronymEntry, AcronymProgress, MasteryLevel, Question, QuestionType } from '@/types'

export function calculateWeaknessScore(correct: number, wrong: number): number {
  if (correct + wrong === 0) return 0.5
  return wrong / (correct + wrong)
}

export function calculateMasteryLevel(progress: AcronymProgress): MasteryLevel {
  const { timesTestedCorrect, timesTestedWrong, accuracyRate, streak } = progress
  if (timesTestedCorrect + timesTestedWrong === 0) return 'unseen'
  if (accuracyRate < 0.5) return 'learning'
  if (accuracyRate < 0.8) return 'practicing'
  if (accuracyRate >= 0.95 && streak >= 3) return 'mastered'
  return 'confident'
}

export function selectReinforcementAcronyms(
  acronyms: AcronymEntry[],
  progressMap: Map<string, AcronymProgress>,
  count = 20
): AcronymEntry[] {
  const unseen = acronyms.filter((a) => {
    const p = progressMap.get(a.id)
    return !p || p.timesSeenInTraining === 0
  })

  const weak = acronyms.filter((a) => {
    const p = progressMap.get(a.id)
    return p && p.timesSeenInTraining > 0 && p.weaknessScore >= 0.5
  })

  const learning = acronyms.filter((a) => {
    const p = progressMap.get(a.id)
    return p && p.masteryLevel === 'learning' && p.weaknessScore < 0.5
  })

  const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5)

  const pool = [
    ...shuffle(unseen),
    ...shuffle(weak),
    ...shuffle(learning),
  ]

  const seen = new Set<string>()
  const result: AcronymEntry[] = []
  for (const a of pool) {
    if (!seen.has(a.id)) {
      seen.add(a.id)
      result.push(a)
    }
    if (result.length >= count) break
  }
  return result
}

export function weightedRandom<T>(items: T[], weights: number[]): T {
  const total = weights.reduce((sum, w) => sum + w, 0)
  let rand = Math.random() * total
  for (let i = 0; i < items.length; i++) {
    rand -= weights[i]
    if (rand <= 0) return items[i]
  }
  return items[items.length - 1]
}

export function selectHardModeAcronyms(
  acronyms: AcronymEntry[],
  progressMap: Map<string, AcronymProgress>,
  count = 35
): AcronymEntry[] {
  const weights = acronyms.map((a) => {
    const p = progressMap.get(a.id)
    if (!p) return 5
    return Math.max(1, Math.round(p.weaknessScore * 10))
  })

  const selected: AcronymEntry[] = []
  const selectedIds = new Set<string>()

  while (selected.length < count && selected.length < acronyms.length) {
    const pick = weightedRandom(acronyms, weights)
    if (!selectedIds.has(pick.id)) {
      selectedIds.add(pick.id)
      selected.push(pick)

      // Add confusable pairs
      if (pick.confusedWith) {
        for (const confusedId of pick.confusedWith) {
          if (!selectedIds.has(confusedId)) {
            const confusedEntry = acronyms.find((a) => a.id === confusedId)
            if (confusedEntry && selected.length < count) {
              selectedIds.add(confusedId)
              selected.push(confusedEntry)
            }
          }
        }
      }
    }
  }

  return selected.slice(0, count)
}

function sanitizeScenarioText(text: string, acronymId: string): string {
  const escaped = acronymId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`\\b${escaped}\\b`, 'gi')
  return text.replace(regex, '[___]')
}

function scoreDistractorSimilarity(
  target: AcronymEntry,
  candidate: AcronymEntry,
  mode: 'id' | 'fullName'
): number {
  let score = 0

  // Explicitly marked as confusable — highest priority
  if (target.confusedWith?.includes(candidate.id)) score += 20
  if (candidate.confusedWith?.includes(target.id)) score += 20

  // Same category and domain
  if (candidate.category === target.category) score += 5
  if (candidate.domain === target.domain) score += 2

  if (mode === 'id') {
    // Shared leading characters in the acronym string
    let prefix = 0
    for (let i = 0; i < Math.min(target.id.length, candidate.id.length); i++) {
      if (target.id[i] === candidate.id[i]) prefix++
      else break
    }
    score += prefix * 3

    // Shared characters overall (e.g. DNS vs DNSSEC share D,N,S)
    const targetChars = new Set(target.id.split(''))
    score += candidate.id.split('').filter((c) => targetChars.has(c)).length
  } else {
    // Shared meaningful words in the full name (ignore short words)
    const targetWords = new Set(
      target.fullName.toLowerCase().split(/[\s,/-]+/).filter((w) => w.length > 2)
    )
    const sharedWords = candidate.fullName
      .toLowerCase()
      .split(/[\s,/-]+/)
      .filter((w) => targetWords.has(w)).length
    score += sharedWords * 4
  }

  return score
}

function getSmartDistractors(
  target: AcronymEntry,
  allAcronyms: AcronymEntry[],
  count: number,
  mode: 'id' | 'fullName'
): AcronymEntry[] {
  const scored = allAcronyms
    .filter((a) => a.id !== target.id)
    .map((candidate) => ({ candidate, score: scoreDistractorSimilarity(target, candidate, mode) }))
    .sort((a, b) => b.score - a.score)

  // Take the top similar pool then shuffle within it for variety
  const poolSize = Math.min(count * 4, scored.length)
  const topPool = scored.slice(0, poolSize)
  const shuffled = [...topPool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count).map((s) => s.candidate)
}

export function generateQuestion(
  acronym: AcronymEntry,
  allAcronyms: AcronymEntry[],
  type: QuestionType
): Question {
  switch (type) {
    case 1: {
      // Acronym → Full Name
      const others = getSmartDistractors(acronym, allAcronyms, 3, 'fullName')
      const options = [acronym.fullName, ...others.map((o) => o.fullName)].sort(
        () => Math.random() - 0.5
      )
      return { type, acronym, options, correctAnswer: acronym.fullName }
    }
    case 2: {
      // Full Name → Acronym
      const others = getSmartDistractors(acronym, allAcronyms, 3, 'id')
      const options = [acronym.id, ...others.map((o) => o.id)].sort(() => Math.random() - 0.5)
      return { type, acronym, options, correctAnswer: acronym.id }
    }
    case 3: {
      // Swipe True/False
      const isCorrect = Math.random() > 0.5
      if (isCorrect) {
        return {
          type,
          acronym,
          correctAnswer: 'true',
          options: [`${acronym.id}: ${acronym.fullName}`],
        }
      } else {
        const wrong = getSmartDistractors(acronym, allAcronyms, 1, 'fullName')[0]
        return {
          type,
          acronym,
          correctAnswer: 'false',
          options: [`${acronym.id}: ${wrong.fullName}`],
        }
      }
    }
    case 4: {
      // Match Pairs
      const others = getSmartDistractors(acronym, allAcronyms, 3, 'fullName')
      const pairs = [acronym, ...others].map((a) => ({ left: a.id, right: a.fullName }))
      const shuffledPairs = pairs.sort(() => Math.random() - 0.5)
      return { type, acronym, pairItems: shuffledPairs, correctAnswer: acronym.fullName }
    }
    case 5: {
      // Fill the blank
      return { type, acronym, correctAnswer: acronym.id }
    }
    case 6: {
      // Scenario
      const others = getSmartDistractors(acronym, allAcronyms, 3, 'id')
      const options = [acronym.id, ...others.map((o) => o.id)].sort(() => Math.random() - 0.5)
      return {
        type,
        acronym,
        options,
        correctAnswer: acronym.id,
        scenarioText: sanitizeScenarioText(acronym.realWorldExample, acronym.id),
      }
    }
    default:
      return { type: 1, acronym, options: [], correctAnswer: acronym.fullName }
  }
}

export function selectQuestionTypes(mode: 'normal' | 'hard'): QuestionType[] {
  if (mode === 'normal') {
    // Types 1,2 more common; type 6 less common
    return [1, 1, 1, 2, 2, 2, 3, 3, 4, 4, 5, 6] as QuestionType[]
  } else {
    // Hard: biased toward types 4, 5, 6
    return [1, 2, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6] as QuestionType[]
  }
}

export function pickRandomQuestionType(mode: 'normal' | 'hard'): QuestionType {
  const types = selectQuestionTypes(mode)
  return types[Math.floor(Math.random() * types.length)]
}
