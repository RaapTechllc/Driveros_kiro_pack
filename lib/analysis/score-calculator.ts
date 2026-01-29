/**
 * DriverOS Score Calculator
 *
 * Calculates engine scores and overall score from Flash Scan answers.
 * Distributes question points to affected engines and normalizes to 0-100.
 */

import type {
  FlashScanAnswer,
  FrameworkEngineName,
  EngineScores,
  QuestionResult
} from '../types'
import { ENGINE_ORDER } from '../frameworks/engines'
import { FLASH_QUESTIONS, getQuestionById, getQuestionPoints } from '../frameworks/flash-questions'

/** Maximum points possible per question */
const MAX_POINTS_PER_QUESTION = 20

/** Result of score calculation */
export interface ScoreCalculationResult {
  engineScores: EngineScores
  overallScore: number
  questionResults: QuestionResult[]
}

/**
 * Initialize engine scores to zero
 */
function initializeEngineScores(): EngineScores {
  return ENGINE_ORDER.reduce((acc, engine) => {
    acc[engine] = 0
    return acc
  }, {} as EngineScores)
}

/**
 * Calculate how many questions affect each engine
 * This is used for normalization
 */
function getQuestionsPerEngine(): Record<FrameworkEngineName, number> {
  const counts: Record<string, number> = {}

  for (const question of FLASH_QUESTIONS) {
    // Skip qualitative questions from scoring
    if (question.isQualitative) continue

    for (const engine of question.affectedEngines) {
      counts[engine] = (counts[engine] || 0) + 1
    }
  }

  // Ensure all engines have at least 1 to avoid division by zero
  for (const engine of ENGINE_ORDER) {
    if (!counts[engine]) counts[engine] = 1
  }

  return counts as Record<FrameworkEngineName, number>
}

/**
 * Calculate engine points from a single answer
 */
function calculateQuestionResult(answer: FlashScanAnswer): QuestionResult {
  const question = getQuestionById(answer.questionId)

  if (!question) {
    return {
      questionId: answer.questionId,
      pointsAwarded: 0,
      maxPoints: 0,
      affectedEngines: [],
      triggeredFlags: []
    }
  }

  // Qualitative questions don't contribute points
  if (question.isQualitative) {
    return {
      questionId: answer.questionId,
      pointsAwarded: 0,
      maxPoints: 0,
      affectedEngines: question.affectedEngines,
      triggeredFlags: answer.strength === 'weak' ? question.redFlags : []
    }
  }

  const points = getQuestionPoints(answer.questionId, answer.strength)
  const triggeredFlags = answer.strength === 'weak' ? question.redFlags : []

  return {
    questionId: answer.questionId,
    pointsAwarded: points,
    maxPoints: MAX_POINTS_PER_QUESTION,
    affectedEngines: question.affectedEngines,
    triggeredFlags
  }
}

/**
 * Distribute points to affected engines
 * Points are split evenly across all affected engines
 */
function distributePointsToEngines(
  result: QuestionResult,
  enginePoints: Record<FrameworkEngineName, number[]>
): void {
  if (result.affectedEngines.length === 0) return

  // Split points evenly across affected engines
  const pointsPerEngine = result.pointsAwarded / result.affectedEngines.length

  for (const engine of result.affectedEngines) {
    enginePoints[engine].push(pointsPerEngine)
  }
}

/**
 * Calculate normalized engine scores (0-100)
 * Score = (average points / max points) * 100
 */
function normalizeEngineScores(
  enginePoints: Record<FrameworkEngineName, number[]>
): EngineScores {
  const scores = initializeEngineScores()
  const questionsPerEngine = getQuestionsPerEngine()

  for (const engine of ENGINE_ORDER) {
    const points = enginePoints[engine]

    if (points.length === 0) {
      // No questions affected this engine - use baseline score
      scores[engine] = 50
      continue
    }

    // Calculate average points
    const totalPoints = points.reduce((sum, p) => sum + p, 0)
    const avgPoints = totalPoints / points.length

    // Normalize to 0-100 scale
    // Max points per question is 20, so (avgPoints / 20) * 100
    scores[engine] = Math.round((avgPoints / MAX_POINTS_PER_QUESTION) * 100)
  }

  return scores
}

/**
 * Calculate overall score as average of all engine scores
 */
function calculateOverallScore(engineScores: EngineScores): number {
  const scores = Object.values(engineScores)
  const total = scores.reduce((sum, score) => sum + score, 0)
  return Math.round(total / scores.length)
}

/**
 * Main function: Calculate framework scores from flash scan answers
 */
export function calculateFrameworkScores(answers: FlashScanAnswer[]): ScoreCalculationResult {
  // Initialize point tracking per engine
  const enginePoints: Record<FrameworkEngineName, number[]> = {
    vision: [],
    people: [],
    operations: [],
    revenue: [],
    finance: []
  }

  // Process each answer
  const questionResults: QuestionResult[] = []

  for (const answer of answers) {
    const result = calculateQuestionResult(answer)
    questionResults.push(result)
    distributePointsToEngines(result, enginePoints)
  }

  // Calculate normalized engine scores
  const engineScores = normalizeEngineScores(enginePoints)

  // Calculate overall score
  const overallScore = calculateOverallScore(engineScores)

  return {
    engineScores,
    overallScore,
    questionResults
  }
}

/**
 * Get a verbal descriptor for an engine score
 */
export function getScoreDescriptor(score: number): 'critical' | 'warning' | 'healthy' | 'strong' {
  if (score < 40) return 'critical'
  if (score < 70) return 'warning'
  if (score < 85) return 'healthy'
  return 'strong'
}

/**
 * Get color class for score display
 */
export function getScoreColor(score: number): string {
  if (score < 40) return 'text-red-600'
  if (score < 70) return 'text-amber-600'
  if (score < 85) return 'text-emerald-600'
  return 'text-green-600'
}
