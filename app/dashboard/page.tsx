'use client'

import { SiteHeader } from '@/components/site-header'
import React from 'react'
import {
  Card, CardContent, CardHeader, CardTitle
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {  BookOpen } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'

const Dashboard = () => {
  const { data, isFetching } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const res = await fetch('/api/stats')
      return res.json()
    }
  })

  if (isFetching) return (
  <div className='p-4 space-y-4 mt-10'>
    <div className="flex gap-4">
      <Skeleton  className='h-48 w-full'/>
      <Skeleton  className='h-48 w-full'/>
      <Skeleton  className='h-48 w-full'/>
      <Skeleton  className='h-48 w-full'/>
    </div>
      <Skeleton  className='h-64 w-full'/>
  </div>
  )
  if (!data) return <div>Loading...</div>

  return (
    <div className="min-h-screen space-y-6 bg-muted/40">
      <SiteHeader title="Dashboard" />

      <div className="p-4 space-y-6">

        {/* Welcome Section */}
        <div className="rounded-xl bg-background p-6 shadow-sm border">
          <h2 className="text-2xl font-semibold">Welcome back, Yasin 👋</h2>
          <p className="text-muted-foreground mt-1">
            Here’s what’s happening in your learning platform today.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card  className="flex flex-col justify-between">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Courses Created</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.cources || 0}</div>
              </CardContent>
            </Card>

            <Card  className="flex flex-col justify-between">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Shared Courses</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.sharedCourses || 0}</div>
              </CardContent>
            </Card>  
                    
            <Card  className="flex flex-col justify-between">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Files Uploaded</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.files || 0}</div>
              </CardContent>
            </Card>          
                    
            <Card  className="flex flex-col justify-between">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tokens Used</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.usage.value || 0}</div>
              </CardContent>
            </Card>          

        </div>

        {/* Active Courses */}
        <Card>
          <CardHeader>
            <CardTitle>Active Courses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.progress.map((course: { id: string, title: string, progress: number }, index: number) => (
              <div key={index} className="bg-accent p-4 rounded-md flex justify-between gap-4">
                <div className='grow space-y-2'>
                  <div className="flex justify-between items-center text-sm font-medium">
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
