"use client"


import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import Link from "next/link"

const COLORS = [
  "bg-red-500",
  "bg-green-500",
  "bg-blue-500",
  "bg-yellow-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-orange-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-lime-500",
]

function getRandomCourses(courses: any[], count: number) {
  const shuffled = [...courses].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

export function NavDocuments() {
  const recentCourses =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("recent_courses") || "[]")
      : []

  const randomCourses = getRandomCourses(recentCourses, 10)

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Recent Courses</SidebarGroupLabel>
      <SidebarMenu>
        {randomCourses.map((course: any, index: number) => {
          const dotColor = COLORS[index % COLORS.length] // deterministic, but still varied
          return (
            <SidebarMenuItem key={course.id}>
              <Link href={`/dashboard/courses/${course.id}`}>
                <SidebarMenuButton tooltip={course.title}>
                  <div className={`rounded-full w-2 h-2 aspect-square ${dotColor}`} />
                  {course.icon && <course.icon />}
                  <span>{course.title}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}