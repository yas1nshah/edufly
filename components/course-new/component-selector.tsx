"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Code, HelpCircle, Play, Type, Hash, List, GitBranch, Calculator, Zap, Sparkles } from "lucide-react"
import { ScrollArea } from "../ui/scroll-area"

interface ComponentOption {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  metadata?: Record<string, any>
}

const componentOptions: ComponentOption[] = [
  {
    id: "heading",
    name: "Heading",
    description: "Create a section heading",
    icon: <Hash className="w-4 h-4" />,
  },
  {
    id: "code",
    name: "Code Block",
    description: "Add a code snippet",
    icon: <Code className="w-4 h-4" />,
    metadata: { language: "javascript" },
  },
  {
    id: "quiz",
    name: "Quiz",
    description: "Add an interactive quiz",
    icon: <HelpCircle className="w-4 h-4" />,
    metadata: {
      question: "Your question here?",
      options: ["Option 1", "Option 2", "Option 3"],
      correct: 0,
    },
  },
  {
    id: "youtube",
    name: "YouTube Video",
    description: "Embed a YouTube video",
    icon: <Play className="w-4 h-4" />,
    metadata: {
      videoId: "dQw4w9WgXcQ",
      title: "Video Title",
    },
  },
  {
    id: "diagram",
    name: "Advanced Diagram",
    description: "Create complex diagrams (10+ types)",
    icon: <GitBranch className="w-4 h-4" />,
    metadata: {
      chart: "graph TD\\nA[Start] --> B[Process]\\nB --> C[End]",
      title: "Process Flow",
      type: "flowchart",
    },
  },
  {
    id: "math",
    name: "Math Formula",
    description: "Add mathematical equations",
    icon: <Calculator className="w-4 h-4" />,
    metadata: {
      formula: "E = mc^2",
      display: true,
    },
  },
  {
    id: "animation",
    name: "Complex Animation",
    description: "Advanced animations & visualizations",
    icon: <Sparkles className="w-4 h-4" />,
    metadata: {
      type: "particleSystem",
      title: "Particle Physics Demo",
      props: { particleCount: 30, color: "#3b82f6" },
    },
  },
  {
    id: "text",
    name: "Text",
    description: "Add a paragraph of text",
    icon: <Type className="w-4 h-4" />,
  },
  {
    id: "list",
    name: "List",
    description: "Create a bulleted list",
    icon: <List className="w-4 h-4" />,
  },
]

interface ComponentSelectorProps {
  position: { x: number; y: number }
  onSelect: (type: string, metadata?: Record<string, any>) => void
  onClose: () => void
}

export function ComponentSelector({ position, onSelect, onClose }: ComponentSelectorProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const selectorRef = useRef<HTMLDivElement>(null)

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setSelectedIndex((prev) => (prev + 1) % componentOptions.length)
          break
        case "ArrowUp":
          e.preventDefault()
          setSelectedIndex((prev) => (prev - 1 + componentOptions.length) % componentOptions.length)
          break
        case "Enter":
          e.preventDefault()
          onSelect(componentOptions[selectedIndex].id, componentOptions[selectedIndex].metadata)
          break
        case "Escape":
          e.preventDefault()
          onClose()
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onSelect, onClose, selectedIndex])

  // Ensure the selector is visible within the viewport
useEffect(() => {
  if (selectorRef.current) {
    const popup = selectorRef.current
    const rect = popup.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const viewportWidth = window.innerWidth

    // Prefer placing to the left
    let adjustedX = position.x - rect.width - 30
    let adjustedY = position.y

    // If left overflows, push to right
    if (adjustedX < 10) {
      adjustedX = position.x + 12
    }

    // If bottom overflows, shift upward
    if (adjustedY + rect.height > viewportHeight) {
      adjustedY = viewportHeight - rect.height - 12
    }

    // Ensure still in top bounds
    if (adjustedY < 10) adjustedY = 10
    if (adjustedX + rect.width > viewportWidth) {
      adjustedX = viewportWidth - rect.width - 10
    }

    popup.style.left = `${adjustedX}px`
    popup.style.top = `${adjustedY}px`
  }
}, [position])


  return (
    <div ref={selectorRef} className="fixed z-50" style={{ left: position.x, top: position.y }}>
      <Card className="w-[300px] shadow-xl border-2 ">
        <CardContent className="p-3">
          <div className="text-xs text-purple-600 font-medium mb-2 flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Choose Component
          </div>
          <ScrollArea className="space-y-1 max-h-96 overflow-y-auto">
            {componentOptions.map((option, index) => (
              <div
                key={option.id}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedIndex === index
                    ? "bg-accent scale-[1.02] shadow-md"
                    : "hover:bg-gray-50 hover:scale-[1.01]"
                }`}
                onClick={() => onSelect(option.id, option.metadata)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div
                  className={`p-2 rounded-md ${
                    selectedIndex === index ? "bg-primary text-primary-foreground" : ""
                  }`}
                >
                  {option.icon}
                </div>
                <div className="flex-1">
                  <div
                    className={`font-medium text-sm ${selectedIndex === index ? "text-secondary" : ""}`}
                  >
                    {option.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{option.description}</div>
                </div>
                {selectedIndex === index && (
                  <div className="text-purple-600">
                    <span className="text-xs">Enter ↵</span>
                  </div>
                )}
              </div>
            ))}
          </ScrollArea>
          <div className="mt-3 pt-2 border-t border-muted-foreground text-xs text-muted-foreground">
            Use ↑↓ to navigate • Enter to select • Esc to cancel
          </div>
        </CardContent>
      </Card>

      {/* Backdrop to close selector */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />
    </div>
  )
}
