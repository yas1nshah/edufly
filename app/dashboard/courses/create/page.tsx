'use client'

import { SiteHeader } from '@/components/site-header'
import React, { useState } from 'react'
import MyEditorPage from '@/components/editor/playground'
import { CompactFileSelection } from '@/components/uploads/file-selection'
import CourseBuilder from '@/components/course/course-builder'
import AiCourseBuilder from '@/components/course-new/ai-course-builder'
import { Sparkles } from 'lucide-react'

const CreateCourcePage = () => {
    const [selected, setSelected] = useState<string[]>([])

  return (
    <div>
      <SiteHeader title="Create Course" />
      <div className="mx-auto max-w-6xl">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 p-4 md:gap-6 md:py-6">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">AI Course Builder</h2>
              </div>
              <p className="text-muted-foreground">Add your content sources and let AI create a comprehensive course structure</p>
            </div>


            <CompactFileSelection
            value={selected}
            onChange={setSelected}
            fileType='application/pdf'
            />

            <AiCourseBuilder selected={selected} />

            

            {/* <CourseBuilder selected={selected} />
            {JSON.stringify(selected)}
            <MyEditorPage /> */}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateCourcePage
