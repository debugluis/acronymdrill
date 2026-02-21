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
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      messages: [
        {
          role: 'user',
          content: `You are helping someone study for CompTIA Security+ SY0-701.
They are learning the acronym ${id} (${fullName}).
The standard explanation isn't clicking for them.
Give them a completely different, simpler explanation in 2-3 sentences maximum.
Use a real-world analogy if possible. Plain English only, no jargon.`,
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
