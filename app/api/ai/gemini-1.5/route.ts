// app/api/ai/gemini-1.5/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const runtime = 'edge'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!

export async function POST(req: NextRequest) {
  const { fileBase64, prompt } = await req.json()

  // Initialize Gemini 1.5
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-latest' })

  // Prepare the content for Gemini
  const content = [
    {
      role: 'user',
      parts: [
        { text: prompt },
        {
          inlineData: {
            mimeType: 'application/pdf',
            data: fileBase64.split(',')[1], // Remove data:...;base64, prefix
          },
        },
      ],
    },
  ]

  // Call Gemini
  const result = await model.generateContent({ contents: content })
  const text = result.response.text()

  return NextResponse.json({ result: text })
}
