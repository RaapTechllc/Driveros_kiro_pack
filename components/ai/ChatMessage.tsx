'use client'

import type { ChatMessage as ChatMessageType } from '@/lib/ai/types'
import { cn } from '@/lib/utils'

interface ChatMessageProps {
  message: ChatMessageType
  isStreaming?: boolean
}

export function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <div className={cn('flex gap-2', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center mt-1">
          <span className="text-xs font-display font-bold text-primary">D</span>
        </div>
      )}
      <div
        className={cn(
          'max-w-[85%] rounded-lg px-3 py-2 text-sm',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-foreground'
        )}
      >
        {message.content ? (
          <div className="whitespace-pre-wrap break-words prose prose-sm dark:prose-invert max-w-none">
            {formatMessageContent(message.content)}
          </div>
        ) : isStreaming ? (
          <div className="flex gap-1 py-1">
            <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        ) : null}
      </div>
    </div>
  )
}

/**
 * Basic markdown-like formatting for chat messages.
 * Handles **bold**, bullet points, and line breaks.
 */
function formatMessageContent(content: string): React.ReactNode {
  // Split by double newlines for paragraphs
  const paragraphs = content.split(/\n\n+/)

  return paragraphs.map((paragraph, i) => {
    const lines = paragraph.split('\n')
    const isList = lines.every(l => l.trim().startsWith('- ') || l.trim() === '')

    if (isList) {
      const items = lines.filter(l => l.trim().startsWith('- '))
      return (
        <ul key={i} className="list-disc list-inside space-y-0.5 my-1">
          {items.map((item, j) => (
            <li key={j}>{formatInline(item.replace(/^-\s*/, ''))}</li>
          ))}
        </ul>
      )
    }

    return (
      <p key={i} className={i > 0 ? 'mt-2' : ''}>
        {lines.map((line, j) => (
          <span key={j}>
            {j > 0 && <br />}
            {formatInline(line)}
          </span>
        ))}
      </p>
    )
  })
}

function formatInline(text: string): React.ReactNode {
  // Handle **bold**
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    return part
  })
}
