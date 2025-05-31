"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, GripVertical } from "lucide-react"

interface Block {
  id: string
  type: "text" | "heading" | "code" | "quiz" | "youtube" | "list" | "diagram" | "math" 
  content: string
  metadata?: Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
}

interface EditorBlockProps {
  block: Block
  index: number
  onUpdate: (blockId: string, updates: Partial<Block>) => void
  onDelete: (blockId: string) => void
  onKeyDown: (e: React.KeyboardEvent) => void
}

export function EditorBlock({ block, onUpdate, onDelete, onKeyDown }: EditorBlockProps) {
  const [isHovered, setIsHovered] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px"
    }
  }, [block.content])

  const renderBlockContent = () => {
    switch (block.type) {
      case "heading":
        return (
          <Input
            data-block-id={block.id}
            value={block.content}
            onChange={(e) => onUpdate(block.id, { content: e.target.value })}
            onKeyDown={onKeyDown}
            placeholder="# Heading"
            className="text-xl font-semibold border-none shadow-none py-2 focus-visible:ring-0 bg-card"
          />
        )

      case "code":
        return (
          <div className="space-y-2 bg-card p-4 rounded-md">
            <div className="flex items-center gap-2">
              <Select
                value={block.metadata?.language || "javascript"}
                onValueChange={(value) =>
                  onUpdate(block.id, {
                    metadata: { ...block.metadata, language: value },
                  })
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                  <SelectItem value="css">CSS</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="bash">Bash</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Textarea
              data-block-id={block.id}
              value={block.content}
              onChange={(e) => onUpdate(block.id, { content: e.target.value })}
              onKeyDown={onKeyDown}
              placeholder="Enter your code here..."
              className="font-mono text-sm min-h-[100px] bg-card"
            />
          </div>
        )

      case "quiz":
        return (
          <div className="space-y-3 p-4 border rounded-lg bg-card">
            <Input
              value={block.metadata?.question || ""}
              onChange={(e) =>
                onUpdate(block.id, {
                  metadata: { ...block.metadata, question: e.target.value },
                })
              }
              placeholder="Enter your question..."
              className="font-medium"
            />
            <div className="space-y-2">
              {(block.metadata?.options || []).map((option: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`quiz-${block.id}`}
                    checked={block.metadata?.correct === idx}
                    onChange={() =>
                      onUpdate(block.id, {
                        metadata: { ...block.metadata, correct: idx },
                      })
                    }
                  />
                  <Input
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(block.metadata?.options || [])]
                      newOptions[idx] = e.target.value
                      onUpdate(block.id, {
                        metadata: { ...block.metadata, options: newOptions },
                      })
                    }}
                    placeholder={`Option ${idx + 1}`}
                    className="flex-1"
                  />
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newOptions = [...(block.metadata?.options || []), "New option"]
                  onUpdate(block.id, {
                    metadata: { ...block.metadata, options: newOptions },
                  })
                }}
              >
                Add Option
              </Button>
            </div>
          </div>
        )

      case "youtube":
        return (
          <div className="space-y-2 p-4 border rounded-lg bg-card">
            <Input
                value={block.metadata?.videoId || ""}
                onChange={(e) => {
                    const input = e.target.value;
                    let videoId = input;

                    try {
                    const url = new URL(input);
                    if (url.hostname.includes("youtube.com")) {
                        videoId = url.searchParams.get("v") || "";
                    } else if (url.hostname === "youtu.be") {
                        videoId = url.pathname.slice(1);
                    }
                    } catch {
                    // Not a URL, treat as ID
                    }

                    onUpdate(block.id, {
                    metadata: { ...block.metadata, videoId },
                    });
                }}
                placeholder="YouTube Video ID (e.g., dQw4w9WgXcQ or full URL)"
                />

            <Input
              value={block.metadata?.title || ""}
              onChange={(e) =>
                onUpdate(block.id, {
                  metadata: { ...block.metadata, title: e.target.value },
                })
              }
              placeholder="Video title"
            />
          </div>
        )

      case "diagram":
        return (
          <div className="space-y-2 p-4 border rounded-lg bg-card">
            <div className="flex gap-2">
              <Input
                value={block.metadata?.title || ""}
                onChange={(e) =>
                  onUpdate(block.id, {
                    metadata: { ...block.metadata, title: e.target.value },
                  })
                }
                placeholder="Diagram title"
                className="flex-1"
              />
              <Select
                value={block.metadata?.type || "flowchart"}
                onValueChange={(value) =>
                  onUpdate(block.id, {
                    metadata: { ...block.metadata, type: value },
                  })
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flowchart">Flowchart</SelectItem>
                  <SelectItem value="sequence">Sequence</SelectItem>
                  <SelectItem value="classDiagram">Class</SelectItem>
                  <SelectItem value="erDiagram">ER Diagram</SelectItem>
                  <SelectItem value="gantt">Gantt</SelectItem>
                  <SelectItem value="pie">Pie Chart</SelectItem>
                  <SelectItem value="mindmap">Mind Map</SelectItem>
                  <SelectItem value="timeline">Timeline</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Textarea
              value={block.metadata?.chart || ""}
              onChange={(e) =>
                onUpdate(block.id, {
                  metadata: { ...block.metadata, chart: e.target.value },
                })
              }
              placeholder="Enter Mermaid diagram syntax..."
              className="font-mono text-sm min-h-[100px]"
            />
            <div className="text-xs text-card-foreground">Use Mermaid syntax. Templates available in dropdown above.</div>
          </div>
        )

      case "math":
        return (
          <div className="space-y-2 p-4 border rounded-lg bg-card">
            <Input
              value={block.metadata?.formula || ""}
              onChange={(e) =>
                onUpdate(block.id, {
                  metadata: { ...block.metadata, formula: e.target.value },
                })
              }
              placeholder="Enter LaTeX formula (e.g., E = mc^2)"
              className="font-mono"
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={block.metadata?.display || false}
                onChange={(e) =>
                  onUpdate(block.id, {
                    metadata: { ...block.metadata, display: e.target.checked },
                  })
                }
              />
              <label className="text-sm">Display as block formula</label>
            </div>
          </div>
        )

      default:
        return (
          <Textarea
            ref={textareaRef}
            data-block-id={block.id}
            value={block.content}
            onChange={(e) => onUpdate(block.id, { content: e.target.value })}
            onKeyDown={onKeyDown}
            placeholder="Type '/' for commands or start writing..."
            className="border-none shadow-none resize-none focus-visible:ring-0 min-h-[100px] p-2 bg-card" 
            rows={2}
          />
        )
    }
  }

  return (
    <div className="group relative" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div className="flex items-start gap-2">
        {/* Drag handle and controls */}
        <div className={`flex items-center gap-1 mt-1 transition-opacity ${isHovered ? "opacity-100" : "opacity-0"}`}>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 cursor-grab">
            <GripVertical className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
            onClick={() => onDelete(block.id)}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>

        {/* Block content */}
        <div className="flex-1 min-w-0">{renderBlockContent()}</div>
      </div>
    </div>
  )
}
