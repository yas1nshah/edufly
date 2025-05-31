
import { auth } from "@/lib/auth"
import { chapters as chapterData } from "@/lib/course-data"
import db from "@/lib/db"
import { NextRequest } from "next/server"

export const GET = async (req: NextRequest, {params}: {params: Promise<{id: string}>}) => {
  const session = await auth.api.getSession(req)
  const userId = session?.user.id

  if (!userId) return new Response("Unauthorized", { status: 401 })

  const { id } = await params

  if (!id || typeof id !== "string") return new Response("Invalid ID", { status: 400 })

  const course = await db.course.findUnique({
    where: {
     id
    },
    select: {
      id: true,
      title: true,
      description: true,
      createdAt: true,
      updatedAt: true,
      authorId: true,
      sharedWith: {
        select: { id: true },
      },
      chapters: {
        select: {
          id: true,
          title: true,
          duration: true,
          content: true,
        },
      },
      files: {
        select: {
          id: true,
          name: true,
          type: true,
          size: true,
          key: true,
          createdAt: true,
        },
      },
    },
  })

  console.log(course)

  if (!course) {
    return new Response("Not found", { status: 405 })
  }

  if (course.authorId !== userId) {
    return new Response("Unauthorized", { status: 401 })
  }

  const completions = await db.userCourseCompletion.findMany({
    where: {
      userId,
      chapterId: {
        in: course.chapters.map(c => c.id),
      },
    },
    select: {
      chapterId: true,
      completed: true,

    },
  })

  const completedMap = new Set(completions.map(c => c.chapterId))

  const chapters = course.chapters.map((c) => ({
    ...c,
    completed: completedMap.has(c.id),
  }))

  const response = JSON.stringify({
    id: course.id,
    title: course.title,
    description: course.description,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
    chapters,
    files: course.files,
  })

  return new Response(
    response,
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  )
}
