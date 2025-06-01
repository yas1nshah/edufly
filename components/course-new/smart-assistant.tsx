'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Send, Bot, User } from 'lucide-react'
import { ScrollArea } from '../ui/scroll-area'
import { R2_CDN_URL } from '@/constants/urls'

interface SmartAssistantProps {
  files: string[]
}

type Message = {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const formatMessage = (content: string) => {
  if (!content) return content

  let formatted = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>')
  formatted = formatted.replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
  formatted = formatted.replace(/^\d+\.\s(.+)$/gm, '<div class="ml-4 mb-1">• $1</div>')
  formatted = formatted.replace(/^[-*]\s(.+)$/gm, '<div class="ml-4 mb-1">• $1</div>')
  formatted = formatted.replace(/\n/g, '<br />')

  return formatted
}

const SmartAssistant: React.FC<SmartAssistantProps> = ({ files }) => {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const fileLinks = files.map((url) => `${R2_CDN_URL}/${url}`).join('\n')

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [question])

  const handleAsk = async () => {
    if (!question.trim()) return

    const newUserMessage: Message = {
      role: 'user',
      content: question.trim(),
      timestamp: new Date()
    }

    const newMessages: Message[] = [...messages, newUserMessage]
    setMessages(newMessages)
    setIsLoading(true)
    setError(null)
    setQuestion('')

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    const basePrompt = `You are an AI assistant helping students understand course content. Provide clear, helpful, and well-formatted answers using markdown-like formatting (use **bold**, *italic*, \`code\`, and bullet points where appropriate). You can reference the following files:\n${fileLinks}`

    const chatContext = newMessages
      .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n')

    const prompt = `${basePrompt}\n\nConversation:\n${chatContext}`

    try {
      const res = await fetch('/api/ai/gemini-2.0-flash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      if (!res.body) throw new Error('No response body from AI')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let done = false

      const aiMessage: Message = {
        role: 'assistant',
        content: '',
        timestamp: new Date()
      }
      setMessages((prev) => [...prev, aiMessage])

      while (!done) {
        const { value, done: readerDone } = await reader.read()
        if (value) {
          const chunk = decoder.decode(value)
          setMessages((prev) => {
            const updated = [...prev]
            const last = updated[updated.length - 1]
            if (last?.role === 'assistant') {
              updated[updated.length - 1] = {
                ...last,
                content: last.content + chunk,
              }
            }
            return updated
          })
        }
        done = readerDone
      }
    } catch (err) {
      console.error(err)
      setError( 'Something went wrong')
      setMessages((prev) => prev.filter((msg, i) => i !== prev.length - 1 || msg.role !== 'assistant' || msg.content !== ''))
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAsk()
    }
  }

  return (
    <div className="space-y-6 px-4 py-2">
      <h3 className="font-semibold text-lg">EduFly AI</h3>

      <div className="border rounded-lg bg-card shadow-sm">
        {/* Messages Area */}
        <ScrollArea className="h-[500px] px-4 pt-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-accent border border-primary rounded-lg rounded-tl-none px-3 py-2 max-w-xs text-sm">
                👋 Hi! Im here to help you understand your course materials. Ask me anything about the topics youre studying!
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-start ${
                msg.role === 'user' ? 'justify-end' : ''
              }`}
            >
              <div className={`flex items-start space-x-3 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    msg.role === 'user' ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                >
                  {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                </div>
                <div
                  className={`rounded-lg px-3 py-2 max-w-xs lg:max-w-md xl:max-w-lg text-sm break-words ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-none'
                      : 'bg-accent text-accent-foreground rounded-tl-none border'
                  }`}
                >
                  <div
                    className="whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{
                      __html: msg.role === 'assistant' ? formatMessage(msg.content) : msg.content,
                    }}
                  />
                  <div className={`text-xs mt-1 ${msg.role === 'user' ? 'text-green-100' : 'text-muted-foreground'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-100 border rounded-lg rounded-tl-none px-3 py-2 max-w-xs text-sm">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                  <span className="text-xs text-gray-500">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t p-4">
          {error && <div className="mb-2 p-2 bg-red-100 text-red-700 text-sm rounded">{error}</div>}

          <div className="flex space-x-2">
            <Textarea
              ref={textareaRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your question here... (Enter to send, Shift+Enter for new line)"
              className="flex-1 min-h-[40px] max-h-32 resize-none"
              rows={1}
            />
            <Button onClick={handleAsk} disabled={isLoading || !question.trim()} size="icon">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="text-xs bg-card p-3 rounded-md border">
          <strong>Available resources:</strong> {files.length} file{files.length !== 1 ? 's' : ''} loaded
        </div>
      )}
    </div>
  )
}

export default SmartAssistant
