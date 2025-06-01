"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, HelpCircle } from "lucide-react"

interface QuizProps {
  question: string
  options: string[]
  correct: number
}

export function Quiz({ question, options, correct }: QuizProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)

  const handleSubmit = () => {
    if (selectedAnswer !== null) {
      setShowResult(true)
    }
  }

  const handleReset = () => {
    setSelectedAnswer(null)
    setShowResult(false)
  }

  return (
    <Card className="my-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-medium">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          Quiz
        </CardTitle>
      </CardHeader>
      <CardContent>
        <h4 className="font-medium mb-4 text-base">{question}</h4>

        <div className="space-y-2 mb-4">
          {options.map((option, index) => (
            <div
              key={index}
              onClick={() => !showResult && setSelectedAnswer(index)}
              className={`flex items-center gap-3 p-3 rounded-md border transition-all cursor-pointer ${
                selectedAnswer === index
                  ? showResult
                    ? index === correct
                      ? "border-green-500 bg-green-50 text-card"
                      : "border-red-500 bg-red-50 text-card"
                    : "border-blue-500 bg-secondary text-secondary-foreground"
                  : showResult && index === correct
                    ? "border-green-500 bg-green-50 text-card"
                    : "border-accent hover:border-primary bg-accent text-accent-foreground"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  selectedAnswer === index
                    ? showResult
                      ? index === correct
                        ? "bg-green-500"
                        : "bg-red-500"
                      : "bg-blue-500"
                    : showResult && index === correct
                      ? "bg-green-500"
                      : "border-2 border-gray-300"
                }`}
              >
                {showResult && (
                  <>
                    {index === correct && <CheckCircle className="w-3 h-3 text-white" />}
                    {selectedAnswer === index && index !== correct && <XCircle className="w-3 h-3 text-white" />}
                  </>
                )}
              </div>
              <span className="">{option}</span>
            </div>
          ))}
        </div>

        <div className="mt-4">
          {!showResult ? (
            <Button
              onClick={handleSubmit}
              disabled={selectedAnswer === null}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Check Answer
            </Button>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-2">
                {selectedAnswer === correct ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-green-700 font-medium">Correct!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-500" />
                    <span className="text-red-700 font-medium">
                      Incorrect. The correct answer is: {options[correct]}
                    </span>
                  </>
                )}
              </div>
              <Button variant="outline" onClick={handleReset} size="sm">
                Try Again
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
