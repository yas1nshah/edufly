import { auth } from "@/lib/auth"
import db from "@/lib/db"
import { NextRequest } from "next/server"

export const GET = async (req: NextRequest, {params}: {params: Promise<{id: string}>}) => {
  const session = await auth.api.getSession(req)
  const userId = session?.user.id

  if (!userId) return new Response("Unauthorized", { status: 401 })

  const { id } = await params

  if (!id) return new Response("Invalid ID", { status: 400 })

  const chapter = await db.chapter.findMany({
    where: {
      courseId: id,
    },
    select: {
      id: true,

    },
  })

  const status = await db.userCourseCompletion.findMany({
    where: {
        userId,
        chapterId: {
            in: chapter.map(c => c.id),
        },
    },
    select: {
      chapterId: true,
      completed: true,

    },
  })

  return new Response(JSON.stringify(status), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    }
  })
}

export const POST = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const session = await auth.api.getSession(req)
  const userId = session?.user.id

  if (!userId) return new Response("Unauthorized", { status: 401 })

  const { id } = await params
  if (!id) return new Response("Invalid ID", { status: 400 })

  const body = await req.json()
  const { chapterId, completed } = body

  if (!chapterId) return new Response("Invalid chapter ID", { status: 400 })

  try {
    await db.userCourseCompletion.upsert({
      where: {
        userId_chapterId: { userId, chapterId }, // assumes unique constraint
      },
      create: {
        userId,
        chapterId,
        completed,
      },
      update: {
        completed,
      },
    })

    return new Response("Completion status updated", { status: 200 })
  } catch (err) {
    console.error(err)
    return new Response("Internal Server Error", { status: 500 })
  }
}
