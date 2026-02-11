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
  addCoachNote,
  getProactiveNudge,
} from '@/lib/ai'
import { useOrg } from '@/components/providers/OrgProvider'
import { getVisibleData } from '@/hooks/usePageVisibleData'

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

/**
 * Patterns that indicate a coach observation worth saving.
 * We extract the sentence containing these patterns.
 */
const COACH_NOTE_PATTERNS = [
  /I notice[d]?\s+(.{10,120})/i,
  /It looks like\s+(.{10,120})/i,
  /Your\s+\w+\s+(?:engine|score|trend)\s+(?:is|has|dropped|improved|went)\s+(.{10,80})/i,
  /pattern I['']?m seeing[:\s]+(.{10,120})/i,
  /recurring (?:blocker|issue|theme)[:\s]+(.{10,120})/i,
]

/**
 * Extract coach observations from an AI response.
 * Returns up to 2 observations per response to avoid note bloat.
 */
function extractCoachNotes(content: string): string[] {
  const notes: string[] = []
  for (const pattern of COACH_NOTE_PATTERNS) {
    const match = content.match(pattern)
    if (match) {
      // Take the full matched phrase, clean up trailing punctuation artifacts
      const note = match[0].replace(/[*_`]/g, '').trim()
      if (note.length >= 15 && !notes.some(n => n === note)) {
        notes.push(note)
      }
    }
    if (notes.length >= 2) break
  }
  return notes
}

export function useAICoach() {
  const pathname = usePathname()
  const { currentOrg } = useOrg()
  const orgId = currentOrg?.id || 'default'

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [memory, setMemory] = useState<CompanyMemory | null>(null)
  const [proactiveNudge, setProactiveNudge] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const initializedRef = useRef(false)
  const orgIdRef = useRef(orgId)

  // Track orgId changes
  useEffect(() => {
    orgIdRef.current = orgId
  }, [orgId])

  // Initialize memory and chat history on mount (or when org changes)
  useEffect(() => {
    if (initializedRef.current && orgIdRef.current === orgId) return
    initializedRef.current = true

    let m = loadMemory(orgId)
    // If memory is empty, bootstrap from existing localStorage data
    if (m.engineSnapshot.assessmentCount === 0 && !m.profile.industry) {
      m = bootstrapMemoryFromStorage(orgId)
      saveMemory(m)
    }
    setMemory(m)

    const history = loadChatHistory(orgId)
    if (history.length > 0) {
      setMessages(history)
    }
  }, [orgId])

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
    const visibleData = getVisibleData()
    return {
      pageId,
      description: pageIdToDescription(pageId),
      ...(Object.keys(visibleData).length > 0 && { visibleData }),
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

      // Extract coach notes from the AI response
      if (fullContent && memory) {
        const notes = extractCoachNotes(fullContent)
        if (notes.length > 0) {
          let updatedMemory = memory
          for (const note of notes) {
            updatedMemory = addCoachNote(updatedMemory, note)
          }
          saveMemory(updatedMemory)
          setMemory(updatedMemory)
        }
      }

      // Save final state
      const currentOrgId = orgIdRef.current
      const finalMessages = updatedMessages.concat({
        ...assistantMessage,
        content: fullContent,
      })
      saveChatHistory(currentOrgId, finalMessages)
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
    const currentOrgId = orgIdRef.current
    setMessages([])
    saveChatHistory(currentOrgId, [])
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
