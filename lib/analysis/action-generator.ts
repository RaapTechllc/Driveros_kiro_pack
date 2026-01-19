/**
 * DriverOS Action Generator
 *
 * Orchestrator that generates prioritized actions from scores and flags.
 * Transforms engine scores, question results, and red flags into actionable recommendations.
 */

import type {
  FrameworkAction,
  FrameworkEngineName,
  EngineScores,
  RedFlag,
  QuestionResult,
  GearNumber,
  ActionPriority,
  FlagSeverity,
  ActionGeneratorInput
} from '../types'
import {
  ALL_ACTION_TEMPLATES,
  determineOwner,
  type ActionTemplate
} from '../frameworks/action-templates'
import { ENGINE_ORDER, ENGINES } from '../frameworks/engines'

/** Thresholds for red flag detection from engine scores */
const CRITICAL_THRESHOLD = 40 // Score below this is critical
const WARNING_THRESHOLD = 70 // Score below this is warning

/** Maximum actions to return per priority level */
const MAX_DO_NOW_ACTIONS = 3
const MAX_DO_NEXT_ACTIONS = 5

// Re-export for convenience
export type { ActionGeneratorInput } from '../types'

/**
 * Detect red flags from low engine scores
 * Creates critical flags for scores <40% and warning flags for <70%
 */
export function detectEngineRedFlags(engineScores: EngineScores): RedFlag[] {
  const flags: RedFlag[] = []

  for (const engineName of ENGINE_ORDER) {
    const score = engineScores[engineName]
    const engine = ENGINES[engineName]

    if (score < CRITICAL_THRESHOLD) {
      flags.push({
        id: `engine-critical-${engineName}`,
        engine: engineName,
        description: `${engine.name} engine is critically weak (${score}%)`,
        severity: 'critical',
        recommendedAction: `Prioritize strengthening ${engine.name.toLowerCase()} systems immediately`,
        source: 'engine_score'
      })
    } else if (score < WARNING_THRESHOLD) {
      flags.push({
        id: `engine-warning-${engineName}`,
        engine: engineName,
        description: `${engine.name} engine needs attention (${score}%)`,
        severity: 'warning',
        recommendedAction: `Plan improvements to ${engine.name.toLowerCase()} systems`,
        source: 'engine_score'
      })
    }
  }

  return flags
}

/**
 * Determine if a template should be "do_now" or "do_next"
 * Escalates to do_now based on:
 * - Critical red flag triggers
 * - Engine score <40%
 * - Effort ≤2 with high impact (weak_engine condition)
 */
export function determinePriority(
  template: ActionTemplate,
  context: ActionGeneratorInput
): ActionPriority {
  const engineScore = context.engineScores[template.engine]

  // Critical flags always escalate to do_now
  if (template.triggerCondition === 'critical_flag') {
    return 'do_now'
  }

  // Very low engine score (<40%) escalates
  if (engineScore < CRITICAL_THRESHOLD) {
    return 'do_now'
  }

  // Low effort actions for weak engines are do_now
  if (template.triggerCondition === 'weak_engine' && template.effort <= 2) {
    return 'do_now'
  }

  // Question-specific weak triggers with low effort are do_now
  if (template.triggerCondition === 'question_weak' && template.effort <= 2) {
    // Skip if no questionId defined (defensive check)
    if (template.questionId === undefined) {
      return template.defaultPriority
    }
    // Check if this question was actually answered weak
    const questionResult = context.questionResults.find(
      r => r.questionId === template.questionId
    )
    if (questionResult && questionResult.triggeredFlags.length > 0) {
      return 'do_now'
    }
  }

  // Warning flags with good impact potential
  if (template.triggerCondition === 'warning_flag' && engineScore < WARNING_THRESHOLD) {
    // Keep as do_next unless effort is very low
    if (template.effort <= 2) {
      return 'do_now'
    }
  }

  // Use template default
  return template.defaultPriority
}

/**
 * Check if a template should be triggered based on current context
 */
