import { auth } from "@/lib/auth"
import db from "@/lib/db"
import { NextRequest } from "next/server"

export const GET = async (req: NextRequest, { params }: { params: { id: string } }) => {
  const id = params.id
  const session = await auth.api.getSession(req)

  if (!session?.user.id) {
    return new Response("Unauthorized", { status: 401 })
  }

  const share = await db.sharedCourse.upsert({
    where: {
      courseId_sharedWith: {
        courseId: id,
        sharedWith: session.user.id,
      },
    },
    update: {},
    create: {
      courseId: id,
      sharedWith: session.user.id,
    },
  })

  return new Response(null, {
    status: 302,
    headers: {
      Location: `/dashboard/courses/${id}`,
    },
  })
}
