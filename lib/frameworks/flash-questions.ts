/**
 * DriverOS Flash Scan Questions
 *
 * 6 high-leverage questions designed to quickly gauge company health.
 * Each question reveals strengths/weaknesses in one or more engines.
 */

import type { FrameworkEngineName, AnswerStrength } from '../types'

export interface FlashQuestion {
  id: number
  question: string
  shortLabel: string
  whatItReveals: string
  affectedEngines: FrameworkEngineName[]
  scoringCriteria: {
    strong: { points: number; description: string }
    partial: { points: number; description: string }
    weak: { points: number; description: string }
  }
  redFlags: string[]
  followUpAction: string
  isQualitative: boolean // true for question 6 (context only)
}

/**
 * Question 1: The Brick (Daily Metric)
 */
export const QUESTION_1_BRICK: FlashQuestion = {
  id: 1,
  question: 'Do you have a single most important metric (a "Brick") that you check daily?',
  shortLabel: 'Daily Brick Metric',
  whatItReveals: 'Whether the business has identified a core leading indicator of success and maintains operational focus around it',
  affectedEngines: ['operations'],
  scoringCriteria: {
    strong: {
      points: 20,
      description: 'Yes, it\'s [metric] and we track it every day'
    },
    partial: {
      points: 10,
      description: 'Track some metrics but no single clear north star daily'
    },
    weak: {
      points: 0,
      description: 'No clear metric or infrequent tracking'
    }
  },
  redFlags: [
    'Lists several "most important" metrics (confusion)',
    'Names a lagging metric like monthly sales',
    'No daily metrics at all (flying blind)'
  ],
  followUpAction: 'Identify your Brick via analysis of leading indicators and institute a daily huddle to review it',
  isQualitative: false
}

/**
 * Question 2: Two-Week Vacation Test
 */
export const QUESTION_2_VACATION: FlashQuestion = {
  id: 2,
  question: 'Could you (the owner/CEO) take a two-week vacation completely away from the business without things falling apart?',
  shortLabel: 'Vacation Test',
  whatItReveals: 'The degree of owner dependency and strength of People/Operations engines',
  affectedEngines: ['people', 'operations'],
  scoringCriteria: {
    strong: {
      points: 20,
      description: 'Yes, I have done it (or could do it) confidently'
    },
    partial: {
      points: 10,
      description: 'Probably, but with some minor issues'
    },
    weak: {
      points: 0,
      description: 'Absolutely not or nervous laughter'
    }
  },
  redFlags: [
    'Owner has never taken time off',
    'Must constantly check in during any absence',
    'Hesitation or qualifiers like "only if I\'m still reachable"'
  ],
  followUpAction: 'Identify an interim decision-maker, empower a team member for decisions, document emergency procedures, cross-train key roles',
  isQualitative: false
}

/**
 * Question 3: CAC vs LTV (Unit Economics)
 */
export const QUESTION_3_UNIT_ECONOMICS: FlashQuestion = {
  id: 3,
  question: 'What\'s your customer acquisition cost and lifetime customer value (CAC vs. LTV)?',
  shortLabel: 'CAC vs LTV',
  whatItReveals: 'How well the company knows its unit economics and the strength of Revenue/Finance engines',
  affectedEngines: ['revenue', 'finance'],
  scoringCriteria: {
    strong: {
      points: 20,
      description: 'Know both numbers and they make sense'
    },
    partial: {
      points: 10,
      description: 'Know one or approximate (track cost per lead but not exact CAC)'
    },
    weak: {
      points: 0,
      description: 'Don\'t really track that'
    }
  },
  redFlags: [
    'CAC is higher than LTV (unsustainable model)',
    'Rely on word-of-mouth so don\'t know CAC',
    'No idea what customers are worth'
  ],
  followUpAction: 'Implement analytics to calculate CAC and LTV, run cohort analysis, set up marketing ROI tracker',
  isQualitative: false
}

/**
 * Question 4: Documented Processes
 */
