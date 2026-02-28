import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { admin } from '@/lib/firebase-admin'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '')

export async function POST(req: NextRequest) {
  // Verify Firebase ID token
  const authHeader = req.headers.get('Authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await admin.auth().verifyIdToken(token)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Parse body
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { wrongQuestions } = body as { wrongQuestions: Array<{
    id: string
    stem: string
    topic: string
    domain: number
    explanation: string
  }> }

  if (!Array.isArray(wrongQuestions) || wrongQuestions.length === 0) {
    return NextResponse.json({ error: 'No wrong questions provided' }, { status: 400 })
  }

  // Build prompt
  const questionsText = wrongQuestions
    .map(
      (q, i) =>
        `${i + 1}. [Domain ${q.domain} — ${q.topic}]\nQuestion: ${q.stem}\nKey concept: ${q.explanation}`
    )
    .join('\n\n')

  const prompt = `You are a CompTIA Security+ SY0-701 study coach. A student missed some exam questions. Write a quick-review cheat sheet of the fundamental concepts they need to revisit — NOT the answers, NOT detailed explanations.

Rules:
- Group by domain
- For each domain: one line stating the core concept, then 2-3 bullet points with simple "remember this" fundamentals (1 sentence each, plain language, no jargon)
- No introductions, no encouragement, no fluff — just the concepts
- Use ## for domain headers
- Total response MUST be under 250 words

Wrong questions:
${questionsText}`

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' })
    const result = await model.generateContent(prompt)
    const text = result.response.text()

    return NextResponse.json({ summary: text })
  } catch (error) {
    console.error('Gemini API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    )
  }
}
