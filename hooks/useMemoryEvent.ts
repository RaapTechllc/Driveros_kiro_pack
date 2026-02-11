'use client'

import { useCallback } from 'react'
import type { MemoryEvent } from '@/lib/ai/types'
import { loadMemory, saveMemory, processMemoryEvent } from '@/lib/ai'
import { useOrg } from '@/components/providers/OrgProvider'

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
  const { currentOrg } = useOrg()
  const orgId = currentOrg?.id || 'default'

  const fireEvent = useCallback((event: MemoryEvent) => {
    const memory = loadMemory(orgId)
    const updated = processMemoryEvent(memory, event)
    saveMemory(updated)
  }, [orgId])

  return fireEvent
}
