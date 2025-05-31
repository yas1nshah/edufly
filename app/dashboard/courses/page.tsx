'use client'

import { SiteHeader } from '@/components/site-header'
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
// Using a simple date formatter since date-fns isn't available
const formatDistanceToNow = (date: Date) => {
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return 'today'
  if (diffInDays === 1) return '1 day ago'
  if (diffInDays < 30) return `${diffInDays} days ago`
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`
  return `${Math.floor(diffInDays / 365)} years ago`
}
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const CoursesPage = () => {
  const router = useRouter()

  // Array of beautiful pattern images from Unsplash
  const patternImages = [
    'https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=400&h=300&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=400&h=300&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&h=300&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=300&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=400&h=300&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&h=300&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?w=400&h=300&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1541728472741-03e45a58cf88?w=400&h=300&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop&auto=format'
  ]

  // Function to get a consistent image for each course based on its ID
  const getCourseImage = (courseId: string) => {
    const hash = courseId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    return patternImages[Math.abs(hash) % patternImages.length]
  }

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
      <div 
        className="h-2/3 w-full bg-cover bg-center relative"
        style={{
          backgroundImage: `url(${getCourseImage(course.id)})`
        }}
      >
        <div className="absolute inset-0 bg-black/10" />
      </div>
      <div className="p-3 space-y-2 flex-1">
        <h2 className="text-sm font-semibold line-clamp-1">{course.title}</h2>
        <p className="text-xs text-muted-foreground line-clamp-2">{course.description}</p>
        <div className="flex flex-wrap gap-1 pt-1">
          <Badge variant="secondary" className="text-xs">
            {course._count.chapters} chapters
          </Badge>
          <Badge variant="outline" className="text-xs">
            Updated {formatDistanceToNow(new Date(course.updatedAt))}
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