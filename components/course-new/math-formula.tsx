"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Check, AlertCircle } from "lucide-react"
import katex from "katex"
import "katex/dist/katex.min.css"

interface MathFormulaProps {
  formula: string
  display?: boolean // true for block display, false for inline
}

export function MathFormula({ formula, display = false }: MathFormulaProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (elementRef.current) {
      try {
        katex.render(formula, elementRef.current, {
          displayMode: display,
          throwOnError: false,
          errorColor: "#cc0000",
          strict: "warn",
        })
        setError(null)
      } catch (renderError) {
        console.error("KaTeX render error:", renderError)
        setError("Failed to render formula. Please check the LaTeX syntax.")
      }
    }
  }, [formula, display])

  const copyFormula = () => {
    navigator.clipboard.writeText(formula)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (error) {
    return (
      <Card className="my-4 border-red-200 bg-red-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-red-700 font-medium mb-2">
            <AlertCircle className="w-4 h-4" />
            Math Formula Error
          </div>
          <div className="text-red-600 text-sm mt-1">{error}</div>
          <details className="mt-2">
            <summary className="text-red-600 text-sm cursor-pointer">Show LaTeX code</summary>
            <pre className="text-xs mt-2 p-2 bg-red-100 rounded overflow-x-auto">{formula}</pre>
          </details>
        </CardContent>
      </Card>
    )
  }

  if (display) {
    // Block display formula
    return (
      <Card className="my-6 bg-card p-0">
        <CardContent className="relative">
          <div className="flex items-center justify-between mb-4 absolute top-0 right-0">
        {/* Copy Button */}
        <button
          onClick={copyFormula}
          className="absolute top-2 right-2 p-1.5 rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600"
          aria-label="Copy code"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>
          </div>
          <div className="flex justify-center">
            <div ref={elementRef} className="text-center" />
          </div>
        </CardContent>
      </Card>
    )
  } else {
    // Inline formula
    return (
      <span className="inline-flex items-center">
        <span ref={elementRef} className="mx-1" />
      </span>
    )
  }
}