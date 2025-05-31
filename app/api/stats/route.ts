import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { NextRequest } from "next/server";


export const GET = async (req: NextRequest) => {
  const session = await auth.api.getSession(req);
  const userId =  session?.user.id;

  if (!userId) return new Response("Unauthorized", { status: 401 });

  const cources = await db.course.count({
    where: { authorId: userId },
  });

  const files = await db.file.count({
    where: { userId },
  });

  const sharedCourses = await db.sharedCourse.count({
    where: { sharedWith: userId },
  });

  const usage = await db.usage.findFirst({
    where: {
      userId,
      type: "ai_tokens",
    },
    select: {
      value: true,
    },
  });

  // Step 1: Get all completed chapterIds for this user
  const completions = await db.userCourseCompletion.findMany({
    where: {
      userId,
      completed: true,
    },
    select: {
      chapterId: true,
    },
  });

  const completedChapterIds = new Set(completions.map(c => c.chapterId));

  // Step 2: Get 5 most recent courses with chapters
  const recentCourses = await db.course.findMany({
    take: 5,
    orderBy: { updatedAt: "desc" },
    include: {
      chapters: {
        select: { id: true },
      },
    },
  });

  // Step 3: Calculate progress
  const progress = recentCourses.map(course => {
    const totalChapters = course.chapters.length;
    const completedCount = course.chapters.filter(ch =>
      completedChapterIds.has(ch.id)
    ).length;

    const progress = totalChapters > 0
      ? Math.round((completedCount / totalChapters) * 100)
      : 0;

    return {
      id: course.id,
      title: course.title,
      progress,
    };
  });

  return new Response(JSON.stringify({
    cources,
    files,
    sharedCourses,
    usage,
    progress
  }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
