/**
 * Guardrails - Action Alignment Validation
 *
 * Ensures all actions link to the North Star (goal, vehicle, constraint)
 * before entering execution flow. Unaligned actions should be parked.
 */

export interface ActionGuardrails {
  isValid: boolean
  reason?: string
  alignedTo?: 'goal' | 'vehicle' | 'constraint' | 'multiple'
}

export interface ActionInput {
  title: string
  why?: string
  description?: string
}

export interface NorthStarInput {
  goal: string
  vehicle?: string | null
  constraint?: string | null
}

/**
 * Validates if an action aligns with the North Star
 * Uses simple keyword matching for MVP
 */
export function validateActionAlignment(
  action: ActionInput,
  northStar: NorthStarInput
): ActionGuardrails {
  if (!northStar.goal) {
    return {
      isValid: false,
      reason: 'No North Star defined. Set your goal first.',
    }
  }

  const actionText = `${action.title} ${action.why || ''} ${action.description || ''}`.toLowerCase()
  const goalKeywords = extractKeywords(northStar.goal)
  const vehicleKeywords = northStar.vehicle ? extractKeywords(northStar.vehicle) : []
  const constraintKeywords = northStar.constraint ? extractKeywords(northStar.constraint) : []

  const alignedTo: Array<'goal' | 'vehicle' | 'constraint'> = []

  // Check goal alignment
  if (goalKeywords.some(keyword => actionText.includes(keyword))) {
    alignedTo.push('goal')
  }

  // Check vehicle alignment
  if (vehicleKeywords.length > 0 && vehicleKeywords.some(keyword => actionText.includes(keyword))) {
    alignedTo.push('vehicle')
  }

  // Check constraint alignment
  if (constraintKeywords.length > 0 && constraintKeywords.some(keyword => actionText.includes(keyword))) {
    alignedTo.push('constraint')
  }

  if (alignedTo.length === 0) {
    return {
      isValid: false,
      reason: `Action doesn't align with North Star: "${northStar.goal}"`,
    }
  }

  return {
    isValid: true,
    alignedTo: alignedTo.length > 1 ? 'multiple' : alignedTo[0],
  }
}

/**
 * Extract meaningful keywords from text (3+ chars, no common words)
 */
function extractKeywords(text: string): string[] {
  const commonWords = new Set(['the', 'and', 'for', 'with', 'from', 'this', 'that', 'will', 'have', 'has'])
  
  return text
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length >= 3 && !commonWords.has(word))
}
