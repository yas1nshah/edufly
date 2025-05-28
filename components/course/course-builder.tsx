import React, { useState } from 'react'
import { CourseStructureBuilder } from './course-structure-builder'
import { ChapterContentEditor } from './course-content-editor'

export default function CourseBuilder({ selected }: { selected: string[] }) {
  const [structure, setStructure] = useState<any>(null)
  const [chapters, setChapters] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  return (
    <div className="max-w-5xl mx-auto my-8">
      {!structure ? (
        <CourseStructureBuilder
          selected={selected}
          onStructureReady={(s) => {
            setStructure(s)
            setChapters(s.chapters)
          }}
          loading={loading}
          setLoading={setLoading}
        />
      ) : (
        <ChapterContentEditor
          structure={structure}
          onContentReady={setChapters}
          loading={loading}
          setLoading={setLoading}
        />
      )}
    </div>
  )
}
