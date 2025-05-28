"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ComponentSelector } from "@/components/course-new/component-selector"
import { EditorBlock } from "@/components//course-new/editor-block"
import { Save, X } from "lucide-react"

interface Block {
  id: string
  type: "text" | "heading" | "code" | "quiz" | "youtube" | "list" | "diagram" | "math" 
  content: string
  metadata?: Record<string, any>
}

interface NotionEditorProps {
  initialContent: string
  onSave: (content: string) => void
  onCancel: () => void
}

export function NotionEditor({ initialContent, onSave, onCancel }: NotionEditorProps) {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [showComponentSelector, setShowComponentSelector] = useState(false)
  const [selectorPosition, setSelectorPosition] = useState({ x: 0, y: 0 })
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null)
  const [slashIndex, setSlashIndex] = useState(-1)
  const editorRef = useRef<HTMLDivElement>(null)

  // Parse initial content into blocks
  useEffect(() => {
    const parsedBlocks = parseContentToBlocks(initialContent)
    setBlocks(parsedBlocks)
  }, [initialContent])

  const parseContentToBlocks = (content: string): Block[] => {
    const lines = content.split("\n")
    const blocks: Block[] = []
    let currentBlock = ""
    let inCodeBlock = false
    let codeLanguage = ""

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Handle code blocks
      if (line.startsWith("```")) {
        if (inCodeBlock) {
          // End of code block
          blocks.push({
            id: Math.random().toString(36).substring(2, 11),
            type: "code",
            content: currentBlock,
            metadata: { language: codeLanguage },
          })
          currentBlock = ""
          inCodeBlock = false
          codeLanguage = ""
        } else {
          // Start of code block
          if (currentBlock.trim()) {
            blocks.push({
              id: Math.random().toString(36).substring(2, 11),
              type: "text",
              content: currentBlock.trim(),
            })
            currentBlock = ""
          }
          inCodeBlock = true
          codeLanguage = line.substring(3)
        }
        continue
      }

      if (inCodeBlock) {
        currentBlock += (currentBlock ? "\n" : "") + line
        continue
      }

      // Handle custom components
      if (
        line.startsWith("<Quiz") ||
        line.startsWith("<YouTubeEmbed") ||
        line.startsWith("<MermaidDiagram") ||
        line.startsWith("<MathFormula") ||
        line.startsWith("<AdvancedAnimation")
      ) {
        if (currentBlock.trim()) {
          blocks.push({
            id: Math.random().toString(36).substring(2, 11),
            type: "text",
            content: currentBlock.trim(),
          })
          currentBlock = ""
        }

        // Parse component based on type
        if (line.startsWith("<Quiz")) {
          const questionMatch = line.match(/question="([^"]*)"/)
          const optionsMatch = line.match(/options=\{(\[[^\]]*\])\}/)
          const correctMatch = line.match(/correct=\{(\d+)\}/)

          if (questionMatch && optionsMatch && correctMatch) {
            blocks.push({
              id: Math.random().toString(36).substring(2, 11),
              type: "quiz",
              content: "",
              metadata: {
                question: questionMatch[1],
                options: JSON.parse(optionsMatch[1].replace(/'/g, '"')),
                correct: Number.parseInt(correctMatch[1]),
              },
            })
          }
        } else if (line.startsWith("<YouTubeEmbed")) {
          const videoIdMatch = line.match(/videoId="([^"]*)"/)
          const titleMatch = line.match(/title="([^"]*)"/)

          if (videoIdMatch) {
            blocks.push({
              id: Math.random().toString(36).substring(2, 11),
              type: "youtube",
              content: "",
              metadata: {
                videoId: videoIdMatch[1],
                title: titleMatch ? titleMatch[1] : "Video",
              },
            })
          }
        } else if (line.startsWith("<MermaidDiagram")) {
          const chartMatch = line.match(/chart="([^"]*)"/)
          const titleMatch = line.match(/title="([^"]*)"/)
          const typeMatch = line.match(/type="([^"]*)"/)

          if (chartMatch) {
            blocks.push({
              id: Math.random().toString(36).substring(2, 11),
              type: "diagram",
              content: "",
              metadata: {
                chart: chartMatch[1].replace(/\\n/g, "\n"),
                title: titleMatch ? titleMatch[1] : "Diagram",
                type: typeMatch ? typeMatch[1] : "flowchart",
              },
            })
          }
        } else if (line.startsWith("<MathFormula")) {
          const formulaMatch = line.match(/formula="([^"]*)"/)
          const displayMatch = line.match(/display="([^"]*)"/)

          if (formulaMatch) {
            blocks.push({
              id: Math.random().toString(36).substring(2, 11),
              type: "math",
              content: "",
              metadata: {
                formula: formulaMatch[1],
                display: displayMatch ? displayMatch[1] === "true" : false,
              },
            })
          }
        } 
        continue
      }

      // Handle headings
      if (line.startsWith("#")) {
        if (currentBlock.trim()) {
          blocks.push({
            id: Math.random().toString(36).substring(2, 11),
            type: "text",
            content: currentBlock.trim(),
          })
          currentBlock = ""
        }
        blocks.push({
          id: Math.random().toString(36).substring(2, 11),
          type: "heading",
          content: line,
        })
        continue
      }

      // Regular content
      currentBlock += (currentBlock ? "\n" : "") + line
    }

    // Add remaining content
    if (currentBlock.trim()) {
      blocks.push({
        id: Math.random().toString(36).substring(2, 11),
        type: "text",
        content: currentBlock.trim(),
      })
    }

    // Add empty block if no blocks exist
    if (blocks.length === 0) {
      blocks.push({
        id: Math.random().toString(36).substring(2, 11),
        type: "text",
        content: "",
      })
    }

    return blocks
  }

  const handleKeyDown = (e: React.KeyboardEvent, blockId: string, blockIndex: number) => {
    const block = blocks.find((b) => b.id === blockId)
    if (!block) return

    // Handle slash command
    if (e.key === "/" && block.type === "text") {
      // Only trigger if it's at the start of the line or after a space
      const cursorPosition = (e.target as HTMLTextAreaElement).selectionStart
      const textBeforeCursor = block.content.substring(0, cursorPosition)

      if (cursorPosition === 0 || textBeforeCursor.endsWith(" ")) {
        e.preventDefault()
        setActiveBlockId(blockId)
        setSlashIndex(cursorPosition)

        // Get cursor position for the component selector
        const rect = (e.target as HTMLElement).getBoundingClientRect()
        const lineHeight = Number.parseInt(window.getComputedStyle(e.target as HTMLElement).lineHeight)

        // Calculate position based on cursor
        const lines = block.content.substring(0, cursorPosition).split("\n")
        const lineCount = lines.length

        setSelectorPosition({
          x: rect.left + 20, // Add some offset from the cursor
          y: rect.top + lineCount * lineHeight,
        })
        setShowComponentSelector(true)
      }
    }
    // Handle Enter key
    else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      addNewBlock(blockIndex + 1)
    }
    // Handle Escape key to close component selector
    else if (e.key === "Escape" && showComponentSelector) {
      e.preventDefault()
      setShowComponentSelector(false)
      setActiveBlockId(null)
    }
  }

  const addNewBlock = (index: number) => {
    const newBlock: Block = {
      id: Math.random().toString(36).substring(2, 11),
      type: "text",
      content: "",
    }

    const newBlocks = [...blocks]
    newBlocks.splice(index, 0, newBlock)
    setBlocks(newBlocks)

    // Focus the new block
    setTimeout(() => {
      const element = document.querySelector(`[data-block-id="${newBlock.id}"]`) as HTMLElement
      if (element) {
        element.focus()
      }
    }, 0)
  }

  const updateBlock = (blockId: string, updates: Partial<Block>) => {
    setBlocks(blocks.map((block) => (block.id === blockId ? { ...block, ...updates } : block)))
  }

  const deleteBlock = (blockId: string) => {
    if (blocks.length > 1) {
      setBlocks(blocks.filter((block) => block.id !== blockId))
    }
  }

  const insertComponent = (type: string, metadata?: Record<string, any>) => {
    if (activeBlockId) {
      const block = blocks.find((b) => b.id === activeBlockId)
      if (block) {
        // If there's content before the slash, keep it in the current block
        // and create a new block for the component
        if (slashIndex > 0) {
          const contentBeforeSlash = block.content.substring(0, slashIndex)
          updateBlock(activeBlockId, { content: contentBeforeSlash })

          // Find the index of the current block
          const blockIndex = blocks.findIndex((b) => b.id === activeBlockId)

          // Insert the new component block after the current block
          const newBlock: Block = {
            id: Math.random().toString(36).substring(2, 11),
            type: type as any,
            content: "",
            metadata,
          }

          const newBlocks = [...blocks]
          newBlocks.splice(blockIndex + 1, 0, newBlock)
          setBlocks(newBlocks)
        } else {
          // If the slash is at the beginning, just convert the current block
          updateBlock(activeBlockId, { type: type as any, content: "", metadata })
        }
      }

      setShowComponentSelector(false)
      setActiveBlockId(null)
      setSlashIndex(-1)
    }
  }

  const convertBlocksToContent = (): string => {
    return blocks
      .map((block) => {
        switch (block.type) {
          case "heading":
            return block.content
          case "code":
            return `\`\`\`${block.metadata?.language || ""}\n${block.content}\n\`\`\``
          case "quiz":
            const { question, options, correct } = block.metadata || {}
            return `<Quiz question="${question}" options={${JSON.stringify(options)}} correct={${correct}} />`
          case "youtube":
            const { videoId, title } = block.metadata || {}
            return `<YouTubeEmbed videoId="${videoId}" title="${title}" />`
          case "diagram":
            const { chart, title: diagramTitle, type: diagramType } = block.metadata || {}
            return `<MermaidDiagram chart="${chart.replace(/\n/g, "\\n")}" title="${diagramTitle}" type="${diagramType}" />`
          case "math":
            const { formula, display } = block.metadata || {}
            return `<MathFormula formula="${formula}" display="${display}" />`
          default:
            return block.content
        }
      })
      .join("\n\n")
  }

  const handleSave = () => {
    const content = convertBlocksToContent()
    onSave(content)
  }

  return (
    <div className="relative">
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Editing Mode</h3>
            <div className="flex gap-2">
              <Button onClick={handleSave} size="sm" className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save
              </Button>
              <Button onClick={onCancel} variant="outline" size="sm" className="flex items-center gap-2">
                <X className="w-4 h-4" />
                Cancel
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Type "/" at the beginning of a line to add components. Press Enter to create new blocks.
          </p>
        </CardContent>
      </Card>

      <div ref={editorRef} className="space-y-2">
        {blocks.map((block, index) => (
          <EditorBlock
            key={block.id}
            block={block}
            index={index}
            onUpdate={updateBlock}
            onDelete={deleteBlock}
            onKeyDown={(e) => handleKeyDown(e, block.id, index)}
          />
        ))}
      </div>

      {showComponentSelector && (
        <ComponentSelector
          position={selectorPosition}
          onSelect={insertComponent}
          onClose={() => {
            setShowComponentSelector(false)
            setActiveBlockId(null)
          }}
        />
      )}
    </div>
  )
}
