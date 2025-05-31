"use client"

import { useQuery } from '@tanstack/react-query'
import React, { useEffect } from 'react'
import AiCourseBuilder from './ai-course-builder'
import { CourseBuilder } from './course-builder'
import { Skeleton } from '../ui/skeleton'


const CourceView = ({id}: {id: string}) => {
  const {data, isFetching} = useQuery({
     queryKey: ['course', id],
     queryFn: async () => {
       const res = await fetch(`/api/course/${id}`)
       return res.json()
     },
     enabled: !!id,
   })

    useEffect(() => {
      if (!data?.id) return

      const recentCourses = JSON.parse(localStorage.getItem('recent_courses') || '[]')

      const alreadyExists = recentCourses.some((course: any) => course.id === data.id)
      if (alreadyExists) return

      const updatedCourses = [...recentCourses, { id: data.id, title: data.title }]
      localStorage.setItem('recent_courses', JSON.stringify(updatedCourses))
    }, [data])

    if (isFetching) return (
    <div className='p-4 space-y-4 '>
      <div className="flex gap-4">
        <div className="bg-card/50 space-y-4 grow h-screen/2 p-4 rounded-md">
          <Skeleton  className='h-20 w-full'/>
          <Skeleton  className='h-80 w-full'/>
          <Skeleton  className='h-20 w-full'/>
          <Skeleton  className='h-60 w-full'/>

        </div>
        <div className="bg-card/50 w-1/4 h-screen p-4 rounded-md space-y-4">
          <Skeleton  className='h-20 w-full'/>
          <Skeleton  className='h-48 w-full'/>
        </div>
      </div>
    </div>
    )

   if (!data) {
     return <div className='p-4 mx-auto my-auto w-full h-screen'>Not found</div>
   }

  return (
    <div>
      <CourseBuilder courseData={data} />
    </div>
  )
}

export default CourceView
