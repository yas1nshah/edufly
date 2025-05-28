"use client"

import { useEffect, useRef, useState } from "react"
import mermaid from "mermaid"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export interface MermaidDiagramProps {
  chart: string
  title?: string
  type?: "flowchart" | "sequenceDiagram" | "classDiagram" | "stateDiagram" | "gantt" | "pie"
}

export function MermaidDiagram({ chart, title = "Diagram", type = "flowchart" }: MermaidDiagramProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const [currentChart, setCurrentChart] = useState(chart)
  const [selectedTemplate, setSelectedTemplate] = useState(type)
  const [isInteractive, setIsInteractive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "default",
      securityLevel: "loose",
      fontFamily: "Inter, system-ui, sans-serif",
      flowchart: { useMaxWidth: true, htmlLabels: true, curve: "basis" },
      sequence: { diagramMarginX: 50, actorMargin: 50 },
      gantt: { axisFormat: "%m/%d/%Y", topAxis: true },
    })
  }, [])

  useEffect(() => {
    const render = async () => {
      if (!elementRef.current) return

      try {
        elementRef.current.innerHTML = ""
        const id = `mermaid-${Math.random().toString(36).substring(2, 11)}`
        const { svg } = await mermaid.render(id, currentChart)
        elementRef.current.innerHTML = svg

        if (isInteractive) {
          const svgEl = elementRef.current.querySelector("svg")
          svgEl?.querySelectorAll(".node").forEach((node, i) => {
            node.addEventListener("click", () => alert(`Clicked node ${i + 1}`))
          })
        }

        setError(null)
      } catch (err) {
        console.error(err)
        setError("Failed to render diagram. Please check the syntax.")
      }
    }

    render()
  }, [currentChart, isInteractive])

  return (
    <Card className="overflow-hidden my-4">
      <CardHeader>
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* <div className="flex flex-col gap-4">
          <Tabs value={selectedTemplate} onValueChange={(val) => setSelectedTemplate(val as any)} className="w-full">
            <TabsList>
              <TabsTrigger value="flowchart">Flowchart</TabsTrigger>
              <TabsTrigger value="sequenceDiagram">Sequence</TabsTrigger>
              <TabsTrigger value="classDiagram">Class</TabsTrigger>
              <TabsTrigger value="stateDiagram">State</TabsTrigger>
              <TabsTrigger value="gantt">Gantt</TabsTrigger>
              <TabsTrigger value="pie">Pie</TabsTrigger>
            </TabsList>
          </Tabs>

          <Label>Mermaid Markup</Label>
          <Textarea
            value={currentChart}
            onChange={(e) => setCurrentChart(e.target.value)}
            className="min-h-[150px] font-mono"
          />

          <div className="flex items-center gap-2">
            <Button type="button" onClick={() => setIsInteractive(!isInteractive)} variant="outline">
              {isInteractive ? "Disable Interaction" : "Enable Interaction"}
            </Button>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

        </div> */}
          <div ref={elementRef} className="border rounded p-4 mx-auto overflow-x-auto" />
      </CardContent>
    </Card>
  )
}
