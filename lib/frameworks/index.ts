/**
 * DriverOS Frameworks Module
 *
 * Re-exports all framework definitions for the Section 5 intelligence layer.
 */

// Engine definitions
export {
  ENGINES,
  ENGINE_ORDER,
  VISION_ENGINE,
  PEOPLE_ENGINE,
  OPERATIONS_ENGINE,
  REVENUE_ENGINE,
  FINANCE_ENGINE,
  type EngineDefinition
} from './engines'

// Gear definitions
export {
  GEARS,
  GEAR_ORDER,
  GEAR_1_IDLE,
  GEAR_2_CRUISING,
  GEAR_3_ACCELERATING,
  GEAR_4_RACING,
  GEAR_5_APEX,
  getGearByRevenue,
  getGearByScore,
  getGearBySizeband,
  type GearDefinition
} from './gears'

// Flash scan questions
export {
  FLASH_QUESTIONS,
  QUESTION_1_BRICK,
  QUESTION_2_VACATION,
  QUESTION_3_UNIT_ECONOMICS,
  QUESTION_4_PROCESSES,
  QUESTION_5_ALIGNMENT,
  QUESTION_6_CONSTRAINT,
  ANSWER_OPTIONS,
  getQuestionById,
  getQuestionPoints,
  type FlashQuestion
} from './flash-questions'

// Action templates
export {
  ACTION_TEMPLATES_BY_ENGINE,
  ALL_ACTION_TEMPLATES,
  EFFORT_DESCRIPTIONS,
  VISION_ACTIONS,
  PEOPLE_ACTIONS,
  OPERATIONS_ACTIONS,
  REVENUE_ACTIONS,
  FINANCE_ACTIONS,
  getTemplatesForEngine,
  getTemplatesForQuestion,
  determineOwner,
  type ActionTemplate
} from './action-templates'
