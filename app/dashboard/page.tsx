'use client'

import { SiteHeader } from '@/components/site-header'
import React from 'react'
import {
  Card, CardContent, CardHeader, CardTitle
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GraduationCap, BookOpen, Users, Activity } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'


const Dashboard = () => {
  const {data, isFetching} = useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const res = await fetch('/api/stats')
      return res.json()
    }
  })

  
  const statCards = [
    { title: 'Course Created', value: data.cources, icon: BookOpen },
    { title: 'Shared Cources', value: data.sharedCourses, icon: Users }, 
    { title: 'Files Uploaded', value: data.files, icon: GraduationCap },
    { title: 'Token Used', value: data.usage || 0, icon: Activity },
  ]

  return (
    <div className="min-h-screen space-y-6 bg-muted/40">
      <SiteHeader title="Dashboard" />


     <div className="p-4  space-y-6">


      {/* Welcome Section */}
      <div className="rounded-xl bg-background p-6 shadow-sm border">
        <h2 className="text-2xl font-semibold">Welcome back, Yasin 👋</h2>
        <p className="text-muted-foreground mt-1">
          Here’s what’s happening in your learning platform today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <Card key={idx} className="flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Courses */}
      <Card>
        <CardHeader>
          <CardTitle>Active Courses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.progress.map((course:any, index:number) => (
            <div key={index} className=" bg-accent p-4 rounded-md flex justify-between gap-4">
              <div className='grow space-y-2'>

                <div className=" flex justify-between items-center text-sm font-medium">
                  <span>{course.title}</span>
                  <span className="text-muted-foreground">{course.progress}%</span>
                </div>
                <Progress value={course.progress} />
                </div>
                <Link href={`/dashboard/courses/${course.id}`}>
                  <Button variant={'outline'}>Continue</Button>
                </Link>
            </div>
          ))}
          
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <div>
              You published <strong>“Intro to LLMs”</strong>
            </div>
            <Badge variant="outline">2 hours ago</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <strong>Sarah</strong> completed <strong>“React Basics”</strong>
            </div>
            <Badge variant="outline">Today</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              You updated the syllabus for <strong>“AI for Beginners”</strong>
            </div>
            <Badge variant="outline">Yesterday</Badge>
          </div>
        </CardContent>
      </Card>

    </div>
    </div>
  )
}

export default Dashboard
