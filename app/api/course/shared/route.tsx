import { auth } from "@/lib/auth"
import db from "@/lib/db"


export const GET = async (req: Request) => {
  const session = await auth.api.getSession(req)
  const user = session?.user.id

  if (!user) return new Response("Unauthorized", { status: 401 })

  const shared = await db.sharedCourse.findMany({
    where: {
      sharedWith: user,
    },
  })

  const sharedCourses = shared.map((s) => s.courseId)

  const courses = await db.course.findMany({
    where: {
      id: {
        in: sharedCourses,
      } 
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
    }})

  return new Response(JSON.stringify(courses), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  })
}