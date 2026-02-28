import questionBankData from '@/data/question_bank.json'
import {
  ExamQuestion,
  ExamPreset,
  QuestionBank,
  DOMAIN_DISTRIBUTION,
  PBQ_COUNTS,
  QuestionHistoryEntry,
  ExamAnswer,
  MCQuestion,
  MSQuestion,
  PBQOrderQuestion,
  PBQDragQuestion,
} from '@/types/exam'

const bank = questionBankData as QuestionBank

// ─── Question Selection ───

export function selectExamQuestions(
  preset: ExamPreset,
  history: Map<string, QuestionHistoryEntry>
): ExamQuestion[] {
  const allQuestions = bank.questions
  const domainQuotas = { ...DOMAIN_DISTRIBUTION[preset] }
  const pbqTotal = PBQ_COUNTS[preset]

  // Separate PBQ questions by domain
  const pbqs = allQuestions.filter(
    (q) => q.type === 'pbq_order' || q.type === 'pbq_drag'
  )
  const nonPbqs = allQuestions.filter(
    (q) => q.type === 'mcq' || q.type === 'msq'
  )

  const selected: ExamQuestion[] = []

  // Step 1: Distribute PBQs across domains proportionally
  const domainWeights: Record<number, number> = {}
  const totalWeight = Object.values(domainQuotas).reduce((a, b) => a + b, 0)
  for (const d of [1, 2, 3, 4, 5]) {
    domainWeights[d] = domainQuotas[d] / totalWeight
  }

  // Allocate PBQ slots per domain
  const pbqPerDomain: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  let pbqRemaining = pbqTotal
  const domainsByWeight = [1, 2, 3, 4, 5].sort(
    (a, b) => domainWeights[b] - domainWeights[a]
  )
  for (const d of domainsByWeight) {
    if (pbqRemaining <= 0) break
    const share = Math.max(1, Math.round(pbqTotal * domainWeights[d]))
    const assign = Math.min(share, pbqRemaining)
    pbqPerDomain[d] = assign
    pbqRemaining -= assign
  }

  // Select PBQs for each domain
  for (const d of [1, 2, 3, 4, 5]) {
    const count = pbqPerDomain[d]
    if (count === 0) continue
    const domainPbqs = pbqs.filter((q) => q.domain === d)
    const weighted = weightQuestions(domainPbqs, history)
    const picked = pickWeighted(weighted, count)
    selected.push(...picked)
    domainQuotas[d] -= count
  }

  // Step 2: Fill remaining quotas with MCQ/MSQ, applying difficulty distribution
  for (const d of [1, 2, 3, 4, 5]) {
    const remaining = domainQuotas[d]
    if (remaining <= 0) continue

    const pool = nonPbqs.filter((q) => q.domain === d)

    // Difficulty distribution: 40% easy (1), 44% medium (2), 16% hard (3)
    const easy = pool.filter((q) => q.difficulty === 1)
    const medium = pool.filter((q) => q.difficulty === 2)
    const hard = pool.filter((q) => q.difficulty === 3)

    const easyCount = Math.round(remaining * 0.4)
    const hardCount = Math.round(remaining * 0.16)
    const medCount = remaining - easyCount - hardCount

    const pickedEasy = pickWeighted(weightQuestions(easy, history), easyCount)
    const pickedMed = pickWeighted(weightQuestions(medium, history), medCount)
    const pickedHard = pickWeighted(weightQuestions(hard, history), hardCount)

    selected.push(...pickedEasy, ...pickedMed, ...pickedHard)
  }

  // Shuffle final selection
  return shuffleArray(selected)
}

function weightQuestions(
  questions: ExamQuestion[],
  history: Map<string, QuestionHistoryEntry>
): { question: ExamQuestion; weight: number }[] {
  return questions.map((q) => {
    const h = history.get(q.id)
    let weight: number
    if (!h || h.timesSeen === 0) {
      weight = 3 // never seen
    } else if (h.timesWrong > 0) {
      weight = 2 // seen + wrong
    } else {
      weight = 1 // seen + correct
    }
    return { question: q, weight }
  })
}

