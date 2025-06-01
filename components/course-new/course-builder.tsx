"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Play, CheckCircle, Clock, Edit3, Eye, Plus, Save, X, Trash2, Share2 } from "lucide-react"
import { MDXContent } from "@/components/course-new/mdx-content"
import { NotionEditor } from "@/components/course-new/notion-editor"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import FileCard from "./file-card"
import SmartAssistant from "./smart-assistant"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { BASE_URL } from "@/constants/urls"


// NEW TYPE
type Prop = {
  id: string | null;
  authorId?: string; // Add authorId to the type
  title: string;
  description: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  chapters: {
    id: string | null;
    completed: boolean;
    title: string;
    duration: string;
    content: string;
  }[];
  files: {
    name: string;
    id: string;
    createdAt: Date;
    size: number;
    key: string;
    type: string;
  }[] | null;
}

// CourseStatus type
type CourseStatusItem = {
  chapterId: string;
  completed: boolean;
}

export function CourseBuilder({ courseData }: { courseData: Prop }) {

  const session = authClient.useSession()
  const userId = session?.data?.user.id

  // Check if current user is the author
  const isAuthor = courseData.authorId === userId

  const router = useRouter()
  const [activeChapter, setActiveChapter] = useState(courseData.chapters[0]?.id)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState("")
  const [courseChapters, setCourseChapters] = useState(courseData.chapters)
  const [forceRender, setForceRender] = useState(0)
  const [updatingChapter, setUpdatingChapter] = useState<string | null>(null)
  const [shareTooltipOpen, setShareTooltipOpen] = useState(false)

  const queryClient = useQueryClient()

  const { data: courseStatus} = useQuery<CourseStatusItem[]>({
    queryKey: ["course-status", courseData.id],
    queryFn: async () => {
      const res = await fetch(`/api/course/${courseData.id}/status`)
      return res.json()
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    staleTime: 0, // Always consider data stale
    gcTime: 0, // Don't cache the data
  })

  // Helper function to check if a chapter is completed
  const isChapterCompleted = (chapterId: string | null): boolean => {
    if (!chapterId || !courseStatus) return false
    return courseStatus.some(status => status.chapterId === chapterId && status.completed)
  }

  // Get completed chapters count
  const completedChaptersCount = courseStatus 
    ? courseStatus.filter(status => status.completed).length 
    : 0

  const statusMutation = useMutation({
    mutationFn: async ({ chapterId, completed }: { chapterId: string; completed: boolean }) => {
      const res = await fetch(`/api/course/${courseData.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapterId, completed }),
      })

      if (!res.ok) throw new Error("Failed to update course")
      return res.json()
    },
    onMutate: ({ chapterId }) => {
      setUpdatingChapter(chapterId)
    },
    onSuccess: async () => {
      // Force refetch the query data
      await queryClient.invalidateQueries({ 
        queryKey: ["course-status", courseData.id],
        exact: true 
      })
      
      // Also refetch immediately to ensure UI updates
      await queryClient.refetchQueries({ 
        queryKey: ["course-status", courseData.id],
        exact: true 
      })
      
      setForceRender(prev => prev + 1)
      setUpdatingChapter(null)
    },
    onError: (error) => {
      console.error("Failed to update chapter status:", error)
      setUpdatingChapter(null)
    }
  })

  // Delete course mutation
  const deleteMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const res = await fetch(`/api/course/${courseId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to delete course")
      }

      return res.json()
    },
    onSuccess: () => {
      // Navigate to courses dashboard after successful deletion
      router.push("/dashboard/courses")
    },
    onError: (error) => {
      console.error("Failed to delete course:", error)
      // You might want to show a toast notification here
      alert(`Failed to delete course: ${error.message}`)
    }
  })

  const handleDeleteCourse = () => {
    if (!isAuthor || !courseData.id) return
    
    // Show confirmation dialog
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${courseData.title}"? This action cannot be undone.`
    )
    
    if (confirmDelete) {
      deleteMutation.mutate(courseData.id)
    }
  }

  
  // Course metadata editing states - only for authors
  const [isEditingCourse, setIsEditingCourse] = useState(false)
  const [editingCourseTitle, setEditingCourseTitle] = useState(courseData.title)
  const [editingCourseDescription, setEditingCourseDescription] = useState(courseData.description)
  
  // Chapter editing states - only for authors
  const [editingChapterTitles, setEditingChapterTitles] = useState<{[key: string]: string}>({})
  const [isEditingChapterTitles, setIsEditingChapterTitles] = useState(false)

  const currentChapter = courseChapters.find((ch) => ch.id === activeChapter)
  const currentChapterCompleted = currentChapter ? isChapterCompleted(currentChapter.id) : false

  // Share functionality
  const handleShare = async () => {
    const shareUrl = `${BASE_URL}/dashboard/share/${courseData.id}`
    
    try {
      await navigator.clipboard.writeText(shareUrl)
      setShareTooltipOpen(true)
      setTimeout(() => setShareTooltipOpen(false), 2000)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
      // Fallback: show the URL in an alert
      alert(`Share URL: ${shareUrl}`)
    }
  }

  const handleEdit = () => {
    if (!isAuthor || !currentChapter) return
    setEditContent(currentChapter.content)
    setIsEditing(true)
  }

  const { mutate: updateCourse, isPending: isSaving } = useMutation({
    mutationFn: async (courseData: Prop) => {
      // Process chapters to set new chapter IDs to null
      const processedChapters = courseData.chapters.map(chapter => ({
        ...chapter,
        id: chapter.id?.startsWith('temp_') ? null : chapter.id
      }))

      const processedCourseData = {
        ...courseData,
        chapters: processedChapters
      }

      const res = await fetch(`/api/course/${courseData.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(processedCourseData),
      })

      if (!res.ok) throw new Error("Failed to update course")

      return res.json()
    },
    onSuccess: () => {
      // Refresh the router after successful update
      router.refresh()
      // Force re-render
      setForceRender(prev => prev + 1)
    }
  })

  const handleSave = (content: string) => {
    if (!isAuthor || !currentChapter) return
    
    const updatedChapters = courseChapters.map((chapter) =>
      chapter.id === currentChapter.id ? { ...chapter, content } : chapter,
    )

    setCourseChapters(updatedChapters)
    setIsEditing(false)

    const updatedCourseData = {
      ...courseData,
      title: editingCourseTitle,
      description: editingCourseDescription,
      chapters: updatedChapters
    }

    updateCourse(updatedCourseData)
    setForceRender((prev) => prev + 1)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditContent("")
  }

  // Course metadata handlers - only for authors
  const handleSaveCourseInfo = () => {
    if (!isAuthor) return
    
    setIsEditingCourse(false)
    const updatedCourseData = {
      ...courseData,
      title: editingCourseTitle,
      description: editingCourseDescription,
      chapters: courseChapters
    }
    updateCourse(updatedCourseData)
  }

  const handleCancelCourseEdit = () => {
    setIsEditingCourse(false)
    setEditingCourseTitle(courseData.title)
    setEditingCourseDescription(courseData.description)
  }

  // Chapter management handlers - only available in edit mode for authors
  const handleAddChapter = () => {
    if (!isAuthor) return
    
    const newChapter = {
      id: `temp_${Date.now()}`, // Temporary ID, will be set to null in mutation
      completed: false,
      title: "New Chapter",
      duration: "5 min",
      content: "# New Chapter\n\nAdd your content here..."
    }

    const updatedChapters = [...courseChapters, newChapter]
    setCourseChapters(updatedChapters)
    setActiveChapter(newChapter.id)

    // Initialize editing state for the new chapter
    setEditingChapterTitles(prev => ({
      ...prev,
      [newChapter.id!]: newChapter.title
    }))

    // Automatically enter edit mode for the new chapter
    setEditContent(newChapter.content)
    setIsEditing(true)
  }

  const handleDeleteChapter = (chapterId: string) => {
    if (!isAuthor || !isEditingChapterTitles) return // Only allow in edit mode for authors
    
    if (courseChapters.length <= 1) {
      alert("Cannot delete the last chapter")
      return
    }

    const updatedChapters = courseChapters.filter(ch => ch.id !== chapterId)
    setCourseChapters(updatedChapters)

    // Update active chapter if deleted chapter was active
    if (activeChapter === chapterId) {
      setActiveChapter(updatedChapters[0]?.id || null)
    }

    // Remove from editing titles
    const updatedEditingTitles = { ...editingChapterTitles }
    delete updatedEditingTitles[chapterId]
    setEditingChapterTitles(updatedEditingTitles)
  }

  // Handle chapter switching while in content edit mode
  const handleChapterSwitch = (chapterId: string | null) => {
    if (isEditing) {
      // Cancel current editing and switch
      setIsEditing(false)
      setEditContent("")
    }
    setActiveChapter(chapterId)
  }

  const handleSaveChapterTitles = () => {
    if (!isAuthor) return
    
    const updatedChapters = courseChapters.map(chapter => {
      const newTitle = editingChapterTitles[chapter.id!]
      return newTitle ? { ...chapter, title: newTitle } : chapter
    })

    setCourseChapters(updatedChapters)
    setIsEditingChapterTitles(false)
    setEditingChapterTitles({})

    const updatedCourseData = {
      ...courseData,
      title: editingCourseTitle,
      description: editingCourseDescription,
      chapters: updatedChapters
    }
    updateCourse(updatedCourseData)
  }

  const handleCancelChapterTitlesEdit = () => {
    setIsEditingChapterTitles(false)
    setEditingChapterTitles({})
  }

  const initializeChapterTitleEditing = () => {
    if (!isAuthor) return
    
    const titleMap = courseChapters.reduce((acc, chapter) => {
      acc[chapter.id!] = chapter.title
      return acc
    }, {} as {[key: string]: string})
    
    setEditingChapterTitles(titleMap)
    setIsEditingChapterTitles(true)
  }

  if (!userId) return <div>Unauthorized</div>


  return (
    <TooltipProvider>
      <div className="flex h-screen">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="border-b p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 mr-4">
                {isEditingCourse && isAuthor ? (
                  <div className="space-y-3">
                    <Input
                      value={editingCourseTitle}
                      onChange={(e) => setEditingCourseTitle(e.target.value)}
                      className="text-2xl font-bold border-0 p-0 focus-visible:ring-0"
                      placeholder="Course Title"
                    />
                    <Textarea
                      value={editingCourseDescription}
                      onChange={(e) => setEditingCourseDescription(e.target.value)}
                      className="text-sm text-muted-foreground border-0 p-0 focus-visible:ring-0 resize-none"
                      placeholder="Course Description"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveCourseInfo} disabled={isSaving}>
                        <Save className="w-4 h-4 mr-1" />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelCourseEdit}>
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-bold">{editingCourseTitle}</h1>
                      {isAuthor && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setIsEditingCourse(true)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit3 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                    <p className="mt-1 text-muted-foreground text-sm">{editingCourseDescription}</p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {currentChapter?.duration}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* Share Button */}
                  <Tooltip open={shareTooltipOpen} onOpenChange={setShareTooltipOpen}>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleShare}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Share2 className="w-4 h-4" />
                        Share
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Link copied to clipboard!</p>
                    </TooltipContent>
                  </Tooltip>

                  {/* Edit Button - Only for authors */}
                  {isAuthor && (
                    <Button
                      onClick={isEditing ? handleCancel : handleEdit}
                      variant={isEditing ? "outline" : "default"}
                      size="sm"
                      className="flex items-center gap-2"
                      disabled={!currentChapter}
                    >
                      {isEditing ? (
                        <>
                          <Eye className="w-4 h-4" />
                          Preview
                        </>
                      ) : (
                        <>
                          <Edit3 className="w-4 h-4" />
                          Edit
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden mx-auto">
            <ScrollArea className="h-full">
              <div className="p-6 max-w-4xl">
                {currentChapter && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="flex items-center gap-2">
                        {currentChapterCompleted ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <Play className="w-5 h-5 text-blue-500" />
                        )}
                        <h2 className="text-xl font-semibold">{currentChapter.title}</h2>
                      </div>
                      <Badge variant={currentChapterCompleted ? "default" : "secondary"}>
                        {currentChapterCompleted ? "Completed" : "In Progress"}
                      </Badge>
                    </div>

                    {isEditing && isAuthor ? (
                      <NotionEditor 
                        initialContent={editContent} 
                        onSave={handleSave} 
                        onCancel={handleCancel} 
                      />
                    ) : (
                      <MDXContent 
                        key={`mdx-${activeChapter}-${forceRender}`} 
                        content={currentChapter.content} 
                      />
                    )}
                  </div>
                )}
                {!currentChapter && courseChapters.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">No chapters yet</p>
                    {isAuthor && (
                      <Button onClick={handleAddChapter}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Chapter
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Right Sidebar - Course Navigation */}
        <div className="w-1/3 border-l px-2 py-4">
          <Tabs defaultValue="chapters" className="w-full">
            <div className="flex justify-between items-center">

            <TabsList>
              <TabsTrigger value="chapters">Chapters</TabsTrigger>
              <TabsTrigger value="assets">Assets</TabsTrigger>
              <TabsTrigger value="chat">Smart Assistant</TabsTrigger>
            </TabsList>
              {isAuthor && (
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={handleDeleteCourse}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? (
                    <>
                      <Trash2 className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </>
                  )}
                </Button>
              )}
            
            </div>
            <TabsContent value="chapters" className="p-2 border-b">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold">Course Content</h3>
                  <p className="text-sm mt-1">
                    {completedChaptersCount} of {courseChapters.length} completed
                  </p>
                </div>
                {isAuthor && (
                  <div className="flex gap-1">
                    {isEditingChapterTitles ? (
                      <>
                        <Button size="sm" onClick={handleSaveChapterTitles} disabled={isSaving}>
                          <Save className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancelChapterTitlesEdit}>
                          <X className="w-3 h-3" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="outline" onClick={initializeChapterTitleEditing}>
                          <Edit3 className="w-3 h-3" />
                        </Button>
                        <Button size="sm" onClick={handleAddChapter}>
                          <Plus className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {courseChapters.map((chapter) => {
                  const chapterCompleted = isChapterCompleted(chapter.id)
                  const isUpdating = updatingChapter === chapter.id
                  
                  // Debug logging
                  console.log(`Chapter ${chapter.title}:`, {
                    chapterId: chapter.id,
                    completed: chapterCompleted,
                    courseStatus: courseStatus
                  })
                  
                  return (
                    <Card
                      onClick={() => {
                        if (isEditingChapterTitles) return
                        handleChapterSwitch(chapter.id)
                      }}
                      key={chapter.id}
                      className={`cursor-pointer transition-colors p-0 ${
                        activeChapter === chapter.id ? "border-primary bg-primary/5 py-4" : "hover:bg-muted/50"
                      }`}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {chapterCompleted ? (
                              <CheckCircle className="w-8 h-8 text-green-500 flex-shrink-0" />
                            ) : (
                              <Play className="w-5 h-5 text-blue-500 flex-shrink-0" />
                            )}
                            
                            {isEditingChapterTitles && isAuthor ? (
                              <Input
                                value={editingChapterTitles[chapter.id!] || chapter.title}
                                onChange={(e) => setEditingChapterTitles(prev => ({
                                  ...prev,
                                  [chapter.id!]: e.target.value
                                }))}
                                className="h-auto p-0 border-0 text-sm font-medium focus-visible:ring-0"
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : (
                              <div className="flex-1 min-w-0">
                                <h4 className="text-base font-semibold truncate">{chapter.title}</h4>
                                <p className="text-xs text-muted-foreground">{chapter.duration}</p>
                              </div>
                            )}

                            {!chapterCompleted && (
                              <Button 
                                variant={'secondary'} 
                                size={'sm'}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  statusMutation.mutate({
                                    chapterId: chapter.id!,
                                    completed: true,
                                  })
                                }}
                                disabled={isUpdating}
                              >
                                {isUpdating ? 'Updating...' : 'Mark Done'}
                              </Button>
                            )}
                          </div>
                          
                          {isEditingChapterTitles && isAuthor && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteChapter(chapter.id!)
                              }}
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>
            
            <TabsContent value="assets" className="p-4">
              {courseData.files?.map((file) => (
                <FileCard key={file.id} file={file} />
              ))}
            </TabsContent>
            
            <TabsContent value="chat">
              <SmartAssistant files={courseData.files?.map(file => file.key) || []} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TooltipProvider>
  )
}