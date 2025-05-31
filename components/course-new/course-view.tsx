"use client"

import { useQuery } from '@tanstack/react-query'
import React from 'react'
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
