import React, { useState } from 'react'
import { Button } from '@/components/ui/button'

type Chapter = { title: string }
type CourseStructure = { courseTitle: string; chapters: Chapter[] }

export function CourseStructureBuilder({
  selected,
  onStructureReady,
  loading,
  setLoading,
}: {
  selected: string[]
  onStructureReady: (structure: CourseStructure) => void
  loading: boolean
  setLoading: (b: boolean) => void
}) {
  const [structure, setStructure] = useState<CourseStructure | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    setStructure(null)
    try {
      // Fetch PDFs and send to API to generate structure only
      const filesBase64 = await Promise.all(
        selected.map(async (fileUrl) => {
          const res = await fetch(
            `https://cdn.edufly.localhook.online/${fileUrl}`
          )
          if (!res.ok) throw new Error(`Failed to fetch file: ${fileUrl}`)
          const blob = await res.blob()
          return await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(blob)
          })
        })
      )

      // Prompt for structure only
      const structurePrompt = `
You are an expert instructional designer. Analyze the following PDFs and output ONLY the course title and a list of chapters (no lessons or content). 
OUTPUT: {"courseTitle":"string","chapters":[{"title":"string"}]}
DO NOT wrap in markdown or add extra text.
      `

      const apiRes = await fetch('/api/ai/gemini-2.0-flash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filesBase64,
          prompt: structurePrompt,
        }),
      })

      const text = await apiRes.text()
      // Try to extract JSON
      const match = text.match(/({[\s\S]+})/)
      if (!match) throw new Error('No JSON found in AI response')
      const parsed = JSON.parse(match[1])
      setStructure(parsed)
      onStructureReady(parsed)
    } catch (err: any) {
      setError(err.message)
    }
    setLoading(false)
  }

  return (
    <div>
      <Button
        className="mb-4 w-full"
        onClick={handleGenerate}
        disabled={loading || selected.length === 0}
      >
        {loading ? 'Generating Structure...' : 'Generate Course Structure'}
      </Button>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {structure && (
        <div className="border rounded p-4">
          <div className="font-bold text-lg mb-2">{structure.courseTitle}</div>
          <ol className="list-decimal pl-4">
            {structure.chapters.map((c, i) => (
              <li key={i}>{c.title}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}