function pickWeighted(
  items: { question: ExamQuestion; weight: number }[],
  count: number
): ExamQuestion[] {
  if (items.length === 0) return []
  const picked: ExamQuestion[] = []
  const pool = [...items]

  while (picked.length < count && pool.length > 0) {
    const totalW = pool.reduce((sum, i) => sum + i.weight, 0)
    let r = Math.random() * totalW
    let idx = 0
    for (let i = 0; i < pool.length; i++) {
      r -= pool[i].weight
      if (r <= 0) {
        idx = i
        break
      }
    }
    picked.push(pool[idx].question)
    pool.splice(idx, 1)
  }

  return picked
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ─── Scoring ───

export function scoreAnswer(
  question: ExamQuestion,
  answer: string | string[] | Record<string, string>
): { pointsEarned: number; pointsPossible: number; correct: boolean } {
  switch (question.type) {
    case 'mcq':
      return scoreMCQ(question, answer as string)
    case 'msq':
      return scoreMSQ(question, answer as string[])
    case 'pbq_order':
      return scorePBQOrder(question, answer as string[])
    case 'pbq_drag':
      return scorePBQDrag(question, answer as Record<string, string>)
  }
}

function scoreMCQ(
  q: MCQuestion,
  answer: string
): { pointsEarned: number; pointsPossible: number; correct: boolean } {
  const correct = answer === q.correct_answer
  return { pointsEarned: correct ? 1 : 0, pointsPossible: 1, correct }
}

function scoreMSQ(
  q: MSQuestion,
  answer: string[]
): { pointsEarned: number; pointsPossible: number; correct: boolean } {
  let correctCount = 0
  for (const a of answer) {
    if (q.correct_answers.includes(a)) correctCount++
  }
  const earned = correctCount // 1pt per correct selection, max 2
  const correct = earned === q.correct_answers.length && answer.length === q.correct_answers.length
  return { pointsEarned: Math.min(earned, 2), pointsPossible: 2, correct }
}

function scorePBQOrder(
  q: PBQOrderQuestion,
  answer: string[]
): { pointsEarned: number; pointsPossible: number; correct: boolean } {
  let earned = 0
  for (let i = 0; i < q.correct_order.length; i++) {
    if (answer[i] === q.correct_order[i]) {
      earned += 0.5
    }
  }
  const correct = earned === 3
  return { pointsEarned: Math.min(earned, 3), pointsPossible: 3, correct }
}

function scorePBQDrag(
  q: PBQDragQuestion,
  answer: Record<string, string>
): { pointsEarned: number; pointsPossible: number; correct: boolean } {
  let earned = 0
  for (const [itemId, zoneId] of Object.entries(q.correct_mapping)) {
    if (answer[itemId] === zoneId) {
      earned += 0.5
    }
  }
  const correct = earned === 3
  return { pointsEarned: Math.min(earned, 3), pointsPossible: 3, correct }
}

// ─── Results Calculation ───

export function calculateExamResults(
  answers: ExamAnswer[]
): {
  totalPointsEarned: number
  totalPointsPossible: number
  percentage: number
  passed: boolean
  domainBreakdown: Record<string, { earned: number; possible: number; percentage: number }>
} {
  let totalEarned = 0
  let totalPossible = 0
  const domains: Record<string, { earned: number; possible: number }> = {}

  for (const a of answers) {
    totalEarned += a.pointsEarned
    totalPossible += a.pointsPossible
    const dk = String(a.domain)
    if (!domains[dk]) domains[dk] = { earned: 0, possible: 0 }
    domains[dk].earned += a.pointsEarned
    domains[dk].possible += a.pointsPossible
  }

  const percentage = totalPossible > 0 ? (totalEarned / totalPossible) * 100 : 0
  const domainBreakdown: Record<string, { earned: number; possible: number; percentage: number }> = {}
  for (const [dk, v] of Object.entries(domains)) {
    domainBreakdown[dk] = {
      ...v,
      percentage: v.possible > 0 ? (v.earned / v.possible) * 100 : 0,
    }
  }

  return {
    totalPointsEarned: totalEarned,
    totalPointsPossible: totalPossible,
    percentage,
    passed: percentage >= 83.3, // ~750/900 CompTIA scale
    domainBreakdown,
  }
}
