/**
 * DriverOS Framework Analysis
 *
 * Main orchestrator combining all analysis steps:
 * - Score calculation
 * - Gear determination
 * - Red flag detection
 * - Action generation
 */

import type {
  FlashScanAnswer,
  FlashScanData,
  FrameworkFlashScanResult,
  RedFlag,
  ActionGeneratorInput,
  FrameworkEngineName
} from '../types'
import { calculateFrameworkScores, type ScoreCalculationResult } from './score-calculator'
import { determineGear, type GearCalculationResult } from './gear-calculator'
import {
  generateActions,
  detectEngineRedFlags,
  createQuestionRedFlags
} from './action-generator'
import { ENGINE_ORDER } from '../frameworks/engines'

/** Schema version for result format */
const SCHEMA_VERSION = '1.0.0'

/** Employee count threshold for "small business" owner assignment */
const SMALL_BUSINESS_THRESHOLD = 10

/** Context for framework analysis */
export interface AnalysisContext {
  sizeband?: string
  revenue?: number
  biggestConstraint?: string
  industry?: string
}

/**
 * Determine if a business is "small" for owner assignment purposes
 * Small businesses route most actions to CEO
 */
function isSmallBusiness(sizeband?: string): boolean {
  if (!sizeband) return true // Default to small if unknown

  // Parse size band strings like "1-10", "11-50", etc.
  const match = sizeband.match(/^(\d+)/)
  if (match) {
    const minSize = parseInt(match[1], 10)
    return minSize <= SMALL_BUSINESS_THRESHOLD
  }

  // Handle descriptive size bands
  const smallTerms = ['solo', 'micro', 'small', '1-', 'just me', 'startup']
  return smallTerms.some(term =>
    sizeband.toLowerCase().includes(term)
  )
}

/**
 * Merge and sort red flags from multiple sources
 * Sorts by severity (critical first) then by engine name
 */
function mergeRedFlags(questionFlags: RedFlag[], engineFlags: RedFlag[]): RedFlag[] {
  const allFlags = [...questionFlags, ...engineFlags]

  // Sort by severity (critical first) then by engine
  allFlags.sort((a, b) => {
    if (a.severity !== b.severity) {
      return a.severity === 'critical' ? -1 : 1
    }
    return a.engine.localeCompare(b.engine)
  })

  return allFlags
}

/**
 * Complete framework analysis from flash scan answers
 *
 * Flow:
 * 1. Calculate scores from answers → EngineScores
 * 2. Determine gear from scores/context → GearNumber
 * 3. Detect red flags from scores and questions → RedFlag[]
 * 4. Generate actions from context → FrameworkAction[]
 *
 * @throws Error if answers array is empty
 */
export function analyzeWithFramework(
  answers: FlashScanAnswer[],
  context: AnalysisContext = {}
): FrameworkFlashScanResult {
  // Validate input
  if (!answers || answers.length === 0) {
    throw new Error('Flash scan answers are required for analysis')
  }

  // Step 1: Calculate scores
  const scoreResult: ScoreCalculationResult = calculateFrameworkScores(answers)

  // Step 2: Determine gear
  const gearResult: GearCalculationResult = determineGear({
    overallScore: scoreResult.overallScore,
    revenue: context.revenue,
    sizeband: context.sizeband
  })

  // Step 3: Detect red flags
  const questionFlags = createQuestionRedFlags(scoreResult.questionResults)
  const engineFlags = detectEngineRedFlags(scoreResult.engineScores)
  const allRedFlags = mergeRedFlags(questionFlags, engineFlags)

  // Step 4: Generate actions
  const actionInput: ActionGeneratorInput = {
    engineScores: scoreResult.engineScores,
    overallScore: scoreResult.overallScore,
    questionResults: scoreResult.questionResults,
    questionRedFlags: questionFlags,
    currentGear: gearResult.gear,
    isSmallBusiness: isSmallBusiness(context.sizeband),
    biggestConstraint: context.biggestConstraint
  }

  const actions = generateActions(actionInput)

  // Build result
  return {
    schemaVersion: SCHEMA_VERSION,
    timestamp: new Date().toISOString(),
    overallScore: scoreResult.overallScore,
    currentGear: gearResult.gear,
    gearLabel: gearResult.label,
    gearReason: gearResult.reason,
    engineScores: scoreResult.engineScores,
    questionResults: scoreResult.questionResults,
    redFlags: allRedFlags,
    actions,
    context: {
      industry: context.industry,
      sizeband: context.sizeband,
      revenue: context.revenue,
      biggestConstraint: context.biggestConstraint
    }
  }
}

