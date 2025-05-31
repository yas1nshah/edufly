"use client"

import { useQuery } from '@tanstack/react-query'
import React, { useEffect } from 'react'
import AiCourseBuilder from './ai-course-builder'
import { CourseBuilder } from './course-builder'


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

   if (isFetching) {
     return <div>Loading...</div>
   }

   if (!data) {
     return <div>Not found</div>
   }

  return (
    <div>
      <CourseBuilder courseData={data} />
    </div>
  )
}

export default CourceView
