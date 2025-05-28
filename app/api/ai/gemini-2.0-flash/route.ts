// app/api/ai/gemini-2.0-flash/route.ts
import { NextRequest } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const runtime = 'edge'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!

export async function POST(req: NextRequest) {
  const { prompt } = await req.json()

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

  // Each PDF is a part
  const parts = [
    { text: prompt }
  ]

  const content = [
    {
      role: 'user',
      parts,
    },
  ]

  const geminiStream = await model.generateContentStream({ contents: content })

  const encoder = new TextEncoder()
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      for await (const chunk of geminiStream.stream) {
        // chunk.text is a function, so call it!
        const text = typeof chunk.text === 'function' ? chunk.text() : chunk.text
        if (text) {
          controller.enqueue(encoder.encode(text))
        }
      }
      controller.close()
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  })
}
