/**
 * DriverOS Analysis Module
 *
 * Re-exports all analysis functions for the Section 5 intelligence layer.
 */

// Score calculation
export {
  calculateFrameworkScores,
  getScoreDescriptor,
  getScoreColor,
  type ScoreCalculationResult
} from './score-calculator'

// Gear calculation
export {
  determineGear,
  getGearAdvancement,
  getGearIcon,
  detectGearScoreMismatch,
  type GearContext,
  type GearCalculationResult
} from './gear-calculator'

// Action generation
export {
  generateActions,
  detectEngineRedFlags,
  createQuestionRedFlags,
  filterRelevantActions,
  determinePriority,
  type ActionGeneratorInput
} from './action-generator'

// Framework analysis (main orchestrator)
export {
  analyzeWithFramework,
  runFrameworkAnalysis,
  quickFrameworkAnalysis,
  getAnalysisSummary,
  getWeakestEngine,
  getStrongestEngine,
  type AnalysisContext
} from './framework-analysis'
