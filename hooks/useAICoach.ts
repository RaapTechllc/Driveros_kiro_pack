'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import type { ChatMessage, PageContext, PageId, CompanyMemory, ChatStreamChunk } from '@/lib/ai/types'
import {
  loadMemory,
  saveMemory,
  loadChatHistory,
  saveChatHistory,
  bootstrapMemoryFromStorage,
  getProactiveNudge,
} from '@/lib/ai'

/**
 * Map pathname to PageId for page-aware context
 */
function pathToPageId(pathname: string): PageId {
  const segment = pathname.split('/').filter(Boolean)[0] || 'landing'
  const map: Record<string, PageId> = {
    dashboard: 'dashboard',
    'flash-scan': 'flash-scan',
    'full-audit': 'full-audit',
    'apex-audit': 'apex-audit',
    'check-in': 'check-in',
    'pit-stop': 'pit-stop',
    meetings: 'meetings',
    'year-board': 'year-board',
    settings: 'settings',
    onboarding: 'onboarding',
    import: 'import',
    'parked-ideas': 'parked-ideas',
    performance: 'performance',
    pricing: 'pricing',
    help: 'help',
  }
  return map[segment] || 'unknown'
}

function pageIdToDescription(pageId: PageId): string {
  const descriptions: Record<PageId, string> = {
    dashboard: 'Dashboard — viewing engine scores and actions',
    'flash-scan': 'Flash Scan — quick business diagnostic',
    'full-audit': 'Full Audit — comprehensive assessment',
    'apex-audit': 'Apex Audit — advanced analysis',
    'check-in': 'Daily Check-In',
    'pit-stop': 'Pit Stop — weekly meeting',
    meetings: 'Meeting Templates & History',
    'year-board': 'Year Board — annual planning',
    actions: 'Action Management',
    settings: 'Settings',
    onboarding: 'Onboarding',
    import: 'CSV Import/Export',
    'parked-ideas': 'Parked Ideas',
    performance: 'Performance Dashboard',
    pricing: 'Pricing',
    help: 'Help Center',
    landing: 'Home',
    unknown: 'DriverOS',
  }
  return descriptions[pageId]
}

const ORG_ID = 'default' // In production, pull from OrgProvider context

export function useAICoach() {
  const pathname = usePathname()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [memory, setMemory] = useState<CompanyMemory | null>(null)
  const [proactiveNudge, setProactiveNudge] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const initializedRef = useRef(false)

  // Initialize memory and chat history on mount
  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    let m = loadMemory(ORG_ID)
    // If memory is empty, bootstrap from existing localStorage data
    if (m.engineSnapshot.assessmentCount === 0 && !m.profile.industry) {
      m = bootstrapMemoryFromStorage(ORG_ID)
      saveMemory(m)
    }
    setMemory(m)

    const history = loadChatHistory(ORG_ID)
    if (history.length > 0) {
      setMessages(history)
    }
  }, [])

  // Update proactive nudge when page changes
  useEffect(() => {
    if (!memory) return
    const pageId = pathToPageId(pathname)
    const pageContext: PageContext = {
      pageId,
      description: pageIdToDescription(pageId),
    }
    const nudge = getProactiveNudge(memory, pageContext)
    setProactiveNudge(nudge)
  }, [pathname, memory])

  const getPageContext = useCallback((): PageContext => {
    const pageId = pathToPageId(pathname)
    return {
      pageId,
      description: pageIdToDescription(pageId),
    }
  }, [pathname])

  const sendMessage = useCallback(async (content: string) => {
    if (!memory || isLoading) return

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
      pageContext: getPageContext(),
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setIsLoading(true)
    setProactiveNudge(null) // Clear nudge when user interacts

    // Create placeholder for assistant response
    const assistantId = `msg-${Date.now()}-assistant`
    const assistantMessage: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
    }

    setMessages(prev => [...prev, assistantMessage])

    try {
      abortRef.current = new AbortController()

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          pageContext: getPageContext(),
          memory,
        }),
        signal: abortRef.current.signal,
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }))
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId
              ? { ...m, content: error.error || 'Something went wrong. Please try again.' }
              : m
          )
        )
        setIsLoading(false)
        return
      }

      // Read the SSE stream
      const reader = response.body?.getReader()
      if (!reader) {
        setIsLoading(false)
        return
      }

      const decoder = new TextDecoder()
      let buffer = ''
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const chunk: ChatStreamChunk = JSON.parse(line.slice(6))

            if (chunk.type === 'text') {
              fullContent += chunk.content
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantId ? { ...m, content: fullContent } : m
                )
              )
            }

            if (chunk.type === 'error') {
              fullContent += '\n\n*Connection interrupted. Please try again.*'
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantId ? { ...m, content: fullContent } : m
                )
              )
            }
          } catch {
            // Skip unparseable chunks
          }
        }
      }

      // Save final state
      const finalMessages = updatedMessages.concat({
        ...assistantMessage,
        content: fullContent,
      })
      saveChatHistory(ORG_ID, finalMessages)
      setMessages(finalMessages)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        // User cancelled
        return
      }
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? { ...m, content: 'Failed to connect to AI coach. Check your connection and try again.' }
            : m
        )
      )
    } finally {
      setIsLoading(false)
      abortRef.current = null
    }
  }, [memory, messages, isLoading, getPageContext])

  const cancelStream = useCallback(() => {
    abortRef.current?.abort()
    setIsLoading(false)
  }, [])

  const clearChat = useCallback(() => {
    setMessages([])
    saveChatHistory(ORG_ID, [])
  }, [])

  const toggleOpen = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  return {
    messages,
    isLoading,
    isOpen,
    proactiveNudge,
    memory,
    sendMessage,
    cancelStream,
    clearChat,
    toggleOpen,
    setIsOpen,
  }
}
