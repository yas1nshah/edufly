'use client'

import React, { useState } from 'react'
import { Button } from '../ui/button'
import { CourseBuilder } from './course-builder'
import { systemPrompt } from '@/constants/promts'

interface AiCourseBuilderProps {
  selected: string[]
}

const AiCourseBuilder: React.FC<AiCourseBuilderProps> = ({ selected }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [structure, setStructure] = useState<any>(null)

const handleGenerate = async () => {
  setLoading(true);
  setStructure(null);
  setError(null);

  try {
    const files = selected.map((url) => `https://cdn.edufly.localhook.online/${url}`);
    const fullPrompt = `${systemPrompt}\n\nFiles:\n${files.join('\n')}`;

    const response = await fetch('/api/ai/gemini-2.0-flash', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: fullPrompt }),
    });

    if (!response.body) throw new Error('No response body from AI');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let result = '';
    let done = false;

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      if (value) result += decoder.decode(value);
      done = readerDone;
    }

    console.log('Full AI Response:', result);

    // Step 1: Remove ```json fences
    result = result.replace(/```json([\s\S]*?)```/, (_, p1) => p1.trim());


    // Step 3: Parse cleaned JSON
    const parsed = JSON.parse(result);

    setStructure(parsed);
  } catch (err: any) {
    console.error(err);
    setError(err.message || 'Something went wrong while generating');
  } finally {
    setLoading(false);
  }
};




  return (
    <div>
    <Button
    className="mb-4 w-full"
    onClick={handleGenerate}
    disabled={loading || selected.length === 0}
    >
    {loading ? 'Receiving response from AI...' : 'Generate Course Structure'}
    </Button>


      {error && <div className="text-red-600 mb-2">{error}</div>}
      {structure && <CourseBuilder courseData={structure} />}
      <pre>{JSON.stringify(structure, null, 2)}</pre>
    </div>
  )
}

export default AiCourseBuilder


