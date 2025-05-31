// app/api/usage/track/route.ts
import { NextRequest, NextResponse } from 'next/server'
import  db  from '@/lib/db' // Adjust import path as needed

// This runs on Node.js runtime (default) to use Prisma

export async function POST(req: NextRequest) {
  try {
    const { userId, type, increments } = await req.json()
    
    // Validate required fields
    if (!userId || !type || !increments || increments <= 0) {
      return NextResponse.json(
        { error: 'Invalid parameters. userId, type, and increments are required.' },
        { status: 400 }
      )
    }
    
    // console.log(`📊 Processing usage tracking: ${increments} increments for user ${userId} (type: ${type})`)
    
    // Upsert usage record using composite unique key (userId + type)
    const usage = await db.usage.upsert({
      where: {
        userId_type: {
          userId: userId,
          type: type
        }
      },
      update: {
        value: {
          increment: increments
        }
      },
      create: {
        userId: userId,
        type: type,
        value: increments
      }
    })
    
    // console.log(`✅ Usage tracking successful:`, {
    //   userId,
    //   type,
    //   newValue: usage.value,
    //   incremented: increments
    // })
    
    return NextResponse.json({
      success: true,
      usage: {
        userId: usage.userId,
        type: usage.type,
        value: usage.value,
        incremented: increments
      }
    })
    
  } catch (error) {
    // console.error('❌ Error in usage tracking API:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error during usage tracking',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}