'use client'

import React, { useState } from 'react'

export const systemPrompt = `You are an expert instructional designer. Convert PDF content into a complete online course curriculum.

OUTPUT: A single valid JSON object. DO NOT wrap in markdown or add extra text.

ESCAPE RULES (critical):
- Double quotes → \\\"
- Newlines → \\n

STRUCTURE:
{\"courseTitle\":\"string\",\"chapters\":[{\"title\":\"string\",\"summary\":\"string (optional)\",\"lessons\":[{\"title\":\"string\",\"content\":\"string with components. Ends with 'Estimated reading time: X minutes'\"}]}]}

COMPONENT TAGS (escaped inside 'content'):
[SUBTITLE: Text]
[FORMULA: Equation]
[CODE_BLOCK:language\\ncode here]
[ALERT:type:Message] (types: info, warning, error, success)
[TABS:[TAB_TITLE:T1][TAB_CONTENT:C1][TAB_TITLE:T2][TAB_CONTENT:C2]]
[PDF_IMAGE_REFERENCE: Description]

Rules:
- 6–10 chapters, min 3 lessons each
- Formal tone, use paragraph breaks (\\n), bullets (* ), numbers (1. )
- Estimate reading time at ~200wpm
- Final check: Valid JSON, escape all quotes (\\") and newlines (\\n)`;

type Props = {
  selected: string[]
}

const PdfToCourseCurriculum: React.FC<Props> = ({ selected }) => {
  const [results, setResults] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleProcess = async () => {
    setLoading(true)
    setError(null)
    const newResults: Record<string, string> = {}

    for (const fileUrl of selected) {
      try {
        // 1. Download the PDF as a Blob
        const res = await fetch(
          `https://cdn.edufly.localhook.online/${fileUrl}`
        )
        if (!res.ok) throw new Error('Failed to fetch file')
        const blob = await res.blob()

        // 2. Convert Blob to base64
        const fileBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => {
            resolve(reader.result as string)
          }
          reader.onerror = reject
          reader.readAsDataURL(blob)
        })

        // 3. Stream the response from the API
        const apiRes = await fetch('/api/ai/gemini-2.0-flash', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileBase64,
            prompt: systemPrompt,
          }),
        })

        if (!apiRes.body) throw new Error('No response body')

        const reader = apiRes.body.getReader()
        const decoder = new TextDecoder()
        let resultText = ''
        setResults((prev) => ({ ...prev, [fileUrl]: '' }))

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value)
          resultText += chunk
          setResults((prev) => ({
            ...prev,
            [fileUrl]: resultText,
          }))
        }
      } catch (err: any) {
        setResults((prev) => ({
          ...prev,
          [fileUrl]: `Error: ${err.message}`,
        }))
      }
    }

    setLoading(false)
  }

  return (
    <div className="my-4">
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded"
        onClick={handleProcess}
        disabled={loading || selected.length === 0}
      >
        {loading ? 'Processing...' : 'Generate Course Curriculum'}
      </button>
      <div className="mt-4 space-y-4">
        {selected.map((file) => (
          <div key={file} className="p-2 border rounded">
            <div className="font-mono text-xs text-gray-500 mb-2">
              {file}
            </div>
            <pre className="whitespace-pre-wrap break-all text-sm">
              {results[file] || ''}
            </pre>
          </div>
        ))}
        {error && (
          <div className="text-red-600 font-bold">{error}</div>
        )}
      </div>
    </div>
  )
}

export default PdfToCourseCurriculum
