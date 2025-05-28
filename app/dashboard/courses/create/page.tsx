'use client'

import { SiteHeader } from '@/components/site-header'
import React, { useState } from 'react'
import MyEditorPage from '@/components/editor/playground'
import { CompactFileSelection } from '@/components/uploads/file-selection'
import CourseBuilder from '@/components/course/course-builder'

const CreateCourcePage = () => {
    const [selected, setSelected] = useState<string[]>([])

  return (
    <div>
      <SiteHeader title="Create Course" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 p-4 md:gap-6 md:py-6">


            <CompactFileSelection
            value={selected}
            onChange={setSelected}
            fileType='application/pdf'
            />

            <CourseBuilder selected={selected} />
            {JSON.stringify(selected)}
            <MyEditorPage />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateCourcePage
