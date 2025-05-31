
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


type Prop = {
    id: string | null;
    title: string;
    description: string;
    createdAt: Date | null;
    updatedAt: Date | null;
    chapters: {
        id: string | null;
        completed: boolean;
        title: string;
        duration: string;
        content: string;
    }[];
    files: {
        name: string;
        id: string;
        createdAt: Date;
        size: number;
        key: string;
        type: string;
    }[] | null;
} 

export const POST = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const session = await auth.api.getSession(req)
  const userId = session?.user.id

  if (!userId) return new Response("Unauthorized", { status: 401 })

  const { id } = await params
  if (!id || typeof id !== "string")
    return new Response("Invalid ID", { status: 400 })

  const existing = await db.course.findUnique({
    where: { id },
    select: {
      id: true,
      authorId: true,
    },
  })

  if (!existing) return new Response("Not found", { status: 404 })
  if (existing.authorId !== userId)
    return new Response("Unauthorized", { status: 401 })

  const body: Prop = await req.json()
  const { title, description, chapters, files } = body

  try {
    const ops = []

    // Update course info
    ops.push(
      db.course.update({
        where: { id },
        data: {
          title,
          description,
        },
      })
    )

    // Delete chapters not present in the update
    const incomingChapterIds = chapters.map((c) => c.id ?? "").filter(Boolean)
    ops.push(
      db.chapter.deleteMany({
        where: {
          courseId: id,
          id: { notIn: incomingChapterIds },
        },
      })
    )

    // For chapters: update if existing, insert if new and not duplicate
    for (const chapter of chapters) {
      const { id: chapterId, title, duration, content } = chapter

      if (chapterId) {
        // Update only if chapter has an ID
        ops.push(
          db.chapter.update({
            where: { id: chapterId },
            data: { title, duration, content },
          })
        )
      } else {
        // Insert only if not already present by title (or some other unique constraint)
        const exists = await db.chapter.findFirst({
          where: { title, courseId: id },
          select: { id: true },
        })

        if (!exists) {
          ops.push(
            db.chapter.create({
              data: {
                id: crypto.randomUUID(),
                title,
                duration,
                content,
                courseId: id,
              },
            })
          )
        }
      }
    }

    await db.$transaction(ops)

    return new Response("Course updated", { status: 200 })
  } catch (err) {
    console.error(err)
    return new Response("Internal Server Error", { status: 500 })
  }
}
