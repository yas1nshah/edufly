"use client"

import { useMemo } from "react"
import { Quiz } from "@/components/course-new/quiz"
import { YouTubeEmbed } from "@/components/course-new/youtube-embed"
import { TerminalCodeBlock } from "@/components/course-new/terminal-code-block"
// import { MermaidDiagram } from "@/components/course-new/mermaid-diagram"
import { MathFormula } from "@/components/course-new/math-formula"
import { MermaidDiagram } from "./mermaid-diagram"

interface MDXContentProps {
  content: string
}

export function MDXContent({ content }: MDXContentProps) {
  const processedContent = useMemo(() => {
    // Extract and store code blocks first
    const codeBlocks: Record<string, { language: string; code: string }> = {}

    // Extract code blocks first
    let processed = content.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      const id = `__CODE_BLOCK_${Math.random().toString(36).substring(2, 11)}__`
      codeBlocks[id] = {
        language: lang || "text",
        code: code.trim(),
      }
      return id
    })

    // Escape HTML tags to display them as text (but not our custom components)
    processed = processed.replace(
      /<(?!Quiz|YouTubeEmbed|MermaidDiagram|MathFormula|AdvancedAnimation|\/Quiz|\/YouTubeEmbed|\/MermaidDiagram|\/MathFormula|\/AdvancedAnimation)([^>]+)>/g,
      "&lt;$1&gt;",
    )

    // Convert headers
    processed = processed.replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold mb-6 ">$1</h1>')
    processed = processed.replace(/^## (.+)$/gm, '<h2 class="text-2xl font-semibold mb-4 mt-8 ">$1</h2>')
    processed = processed.replace(/^### (.+)$/gm, '<h3 class="text-xl font-medium mb-3 mt-6 ">$1</h3>')

    // Convert paragraphs (but not lines that are part of special components)
    processed = processed.replace(
      /^(?!<|#|\*|-|\d+\.|__CODE_BLOCK_|<Quiz|<YouTubeEmbed|<MermaidDiagram|<MathFormula|<AdvancedAnimation)(.+)$/gm,
      '<p class="mb-4  leading-relaxed">$1</p>',
    )

    // Convert lists
    processed = processed.replace(/^- (.+)$/gm, '<li class="mb-1">$1</li>')
    processed = processed.replace(
      /(<li.*<\/li>)/,
      '<ul class="list-disc list-inside mb-4 space-y-1 ">$1</ul>',
    )

    // Convert bold text
    processed = processed.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold ">$1</strong>')

    // Convert inline code (but preserve the content exactly)
    processed = processed.replace(
      /`([^`]+)`/g,
      (_, code) => `<code class="bg-muted px-2 py-1 rounded text-sm font-mono ">${code}</code>`,
    )

    return { processed, codeBlocks }
  }, [content])

  const renderContent = () => {
    const { processed, codeBlocks } = processedContent

    // Split content by custom components and code blocks
    const parts = processed.split(
      /(<Quiz[\s\S]*?\/>|<YouTubeEmbed[\s\S]*?\/>|<MermaidDiagram[\s\S]*?\/>|<MathFormula[\s\S]*?\/>|<AdvancedAnimation[\s\S]*?\/>|__CODE_BLOCK_[a-z0-9]+__)/g,
    )

    return parts.map((part, index) => {
      // Handle Quiz components
      if (part.startsWith("<Quiz")) {
        const questionMatch = part.match(/question="([^"]*)"/)
        const optionsMatch = part.match(/options=\{(\[[^\]]*\])\}/)
        const correctMatch = part.match(/correct=\{(\d+)\}/)

        if (questionMatch && optionsMatch && correctMatch) {
          try {
            const question = questionMatch[1]
            const options = JSON.parse(optionsMatch[1].replace(/'/g, '"'))
            const correct = Number.parseInt(correctMatch[1])
            return <Quiz key={`quiz-${index}`} question={question} options={options} correct={correct} />
          } catch (e) {
            return (
              <div key={`quiz-error-${index}`} className="p-4  border rounded-md">
                Error parsing quiz: {e instanceof Error ? e.message : "Unknown error"}
              </div>
            )
          }
        }
      }

      // Handle YouTubeEmbed components
      if (part.startsWith("<YouTubeEmbed")) {
        const videoIdMatch = part.match(/videoId="([^"]*)"/)
        const titleMatch = part.match(/title="([^"]*)"/)

        if (videoIdMatch) {
          const videoId = videoIdMatch[1]
          const title = titleMatch ? titleMatch[1] : "Video"
          return <YouTubeEmbed key={`youtube-${index}`} videoId={videoId} title={title} />
        }
      }

      if (part.startsWith("<MermaidDiagram")) {
        const chartMatch = part.match(/chart="((?:[^"\\]|\\.)*)"/)
        const titleMatch = part.match(/title="((?:[^"\\]|\\.)*)"/)
        // const typeMatch = part.match(/type="((?:[^"\\]|\\.)*)"/)

        if (chartMatch) {
            const decodeEscaped = (str: string) =>
            str.replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\\\/g, "\\")

            const chart = decodeEscaped(chartMatch[1])
            const title = titleMatch ? decodeEscaped(titleMatch[1]) : "Diagram"
            // const type = typeMatch ? decodeEscaped(typeMatch[1]) : "flowchart"

            return <MermaidDiagram key={`mermaid-${index}`} chart={chart} title={title}/>
        }
        }


      // Handle MathFormula components
      if (part.startsWith("<MathFormula")) {
        const formulaMatch = part.match(/formula="([^"]*)"/)
        const displayMatch = part.match(/display="([^"]*)"/)

        if (formulaMatch) {
          const formula = formulaMatch[1]
          const display = displayMatch ? displayMatch[1] === "true" : false
          return <MathFormula key={`math-${index}`} formula={formula} display={display} />
        }
      }

      // Handle code blocks
      if (part.startsWith("__CODE_BLOCK_")) {
        const codeBlock = codeBlocks[part]
        if (codeBlock) {
          return (
            <TerminalCodeBlock
              key={`code-${index}`}
              language={codeBlock.language}
              code={codeBlock.code}
              title={
                codeBlock.language === "html"
                  ? "HTML"
                  : codeBlock.language === "css"
                    ? "CSS"
                    : codeBlock.language === "javascript"
                      ? "JavaScript"
                      : codeBlock.language
              }
            />
          )
        }
      }

      // Handle regular HTML content
      if (part.trim()) {
        return <div key={`content-${index}`} dangerouslySetInnerHTML={{ __html: part }} />
      }

      return null
    })
  }

  return <div className="prose prose-gray max-w-none">{renderContent()}</div>
}
