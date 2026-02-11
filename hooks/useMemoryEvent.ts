'use client'

import { useCallback } from 'react'
import type { MemoryEvent } from '@/lib/ai/types'
import { loadMemory, saveMemory, processMemoryEvent } from '@/lib/ai'

const ORG_ID = 'default'

/**
 * Hook to fire memory events from any component.
 *
 * Usage:
 *   const fireMemoryEvent = useMemoryEvent()
 *   fireMemoryEvent({ type: 'action_completed', actionTitle: 'Hire ops manager', engine: 'people' })
 *
 * The memory is loaded from localStorage, updated, and saved back.
 * The AI coach will pick up the new context on its next interaction.
 */
export function useMemoryEvent() {
  const fireEvent = useCallback((event: MemoryEvent) => {
    const memory = loadMemory(ORG_ID)
    const updated = processMemoryEvent(memory, event)
    saveMemory(updated)
  }, [])

  return fireEvent
}
