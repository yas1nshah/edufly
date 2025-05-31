'use client'

import { SiteHeader } from '@/components/site-header'
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const CoursesPage = () => {
  const router = useRouter()

  const { data: courses, isFetching } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const res = await fetch('/api/course')
      return res.json()
    },
  })

  const { data: sharedCourses, isFetching: isFetchingShared } = useQuery({
    queryKey: ['courses-shared'],
    queryFn: async () => {
      const res = await fetch('/api/course/shared')
      return res.json()
    },
  })

  if (isFetching || isFetchingShared) {
    return <div className="p-6 text-center text-muted-foreground">Loading courses...</div>
  }

  const renderCourseCard = (course: any) => (
    <div
      key={course.id}
      onClick={() => router.push(`/dashboard/courses/${course.id}`)}
      className={cn(
        'cursor-pointer transition hover:shadow-md hover:scale-[1.02]',
        'bg-card rounded-md overflow-hidden aspect-square flex flex-col'
      )}
    >
      <div className="h-2/3 w-full bg-accent" />
      <div className="p-3 space-y-2 flex-1">
        <h2 className="text-sm font-semibold line-clamp-1">{course.title}</h2>
        <p className="text-xs text-muted-foreground line-clamp-2">{course.description}</p>
        <div className="flex flex-wrap gap-1 pt-1">
          <Badge variant="secondary" className="text-xs">
            {course._count.chapters} chapters
          </Badge>
          <Badge variant="outline" className="text-xs">
            Updated {formatDistanceToNow(new Date(course.updatedAt), { addSuffix: true })}
          </Badge>
        </div>
      </div>
    </div>
  )

  return (
    <div>
      <SiteHeader title="Courses" />
      <div className="p-4 space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">Your Courses</h2>
          {courses?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {courses.map(renderCourseCard)}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No courses yet.</p>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Shared with You</h2>
          {sharedCourses?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {sharedCourses.map(renderCourseCard)}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No shared courses.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default CoursesPage
