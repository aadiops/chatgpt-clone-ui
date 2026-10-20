import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const messages = Array.isArray(body?.messages) ? body.messages : []
    const model = typeof body?.model === 'string' && body.model ? body.model : 'gpt-4o-mini'
    const shouldStream = Boolean(body?.stream)

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
    const normalizedMessages = messages.map((message: { role?: string; content?: string }) => ({
      role: message.role === 'assistant' ? 'assistant' : 'user',
      content: String(message.content ?? ''),
    }))

    if (shouldStream) {
      const stream = await client.chat.completions.create({
        model,
        messages: normalizedMessages,
        stream: true,
        temperature: 0.7,
        max_tokens: 1200,
      })

      const encoder = new TextEncoder()
      const textStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              const content = chunk.choices?.[0]?.delta?.content ?? ''
              if (content) {
                controller.enqueue(encoder.encode(content))
              }
            }
            controller.close()
          } catch (error) {
            controller.error(error)
          }
        },
      })

      return new Response(textStream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
        },
      })
    }

    const completion = await client.chat.completions.create({
      model,
      messages: normalizedMessages,
      temperature: 0.7,
      max_tokens: 1200,
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
