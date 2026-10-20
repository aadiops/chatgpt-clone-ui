import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const messages = Array.isArray(body?.messages) ? body.messages : []
    const model = typeof body?.model === 'string' && body.model ? body.model : 'gpt-4o-mini'

    if (!messages.length) {
      return NextResponse.json({ error: 'No messages were provided.' }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'Missing OPENAI_API_KEY. Add it to your .env.local file to enable real model responses.',
        },
        { status: 401 }
      )
    }

    const client = new OpenAI({ apiKey })
    const completion = await client.chat.completions.create({
      model,
      messages: messages.map((message: any) => ({
        role: message.role === 'user' ? 'user' : 'assistant',
        content: String(message.content || ''),
      })),
      temperature: 0.7,
    })

    const content = completion.choices?.[0]?.message?.content || 'No response returned.'

    return NextResponse.json({ content })
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error?.message || 'Failed to generate a response.',
      },
      { status: 500 }
    )
  }
}
