'use client'

import React, { useState } from 'react'
import { Button } from '../ui/button'
import { CourseBuilder } from './course-builder'
import { systemPrompt } from '@/constants/promts'
import { useMutation } from '@tanstack/react-query'

interface AiCourseBuilderProps {
  selected: string[]
}

const AiCourseBuilder: React.FC<AiCourseBuilderProps> = ({ selected }) => {
  const [structure, setStructure] = useState<any>(null)

  const generateMutation = useGenerateCourseStructure()
  const createMutation = useCreateCourse()

  const handleGenerate = async () => {
    try {
      const generated = await generateMutation.mutateAsync(selected)
      setStructure(generated)

      const saved = await createMutation.mutateAsync({
        title: generated.title,
        description: generated.description,
        chapters: generated.chapters,
        files: selected,
      })

      console.log('Course saved:', saved)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div>
      <Button
        onClick={handleGenerate}
        disabled={generateMutation.isPending || selected.length === 0}
        className="mb-4 w-full"
      >
        {generateMutation.isPending ? 'Receiving response from AI...' : 'Generate Course Structure'}
      </Button>

      {generateMutation.isError && (
        <div className="text-red-600 mb-2">{(generateMutation.error as Error).message}</div>
      )}
      {structure && <CourseBuilder courseData={structure} />}
    </div>
  )
}


export default AiCourseBuilder






export const useGenerateCourseStructure = () => {
  return useMutation({
    mutationFn: async (files: string[]) => {
      const fullPrompt = `${systemPrompt}\n\nFiles:\n${files.map(url => `https://cdn.edufly.localhook.online/${url}`).join('\n')}`

      const response = await fetch('/api/ai/gemini-2.0-flash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: fullPrompt }),
      })

      if (!response.body) throw new Error('No response body from AI')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let result = '', done = false

      while (!done) {
        const { value, done: readerDone } = await reader.read()
        if (value) result += decoder.decode(value)
        done = readerDone
      }

      result = result.replace(/```json([\s\S]*?)```/, (_, p1) => p1.trim())
      return JSON.parse(result)
    },
  })
}


export const useCreateCourse = () => {
  return useMutation({
    mutationFn: async ({
      title,
      description,
      chapters,
      files,
    }: {
      title: string
      description: string
      chapters: any[]
      files: string[]
    }) => {
      const res = await fetch('/api/course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, chapters, files }),
      })

      if (!res.ok) throw new Error('Failed to save course')
      return res.json()
    },
  })
}
