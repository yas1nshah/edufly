import { auth } from "@/lib/auth"
import db from "@/lib/db"

export const POST = async (req: Request) => {
  const { title, description, chapters, files } = await req.json()
 
  const session = await auth.api.getSession(req)
  const user = session?.user.id

  if (!user) return new Response("Unauthorized", { status: 401 })
  const course = await db.course.create({
    data: {
      id: crypto.randomUUID(),
      title,
      description,
      authorId: user,
      files: {
        connect: files.map((file: string) => ({
          key: file,
        })),
      },
      chapters: {
        create: chapters.map((chapter: { title: string; duration: string; content: string }) => ({
          id: crypto.randomUUID(),
          title: chapter.title,
          duration: chapter.duration,
          content: chapter.content,
        })),
      }
    },
    include: {
      files: true,
    },
  })

  return new Response(JSON.stringify(course), {
    status: 201,
    headers: {
      "Content-Type": "application/json",
    },
  })

}


export const GET = async (req: Request) => {
  const session = await auth.api.getSession(req)
  const user = session?.user.id

  if (!user) return new Response("Unauthorized", { status: 401 })

  const courses = await db.course.findMany({
    where: {
      authorId: user,
    },
    select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        _count: {
            select: {
                chapters: true,
            }
        }
    }
  })

  console.log(courses)

  return new Response(JSON.stringify(courses), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  })
}