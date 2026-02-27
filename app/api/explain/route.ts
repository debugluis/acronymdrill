import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { id, fullName } = await req.json()

    if (!id || !fullName) {
      return NextResponse.json({ error: 'Missing id or fullName' }, { status: 400 })
    }

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 180,
      messages: [
        {
          role: 'user',
          content: `You are a CompTIA Security+ SY0-701 study assistant.
Re-explain ${id} (${fullName}) in exactly 2 short sentences: one defining what the letters mean in a simple, easy-to-remember way (use an analogy or plain language — avoid jargon), one combining a quick example and its exam relevance.
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