function shouldTriggerTemplate(
  template: ActionTemplate,
  context: ActionGeneratorInput
): boolean {
  const engineScore = context.engineScores[template.engine]

  switch (template.triggerCondition) {
    case 'weak_engine':
      // Trigger for scores below warning threshold
      return engineScore < WARNING_THRESHOLD

    case 'critical_flag':
      // Trigger for critical scores or if matching critical flag exists
      if (engineScore < CRITICAL_THRESHOLD) return true
      return context.questionRedFlags.some(
        f => f.engine === template.engine && f.severity === 'critical'
      )

    case 'warning_flag':
      // Trigger for warning range scores or if matching warning flag exists
      if (engineScore < WARNING_THRESHOLD && engineScore >= CRITICAL_THRESHOLD) return true
      return context.questionRedFlags.some(
        f => f.engine === template.engine && f.severity === 'warning'
      )

    case 'question_weak':
      // Trigger only if specific question was answered weak
      if (template.questionId === undefined) return false
      const questionResult = context.questionResults.find(
        r => r.questionId === template.questionId
      )
      if (!questionResult) return false
      // Check if question had low points (weak or partial)
      return questionResult.pointsAwarded < questionResult.maxPoints

    default:
      return false
  }
}

/**
 * Filter and select relevant actions based on context
 */
export function filterRelevantActions(
  templates: ActionTemplate[],
  context: ActionGeneratorInput
): ActionTemplate[] {
  // Filter to only triggered templates
  const triggered = templates.filter(t => shouldTriggerTemplate(t, context))

  // Sort by relevance: critical > warning > weak_engine > question_weak
  const triggerPriority: Record<string, number> = {
    critical_flag: 0,
    weak_engine: 1,
    warning_flag: 2,
    question_weak: 3
  }

  triggered.sort((a, b) => {
    // First by trigger condition priority
    const triggerDiff = triggerPriority[a.triggerCondition] - triggerPriority[b.triggerCondition]
    if (triggerDiff !== 0) return triggerDiff

    // Then by engine score (worse engines first)
    const scoreDiff = context.engineScores[a.engine] - context.engineScores[b.engine]
    if (scoreDiff !== 0) return scoreDiff

    // Then by effort (lower effort first)
    return a.effort - b.effort
  })

  return triggered
}

/**
 * Convert an action template to a framework action
 */
function templateToAction(
  template: ActionTemplate,
  context: ActionGeneratorInput
): FrameworkAction {
  return {
    id: template.id,
    title: template.title,
    description: template.description,
    priority: determinePriority(template, context),
    owner: determineOwner(template, context.isSmallBusiness),
    effort: template.effort,
    engine: template.engine,
    rationale: template.rationale
  }
}

/**
 * Deduplicate actions, keeping the higher priority version
 */
function deduplicateActions(actions: FrameworkAction[]): FrameworkAction[] {
  const seen = new Map<string, FrameworkAction>()

  for (const action of actions) {
    const existing = seen.get(action.id)
    if (!existing) {
      seen.set(action.id, action)
    } else if (action.priority === 'do_now' && existing.priority === 'do_next') {
      // Upgrade priority if new one is more urgent
      seen.set(action.id, action)
    }
  }

  return Array.from(seen.values())
}

/**
 * Main entry point: Generate prioritized actions from context
 */
export function generateActions(context: ActionGeneratorInput): FrameworkAction[] {
  // Get relevant templates
  const relevantTemplates = filterRelevantActions(ALL_ACTION_TEMPLATES, context)

  // Convert to actions with priority and owner assignment
  const actions = relevantTemplates.map(t => templateToAction(t, context))

  // Deduplicate
  const uniqueActions = deduplicateActions(actions)

  // Separate by priority
  const doNowActions = uniqueActions.filter(a => a.priority === 'do_now')
  const doNextActions = uniqueActions.filter(a => a.priority === 'do_next')

  // Apply limits
  const limitedDoNow = doNowActions.slice(0, MAX_DO_NOW_ACTIONS)
  const limitedDoNext = doNextActions.slice(0, MAX_DO_NEXT_ACTIONS)

  // Return do_now first, then do_next
  return [...limitedDoNow, ...limitedDoNext]
}

/**
 * Create red flags from question results (weak answers)
 */
export function createQuestionRedFlags(questionResults: QuestionResult[]): RedFlag[] {
  const flags: RedFlag[] = []
  let flagIndex = 0

  for (const result of questionResults) {
    if (result.triggeredFlags.length === 0) continue

    // Determine severity based on points
    const severity: FlagSeverity =
      result.pointsAwarded === 0 ? 'critical' : 'warning'

    for (const flagDescription of result.triggeredFlags) {
      // Each engine affected by this question gets the flag
      for (const engine of result.affectedEngines) {
        flags.push({
          id: `q${result.questionId}-flag-${flagIndex++}`,
          engine,
          description: flagDescription,
          severity,
          recommendedAction: `Address this issue to strengthen the ${engine} engine`,
          source: 'question',
          questionId: result.questionId
        })
      }
    }
  }

  return flags
}
