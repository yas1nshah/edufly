// app/api/ai/gemini-2.0-flash/route.ts
import { NextRequest } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { auth } from '@/lib/auth'


const GEMINI_API_KEY = process.env.GEMINI_API_KEY!

// Function to track AI token usage via API call
async function trackTokenUsage(userId: string, tokens: number) {
  if (!userId || tokens <= 0) return
  
  try {
    // Calculate increments (1 per 50 tokens)
    const increments = Math.floor(tokens / 150)
    
    if (increments > 0) {
      // console.log(`📈 Tracking ${increments} usage increments for ${tokens} tokens (user: ${userId})`)
      
      // Call internal API route that can use Prisma (Node.js runtime)
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
      const response = await fetch(`${baseUrl}/api/ai/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          type: 'ai_tokens',
          increments
        })
      })
      
      if (!response.ok) {
        // console.error(`❌ Usage tracking API failed: ${response.status}`)
      } else {
        // console.log(`✅ Usage tracking completed: +${increments} increments`)
      }
    }
  } catch (error) {
    // console.error('❌ Error tracking token usage:', error)
    // Don't throw - continue with response even if usage tracking fails
  }
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession(req)
  const userId = session?.user.id
  
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
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
  let totalOutputTokens = 0
  let totalInputTokens = 0
  let lastTrackedTokens = 0 // Track tokens already counted for usage
  
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      // console.log('🚀 Starting Gemini stream generation...')
      
      try {
        for await (const chunk of geminiStream.stream) {
          // Track usage metadata if available
          if (chunk.usageMetadata) {
            totalInputTokens = chunk.usageMetadata.promptTokenCount || 0
            totalOutputTokens = chunk.usageMetadata.candidatesTokenCount || 0
            
            const currentTotalTokens = totalInputTokens + totalOutputTokens
            
            // console.log('📊 Token usage update:', {
            //   inputTokens: totalInputTokens,
            //   outputTokens: totalOutputTokens,
            //   totalTokens: currentTotalTokens
            // })
            
            // Track usage in increments of 50 tokens
            const newTokensSinceLastTracking = currentTotalTokens - lastTrackedTokens
            if (newTokensSinceLastTracking >= 50) {
              await trackTokenUsage(userId, newTokensSinceLastTracking)
              lastTrackedTokens = currentTotalTokens
            }
          }
          
          // chunk.text is a function, so call it!
          const text = typeof chunk.text === 'function' ? chunk.text() : chunk.text
          if (text) {
            controller.enqueue(encoder.encode(text))
          }
        }
        
        // Final token tracking for any remaining tokens
        const finalTotalTokens = totalInputTokens + totalOutputTokens
        const remainingTokens = finalTotalTokens - lastTrackedTokens
        if (remainingTokens > 0) {
          await trackTokenUsage(userId, remainingTokens)
        }
        
        // Final token count log
        // console.log('✅ Stream completed. Final token usage:', {
        //   inputTokens: totalInputTokens,
        //   outputTokens: totalOutputTokens,
        //   totalTokens: finalTotalTokens,
        //   promptLength: prompt.length,
        //   userId: userId
        // })
        
      } catch (error) {
        // console.error('❌ Error during stream processing:', error)
        controller.error(error)
        return
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