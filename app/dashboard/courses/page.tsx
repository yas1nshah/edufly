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
import { Skeleton } from '@/components/ui/skeleton'

const CoursesPage = () => {
  const router = useRouter()

  // Array of beautiful pattern images from Unsplash
  const patternImages = [
    'https://plus.unsplash.com/premium_vector-1689096935962-4cfad82ec090',
    'https://plus.unsplash.com/premium_vector-1689096624566-db0de5ab24a8',
    'https://plus.unsplash.com/premium_vector-1697729857628-1c520b61c0d0',
    'https://plus.unsplash.com/premium_vector-1697729853800-0a48e3e9308f',
    'https://plus.unsplash.com/premium_vector-1745338399099-6c85fc198361',
    'https://plus.unsplash.com/premium_vector-1714618872538-536bed91c905',
    'https://plus.unsplash.com/premium_vector-1697729834472-4c30492dd442',
    'https://plus.unsplash.com/premium_vector-1723514408054-ceb858c06755',
    'https://plus.unsplash.com/premium_vector-1723219830754-b0f793bf4a77',
    'https://plus.unsplash.com/premium_vector-1689096935962-4cfad82ec090',
    'https://plus.unsplash.com/premium_vector-1711987745290-7616f2931f61',
    'https://plus.unsplash.com/premium_vector-1697729853800-0a48e3e9308f',
    'https://plus.unsplash.com/premium_vector-1697729855653-a0f86e33c2d6',
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

  if (isFetching || isFetchingShared) return (
  <div className='p-4 space-y-4 mt-10'>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      <Skeleton  className='h-auto aspect-square'/>
      <Skeleton  className='h-auto aspect-square'/>
      <Skeleton  className='h-auto aspect-square'/>
      <Skeleton  className='h-auto aspect-square'/>
    </div>
      <Skeleton  className='h-64 w-full'/>
  </div>
  )

  const renderCourseCard = (course: { id: string; title: string, description: string, updatedAt: Date, _count: { chapters: number } }) => (
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