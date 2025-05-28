import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeHighlight from 'rehype-highlight'

type Chapter = { title: string; content?: string }
type CourseStructure = { courseTitle: string; chapters: Chapter[] }

export function ChapterContentEditor({
  structure,
  onContentReady,
  loading,
  setLoading,
}: {
  structure: CourseStructure
  onContentReady: (chapters: Chapter[]) => void
  loading: boolean
  setLoading: (b: boolean) => void
}) {
  const [chapters, setChapters] = useState<Chapter[]>(
    structure.chapters.map((c) => ({ ...c, content: '' }))
  )
  const [selected, setSelected] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Generate content for a single chapter
  const handleGenerateChapter = async (idx: number) => {
    setLoading(true)
    setError(null)
    try {
      const prompt = `
You are an expert instructional designer. Write a detailed chapter for a course titled "${structure.courseTitle}".
Chapter: "${chapters[idx].title}"
Use formal tone, include lessons, and use the following structure:
[SUBTITLE: ...], [CODE_BLOCK:...], [ALERT:...], etc.
Output only the content for this chapter, no extra text.
      `
      const apiRes = await fetch('/api/ai/gemini-2.0-flash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      const text = await apiRes.text()
      setChapters((prev) =>
        prev.map((c, i) =>
          i === idx ? { ...c, content: text.trim() } : c
        )
      )
      onContentReady(
        chapters.map((c, i) =>
          i === idx ? { ...c, content: text.trim() } : c
        )
      )
    } catch (err: any) {
      setError(err.message)
    }
    setLoading(false)
  }

  // Generate content for all chapters
  const handleGenerateAll = async () => {
    setLoading(true)
    setError(null)
    try {
      const newChapters = await Promise.all(
        chapters.map(async (c, idx) => {
          const prompt = `
You are an expert instructional designer. Write a detailed chapter for a course titled "${structure.courseTitle}".
Chapter: "${c.title}"
Use formal tone, include lessons, and use the following structure:
[SUBTITLE: ...], [CODE_BLOCK:...], [ALERT:...], etc.
Output only the content for this chapter, no extra text.
          `
          const apiRes = await fetch('/api/ai/gemini-2.0-flash', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt }),
          })
          const text = await apiRes.text()
          return { ...c, content: text.trim() }
        })
      )
      setChapters(newChapters)
      onContentReady(newChapters)
    } catch (err: any) {
      setError(err.message)
    }
    setLoading(false)
  }

  // Manual edit
  const handleEdit = (idx: number, value: string) => {
    setChapters((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, content: value } : c))
    )
    onContentReady(
      chapters.map((c, i) => (i === idx ? { ...c, content: value } : c))
    )
  }

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Sidebar */}
      <div className="w-full md:w-64">
        <Tabs
          value={chapters[selected]?.title}
          onValueChange={(val) =>
            setSelected(chapters.findIndex((c) => c.title === val))
          }
          className="w-full"
          orientation="vertical"
        >
          <TabsList className="flex flex-col w-full gap-1">
            {chapters.map((chapter, idx) => (
              <TabsTrigger
                key={chapter.title}
                value={chapter.title}
                className="justify-start w-full text-left"
              >
                {chapter.title}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="mt-4 flex flex-col gap-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGenerateAll}
            disabled={loading}
          >
            Generate All Chapters
          </Button>
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {error && (
          <div className="text-red-600 font-bold mb-4">{error}</div>
        )}
        <div className="mb-4 flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleGenerateChapter(selected)}
            disabled={loading}
          >
            Generate with AI
          </Button>
        </div>
        <textarea
          className="w-full border rounded p-2 min-h-[200px] font-mono"
          value={chapters[selected]?.content || ''}
          onChange={(e) => handleEdit(selected, e.target.value)}
          placeholder="Write or generate chapter content here..."
        />
        <div className="mt-4">
          <div className="font-bold mb-2">Preview:</div>
          <ScrollArea className="h-64 pr-4">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeHighlight]}
            >
              {chapters[selected]?.content || ''}
            </ReactMarkdown>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
