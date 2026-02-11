'use client'

import { useEffect, useRef } from 'react'
import { useAICoach } from '@/hooks/useAICoach'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { cn } from '@/lib/utils'

/**
 * Floating AI Coach chat widget.
 * Appears as a button in the bottom-right corner, expands into a chat panel.
 * Persists across page navigations via the app layout.
 */
export function ChatWidget() {
  const {
    messages,
    isLoading,
    isOpen,
    proactiveNudge,
    sendMessage,
    cancelStream,
    clearChat,
    toggleOpen,
    setIsOpen,
  } = useAICoach()

  const scrollRef = useRef<HTMLDivElement>(null)
  const hasMessages = messages.length > 0

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <>
      {/* Chat Panel */}
      {isOpen && (
        <div
          className={cn(
            'fixed bottom-20 right-4 z-50',
            'w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-8rem)]',
            'bg-background border border-border rounded-xl shadow-2xl',
            'flex flex-col overflow-hidden',
            'animate-slide-in'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-display font-bold text-primary">D</span>
              </div>
              <div>
                <h3 className="text-sm font-semibold">AI Coach</h3>
                <p className="text-[10px] text-muted-foreground">Powered by DriverOS</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {hasMessages && (
                <button
                  onClick={clearChat}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  title="Clear chat"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title="Close"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
            {!hasMessages && !proactiveNudge && (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <span className="text-lg font-display font-bold text-primary">D</span>
                </div>
                <p className="text-sm font-medium mb-1">DriverOS AI Coach</p>
                <p className="text-xs text-muted-foreground mb-4">
                  I know your business data — scores, trends, blockers, and wins. Ask me anything or I&apos;ll proactively help as you navigate.
                </p>
                <div className="space-y-2 w-full">
                  {[
                    'What should I focus on this week?',
                    'Which engine needs the most attention?',
                    'Help me prepare for my weekly Pit Stop',
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => sendMessage(suggestion)}
                      className="w-full text-left text-xs px-3 py-2 rounded-md border border-border hover:bg-muted transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Proactive nudge */}
            {proactiveNudge && !hasMessages && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                <p className="text-xs font-medium text-primary mb-1">Coach Nudge</p>
                <p className="text-sm">{proactiveNudge}</p>
                <button
                  onClick={() => sendMessage(proactiveNudge)}
                  className="mt-2 text-xs text-primary hover:underline"
                >
                  Tell me more
                </button>
              </div>
            )}

            {messages.map((message, i) => (
              <ChatMessage
                key={message.id}
                message={message}
                isStreaming={isLoading && i === messages.length - 1 && message.role === 'assistant'}
              />
            ))}
          </div>

          {/* Input */}
          <ChatInput
            onSend={sendMessage}
            isLoading={isLoading}
            onCancel={cancelStream}
          />
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={toggleOpen}
        className={cn(
          'fixed bottom-4 right-4 z-50',
          'w-12 h-12 rounded-full shadow-lg',
          'bg-primary text-primary-foreground',
          'hover:bg-primary/90 active:scale-95',
          'transition-all duration-200',
          'flex items-center justify-center',
          isOpen && 'rotate-0'
        )}
        title={isOpen ? 'Close AI Coach' : 'Open AI Coach'}
      >
        {isOpen ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        ) : (
          <div className="relative">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {/* Notification dot for proactive nudges */}
            {proactiveNudge && !isOpen && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-destructive rounded-full animate-pulse" />
            )}
          </div>
        )}
      </button>
    </>
  )
}