/**
 * Convenience wrapper for UI integration
 * Converts FlashScanData form to FlashScanAnswer array
 *
 * Note: This expects the form to have been enhanced with answer data.
 * If only basic FlashScanData is provided (industry, size_band, etc.),
 * you'll need to also provide the answers array separately.
 */
export function runFrameworkAnalysis(
  formData: FlashScanData,
  answers: FlashScanAnswer[]
): FrameworkFlashScanResult {
  return analyzeWithFramework(answers, {
    sizeband: formData.size_band,
    biggestConstraint: formData.top_constraint,
    industry: formData.industry
  })
}

/**
 * Quick analysis with minimal context
 * Useful for rapid assessment without full form data
 */
export function quickFrameworkAnalysis(
  answers: FlashScanAnswer[]
): FrameworkFlashScanResult {
  return analyzeWithFramework(answers, {})
}

/**
 * Get a summary of the analysis suitable for display
 */
export function getAnalysisSummary(result: FrameworkFlashScanResult): {
  headline: string
  healthStatus: 'critical' | 'warning' | 'healthy' | 'strong'
  topPriority: string | null
  criticalCount: number
  warningCount: number
} {
  // Determine health status from overall score
  let healthStatus: 'critical' | 'warning' | 'healthy' | 'strong'
  if (result.overallScore < 40) {
    healthStatus = 'critical'
  } else if (result.overallScore < 70) {
    healthStatus = 'warning'
  } else if (result.overallScore < 85) {
    healthStatus = 'healthy'
  } else {
    healthStatus = 'strong'
  }

  // Count flags
  const criticalCount = result.redFlags.filter(f => f.severity === 'critical').length
  const warningCount = result.redFlags.filter(f => f.severity === 'warning').length

  // Get top priority action
  const topAction = result.actions.find(a => a.priority === 'do_now') || result.actions[0]
  const topPriority = topAction ? topAction.title : null

  // Generate headline
  let headline: string
  if (healthStatus === 'critical') {
    headline = `Your business is in Gear ${result.currentGear} with critical issues to address`
  } else if (healthStatus === 'warning') {
    headline = `Your business is in Gear ${result.currentGear} with areas needing attention`
  } else if (healthStatus === 'strong') {
    headline = `Your business is performing strongly in Gear ${result.currentGear}`
  } else {
    headline = `Your business is healthy in Gear ${result.currentGear}`
  }

  return {
    headline,
    healthStatus,
    topPriority,
    criticalCount,
    warningCount
  }
}

/**
 * Get weakest engine from analysis
 */
export function getWeakestEngine(
  result: FrameworkFlashScanResult
): { engine: FrameworkEngineName; score: number } | null {
  let weakest: { engine: FrameworkEngineName; score: number } | null = null

  for (const engine of ENGINE_ORDER) {
    const score = result.engineScores[engine]
    if (!weakest || score < weakest.score) {
      weakest = { engine, score }
    }
  }

  return weakest
}

/**
 * Get strongest engine from analysis
 */
export function getStrongestEngine(
  result: FrameworkFlashScanResult
): { engine: FrameworkEngineName; score: number } | null {
  let strongest: { engine: FrameworkEngineName; score: number } | null = null

  for (const engine of ENGINE_ORDER) {
    const score = result.engineScores[engine]
    if (!strongest || score > strongest.score) {
      strongest = { engine, score }
    }
  }

  return strongest
}
