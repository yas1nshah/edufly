import { auth } from "@/lib/auth"
import db from "@/lib/db"
import { NextRequest } from "next/server"
import { redirect } from 'next/navigation'

export const GET = async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const id = (await (params)).id
  const session = await auth.api.getSession(req)

  if (!session?.user.id) {
    return new Response("Unauthorized", { status: 401 })
  }

  await db.sharedCourse.upsert({
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

  return redirect(`/dashboard/courses/${id}`)
}
