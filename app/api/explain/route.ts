import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { admin } from '@/lib/firebase-admin'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(req: NextRequest) {
  // C2 — Verify Firebase ID token
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

  // C3 — Validate and sanitize input
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { id, fullName } = body as Record<string, unknown>

  if (typeof id !== 'string' || typeof fullName !== 'string') {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const cleanId = id.trim()
  const cleanFullName = fullName.trim()

  if (!cleanId || !cleanFullName) {
    return NextResponse.json({ error: 'Missing id or fullName' }, { status: 400 })
  }

  if (cleanId.length > 20 || cleanFullName.length > 200) {
    return NextResponse.json({ error: 'Input too long' }, { status: 400 })
  }

  if (!/^[A-Za-z0-9\-\/]+$/.test(cleanId)) {
    return NextResponse.json({ error: 'Invalid acronym format' }, { status: 400 })
  }

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 180,
      messages: [
        {
          role: 'user',
          content: `You are a CompTIA Security+ SY0-701 study assistant.
Re-explain ${cleanId} (${cleanFullName}) in exactly 2 short sentences: one defining what the letters mean in a simple, easy-to-remember way (use an analogy or plain language — avoid jargon), one combining a quick example and its exam relevance.
No headers. No filler.`,
        },
      ],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    return NextResponse.json({ explanation: text })
  } catch (error) {
    console.error('Claude API error:', error)
    return NextResponse.json({ error: 'Failed to generate explanation' }, { status: 500 })
  }
}