export const QUESTION_4_PROCESSES: FlashQuestion = {
  id: 4,
  question: 'Do you have documented processes for your core business functions (sales, operations, etc.), and are they followed by your team?',
  shortLabel: 'Process Documentation',
  whatItReveals: 'The maturity of the Operations engine in terms of process documentation and adherence',
  affectedEngines: ['operations'],
  scoringCriteria: {
    strong: {
      points: 20,
      description: 'Yes, and everyone follows them'
    },
    partial: {
      points: 10,
      description: 'Have some written SOPs, but not up to date or not always used'
    },
    weak: {
      points: 0,
      description: 'No documentation'
    }
  },
  redFlags: [
    '"It\'s all in my head" response',
    '"We\'re too small for that" mindset',
    'Have documents but employees don\'t trust or use them'
  ],
  followUpAction: 'Process audit and documentation sprint: document 5-6 core processes (HR, marketing, sales, fulfillment, retention, accounting)',
  isQualitative: false
}

/**
 * Question 5: Team Priority Alignment
 */
export const QUESTION_5_ALIGNMENT: FlashQuestion = {
  id: 5,
  question: 'Can everyone on your team articulate the company\'s #1 goal or priority for this quarter?',
  shortLabel: 'Team Alignment',
  whatItReveals: 'Vision and alignment among the team (Vision engine)',
  affectedEngines: ['vision'],
  scoringCriteria: {
    strong: {
      points: 20,
      description: 'Yes, everyone would name the same priority'
    },
    partial: {
      points: 10,
      description: 'Sort of, some might know'
    },
    weak: {
      points: 0,
      description: 'Everyone has their own idea (or 10 different priorities)'
    }
  },
  redFlags: [
    'Team has many conflicting priorities',
    'Fire-drill projects with no clear direction',
    'Stated top priority is vague or non-measurable'
  ],
  followUpAction: 'Implement 90-day planning (Rocks): set 3-7 clear quarterly Rocks and communicate in all-hands meeting',
  isQualitative: false
}

/**
 * Question 6: Biggest Constraint (Qualitative)
 */
export const QUESTION_6_CONSTRAINT: FlashQuestion = {
  id: 6,
  question: 'What is the biggest constraint or bottleneck holding your business back right now?',
  shortLabel: 'Biggest Constraint',
  whatItReveals: 'Pain point in any engine; whether leadership understands their constraints',
  affectedEngines: ['vision', 'people', 'operations', 'revenue', 'finance'], // all - contextual
  scoringCriteria: {
    strong: {
      points: 0, // Qualitative - no direct scoring
      description: 'Clear, specific answer (indicates self-awareness)'
    },
    partial: {
      points: 0,
      description: 'Somewhat vague answer'
    },
    weak: {
      points: 0,
      description: '"I\'m not sure" or only blames external factors'
    }
  },
  redFlags: [
    '"I don\'t have time to think" (owner overcapacity)',
    '"I have no idea where to focus"',
    'Blames only external factors without internal improvements'
  ],
  followUpAction: 'Drill down on the answer: if People - hiring plan; if Leads - marketing initiatives; if unsure - perform broader assessment',
  isQualitative: true
}

/** All flash questions in order */
export const FLASH_QUESTIONS: FlashQuestion[] = [
  QUESTION_1_BRICK,
  QUESTION_2_VACATION,
  QUESTION_3_UNIT_ECONOMICS,
  QUESTION_4_PROCESSES,
  QUESTION_5_ALIGNMENT,
  QUESTION_6_CONSTRAINT
]

/** Get question by ID */
export function getQuestionById(id: number): FlashQuestion | undefined {
  return FLASH_QUESTIONS.find(q => q.id === id)
}

/** Get points for a question based on answer strength */
export function getQuestionPoints(questionId: number, strength: AnswerStrength): number {
  const question = getQuestionById(questionId)
  if (!question) return 0

  switch (strength) {
    case 'strong':
      return question.scoringCriteria.strong.points
    case 'partial':
      return question.scoringCriteria.partial.points
    case 'weak':
      return question.scoringCriteria.weak.points
    default:
      return 0
  }
}

/** UI-friendly answer options */
export const ANSWER_OPTIONS: { value: AnswerStrength; label: string; description: string }[] = [
  {
    value: 'strong',
    label: 'Strong',
    description: 'Yes, confidently'
  },
  {
    value: 'partial',
    label: 'Partial',
    description: 'Somewhat / Working on it'
  },
  {
    value: 'weak',
    label: 'Weak',
    description: 'No / Not really'
  }
]
