'use client'

import React, { useState } from 'react'
import { Button } from '../ui/button'
import { systemPrompt } from '@/constants/promts'
import { Plus, X, Youtube, FileText, Sparkles, Clock, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface AiCourseBuilderProps {
  selected: string[]
}

const AiCourseBuilder: React.FC<AiCourseBuilderProps> = ({ selected }) => {
  const [youtubeLinks, setYoutubeLinks] = useState<string[]>([''])
  const [extraContext, setExtraContext] = useState('')
  const [streamingData, setStreamingData] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()

  const addYoutubeLink = () => {
    setYoutubeLinks([...youtubeLinks, ''])
  }

  const removeYoutubeLink = (index: number) => {
    setYoutubeLinks(youtubeLinks.filter((_, i) => i !== index))
  }

  const updateYoutubeLink = (index: number, value: string) => {
    const updated = [...youtubeLinks]
    updated[index] = value
    setYoutubeLinks(updated)
  }

  const handleGenerate = async () => {
    try {
      setIsGenerating(true)
      setStreamingData('')
      setError(null)
      
      const validYoutubeLinks = youtubeLinks.filter(link => link.trim())
      const fileUrls = selected.map(url => `https://cdn.edufly.localhook.online/${url}`)
      const youtubeSection = validYoutubeLinks.length > 0 ? `\n\nYouTube Videos:\n${validYoutubeLinks.join('\n')}` : ''
      const contextSection = extraContext ? `\n\nAdditional Context:\n${extraContext}` : ''
      
      const fullPrompt = `${systemPrompt}\n\nFiles:\n${fileUrls.join('\n')}${youtubeSection}${contextSection}`

      // Generate course structure with streaming
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
        if (value) {
          const chunk = decoder.decode(value)
          result += chunk
          setStreamingData(result)
        }
        done = readerDone
      }

      // Parse the AI response
      const cleanedResult = result.replace(/```json\n?|\n?```$/g, '').replace(/"/g, '\\"').replace(/%%/g, '"')
      const courseStructure = JSON.parse(cleanedResult)

      const gelle = 
      
      setIsGenerating(false)
      setIsCreating(true)

      // Create the course
      const createResponse = await fetch('/api/course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: courseStructure.title,
          description: courseStructure.description,
          chapters: courseStructure.chapters,
          files: selected,
          youtubeLinks: validYoutubeLinks,
          extraContext
        }),
      })

      if (!createResponse.ok) throw new Error('Failed to save course')
      
      const savedCourse = await createResponse.json()
      
      // Navigate to the course
      router.push(`/dashboard/courses/${savedCourse.id}`)
      
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'An error occurred')
      setIsGenerating(false)
      setIsCreating(false)
    }
  }

  const hasContent = selected.length > 0 || youtubeLinks.some(link => link.trim()) || extraContext.trim()
  const isProcessing = isGenerating || isCreating

  return (
    <div className="space-y-6">
      {/* Header */}


      {/* Content Sources Summary */}
      {hasContent && (
        <div className="bg-card border rounded-lg p-4">
          <h3 className="font-medium text-card-foreground mb-2">Content Sources:</h3>
          <div className="space-y-1 text-sm text-muted-foreground">
            {selected.length > 0 && (
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>{selected.length} uploaded file{selected.length > 1 ? 's' : ''}</span>
              </div>
            )}
            {youtubeLinks.filter(link => link.trim()).length > 0 && (
              <div className="flex items-center gap-2">
                <Youtube className="w-4 h-4" />
                <span>{youtubeLinks.filter(link => link.trim()).length} YouTube video{youtubeLinks.filter(link => link.trim()).length > 1 ? 's' : ''}</span>
              </div>
            )}
            {extraContext.trim() && (
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>Additional context provided</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">


      {/* YouTube Links Section */}
      <div className="bg-card border rounded-lg p-6 ">
        <div className="flex items-center gap-2 mb-4">
          <Youtube className="w-5 h-5 text-destructive" />
          <h3 className="text-lg font-semibold">YouTube Videos</h3>
        </div>
        
        <div className="space-y-3 ">
          {youtubeLinks.map((link, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={link}
                onChange={(e) => updateYoutubeLink(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                disabled={isProcessing}
                />
              {youtubeLinks.length > 1 && (
                <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeYoutubeLink(index)}
                className="px-2"
                disabled={isProcessing}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
          
          <Button
            type="button"
            variant="outline"
            onClick={addYoutubeLink}
            className="w-full border-dashed"
            disabled={isProcessing}
            >
            <Plus className="w-4 h-4 mr-2" />
            Add Another YouTube Video
          </Button>
        </div>
      </div>

      {/* Extra Context Section */}
      <div className="bg-card border rounded-lg p-6 col-span-2">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Additional Context</h3>
        </div>
        
        <textarea
          placeholder="Provide any additional context, learning objectives, target audience, or specific requirements for your course..."
          value={extraContext}
          onChange={(e) => setExtraContext(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
          disabled={isProcessing}
          />
      </div>

      </div>
      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={isProcessing || !hasContent}
        className="w-full py-3 text-lg font-medium"
        size="lg"
      >
        {isProcessing ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            <span>
              {isGenerating ? 'Generating Course Structure...' : 'Creating Course...'}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <span>Generate Course Structure</span>
          </div>
        )}
      </Button>

      {/* Error Display */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <div className="text-destructive font-medium">Error generating course structure</div>
          <div className="text-destructive/80 text-sm mt-1">{error}</div>
        </div>
      )}

      {/* Real-time AI Response Card */}
      {isProcessing && (
        <div className="bg-card border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            {isGenerating ? (
              <>
                <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                <h3 className="font-semibold text-card-foreground">AI is generating your course structure...</h3>
                <Clock className="w-4 h-4 text-muted-foreground ml-auto" />
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-card-foreground">Creating course and redirecting...</h3>
              </>
            )}
          </div>
          
          <div className="bg-muted rounded-md p-4 min-h-[100px] max-h-[300px] overflow-y-auto">
            {streamingData ? (
              <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-mono">
                {streamingData}
              </pre>
            ) : (
              <div className="flex items-center justify-center h-20">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>
          
          {isCreating && (
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" />
              <span>Saving course and preparing redirect...</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AiCourseBuilder