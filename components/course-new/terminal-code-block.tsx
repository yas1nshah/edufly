"use client"

import { useEffect, useRef, useState } from "react"
import { Check, Copy, Terminal } from "lucide-react"
import { useTheme } from "next-themes"

interface TerminalCodeBlockProps {
  language: string
  code: string
  showLineNumbers?: boolean
  title?: string
}

export function TerminalCodeBlock({
  language = "javascript",
  code,
  showLineNumbers = true,
  title,
}: TerminalCodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const { theme } = useTheme()
  const codeRef = useRef<HTMLElement>(null)
  const [isPrismLoaded] = useState(false)


  useEffect(() => {
    if (isPrismLoaded && codeRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Prism = require("prismjs")
      Prism.highlightElement(codeRef.current)
    }
  }, [code, theme, language, isPrismLoaded])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const displayTitle = title || (language === "bash" ? "Terminal" : language)
  const lineCount = code.split('\n').length

  return (
    <div className="my-6 rounded-lg overflow-hidden border bg-muted text-muted-foreground">
      {/* Header */}
      <div className="bg-gray-800 text-gray-100 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4" />
          <span className="text-sm font-medium">{displayTitle}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-full bg-red-500" />
          <div className="h-3 w-3 rounded-full bg-yellow-500" />
          <div className="h-3 w-3 rounded-full bg-green-500" />
        </div>
      </div>

      {/* Code block */}
      <div className="relative bg-card text-foreground text-sm font-mono">
        <pre
          className={`language-${language} px-4 py-4 overflow-x-auto flex`}
          style={{ margin: 0 }}
        >
          {showLineNumbers && (
            <div className="text-gray-500 pr-4 select-none text-right">
              {Array.from({ length: lineCount }).map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
          )}
          <code
            ref={codeRef}
            className={`language-${language} flex-1`}
          >
            {code.trim()}
          </code>
        </pre>

        {/* Copy Button */}
        <button
          onClick={copyToClipboard}
          className="absolute top-2 right-2 p-1.5 rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600"
          aria-label="Copy code"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}