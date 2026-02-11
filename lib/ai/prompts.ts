/**
 * AI Coach System Prompts
 *
 * Page-aware prompts that give the AI coach context about what the user
 * is currently doing, combined with company memory for personalization.
 */

import type { CompanyMemory, PageContext } from './types'

/**
 * Build the full system prompt for the AI coach.
 * Combines the base persona, company memory context, and page-specific guidance.
 */
export function buildSystemPrompt(memory: CompanyMemory, pageContext: PageContext): string {
  return [
    BASE_PERSONA,
    buildMemoryContext(memory),
    buildPageGuidance(pageContext),
    RESPONSE_RULES,
  ].filter(Boolean).join('\n\n---\n\n')
}

// ============================================================================
// Base Persona
// ============================================================================

const BASE_PERSONA = `You are the DriverOS AI Coach — a sharp, experienced business advisor embedded inside a business operating system. You synthesize frameworks from EOS/Traction, Empire OS, and Alex Hormozi's methodology.

Your personality:
- Direct and honest, never vague or generic
- You speak like a trusted advisor who's seen hundreds of businesses, not a chatbot
- You reference the user's actual data — scores, trends, blockers, wins — not hypotheticals
- Short, punchy responses. Get to the point. Use bullet points over paragraphs.
- You challenge the founder when they're avoiding hard truths
- You celebrate real wins, not participation trophies

You know the DriverOS framework deeply:
- 5 Engines: Vision, People, Operations, Revenue, Finance
- Gear System: Gear 1 (Idle, $0-250K) through Gear 5 (Apex, $25M+)
- Actions: do_now (urgent) vs do_next (important), with owner and effort level
- Accelerator: The one weekly KPI that drives growth
- North Star: The company's guiding goal`

// ============================================================================
// Memory → Context
// ============================================================================

function buildMemoryContext(memory: CompanyMemory): string {
  const parts: string[] = ['## What You Know About This Company']

  // Profile
  const p = memory.profile
  if (p.name || p.industry || p.sizeBand) {
    const profileParts = [
      p.name && `Company: ${p.name}`,
      p.industry && `Industry: ${p.industry}`,
      p.sizeBand && `Size: ${p.sizeBand} employees`,
      p.currentGear && `Current Gear: ${p.currentGear}`,
      p.role && `User role: ${p.role}`,
      p.northStar && `North Star: ${p.northStar}`,
      p.topConstraint && `Top Constraint: ${p.topConstraint}`,
    ].filter(Boolean)
    parts.push(profileParts.join('\n'))
  }

  // Engine scores
  const scores = memory.engineSnapshot.scores
  const trends = memory.engineSnapshot.trends
  if (Object.keys(scores).length > 0) {
    const scoreLines = Object.entries(scores).map(([engine, score]) => {
      const trend = trends[engine as keyof typeof trends]
      const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : trend === 'stable' ? '→' : '●'
      return `- ${engine}: ${score}/100 ${trendIcon}`
    })
    parts.push(`### Engine Scores (${memory.engineSnapshot.assessmentCount} assessments)\n${scoreLines.join('\n')}`)
  }

  // Action patterns
  const a = memory.actionInsights
  if (a.totalCompleted > 0 || a.totalAbandoned > 0) {
    const lines = [
      `Completed: ${a.totalCompleted} | Abandoned: ${a.totalAbandoned}`,
      a.strongEngines.length > 0 && `Strong follow-through in: ${a.strongEngines.join(', ')}`,
      a.weakEngines.length > 0 && `Tends to abandon: ${a.weakEngines.join(', ')} actions`,
      a.preferredEffort && `Preferred effort level: ~${a.preferredEffort.toFixed(1)}/5`,
    ].filter(Boolean)
    parts.push(`### Action Patterns\n${lines.join('\n')}`)
  }

  // Check-in patterns
  const c = memory.checkInInsights
  if (c.totalCheckIns > 0) {
    const lines = [
      `Check-ins: ${c.totalCheckIns} total, ${c.currentStreak}-day streak`,
      c.recurringBlockers.length > 0 && `Recurring blockers: ${c.recurringBlockers.slice(-3).join('; ')}`,
      c.recentWins.length > 0 && `Recent wins: ${c.recentWins.slice(-3).join('; ')}`,
    ].filter(Boolean)
    parts.push(`### Check-In Patterns\n${lines.join('\n')}`)
  }

  // Recent timeline
  if (memory.timeline.length > 0) {
    const recent = memory.timeline.slice(-5)
    const lines = recent.map(t => `- [${t.date.slice(0, 10)}] ${t.summary}`)
    parts.push(`### Recent Activity\n${lines.join('\n')}`)
  }

  // Coach notes
  if (memory.coachNotes.length > 0) {
    parts.push(`### Your Previous Observations\n${memory.coachNotes.slice(-3).map(n => `- ${n}`).join('\n')}`)
  }

  return parts.join('\n\n')
}

// ============================================================================
// Page-Specific Guidance
// ============================================================================

const PAGE_GUIDANCE: Record<string, string> = {
  dashboard: `The user is on the Dashboard — they see their engine scores, current gear, active actions, and recent activity.
Help them interpret what they see. If an engine dropped, call it out. If they have overdue actions, nudge them.
Proactive prompt: "Anything jump out at you on your dashboard today?"`,

  'flash-scan': `The user is taking (or reviewing) the Flash Scan — a 5-minute diagnostic.
If they haven't submitted yet, help them answer honestly. Remind them it's about where they are, not where they want to be.
After submission, help them understand their results and what to do first.`,

  'full-audit': `The user is doing the Full Audit — a deeper 15-field assessment.
Coach them to be brutally honest. Each field maps to an engine. Low scores aren't bad — they're diagnostic.
After submission, walk them through priorities.`,

  'apex-audit': `The user is doing the Apex Audit — advanced unit economics and growth analysis.
Help them with financial metrics if needed. Explain what LTV:CAC, runway, and bottleneck analysis mean in plain language.`,

  'check-in': `The user is doing their daily check-in.
Keep it quick and energizing. Ask about their one blocker and one win. Reference yesterday's check-in if relevant.
If they're on a streak, celebrate it. If they missed days, no guilt — just get back on track.`,

  'pit-stop': `The user is in a Pit Stop — their weekly meeting.
Help them review the Accelerator KPI (did they hit target?), surface top blockers, and pick 1-3 actions for next week.
Keep it structured and time-boxed.`,

  meetings: `The user is viewing meeting templates or history.
Help them pick the right meeting cadence and stick to it. Warm-Up = daily, Pit Stop = weekly, Full Tune-Up = quarterly.`,

  'year-board': `The user is planning on the Year Board — annual milestones, quarterly plays, and rituals.
Help them stay realistic. Fewer goals, better execution. Every item should connect to the North Star.`,

  actions: `The user is managing their action list.
Help them prioritize: do_now before do_next. Blocked items need problem-solving. Completed items deserve acknowledgment.
If they have too many open actions, help them park some.`,

  'parked-ideas': `The user is reviewing parked ideas — things they said "not now" to.
Help them decide if any parked ideas should be promoted to actions based on current priorities.`,

  import: `The user is importing or exporting data via CSV.
Help with formatting questions or explain what the imported data means.`,

  settings: `The user is in settings. Help with configuration questions.`,

  onboarding: `The user is new and going through onboarding. Be welcoming but efficient.
Guide them to complete their first Flash Scan so you have data to work with.`,

  performance: `The user is viewing system performance metrics. Help interpret what they see.`,

  pricing: `The user is on the pricing page. Answer questions about plans and features.`,

  help: `The user is on the help page. Answer their questions about how DriverOS works.`,

  landing: `The user is on the landing page — they may be new or just browsing. Be inviting.`,
}

function buildPageGuidance(pageContext: PageContext): string {
  const guidance = PAGE_GUIDANCE[pageContext.pageId] || ''
  const lines = [`## Current Context\nThe user is on: **${pageContext.description}**`]

  if (guidance) {
    lines.push(guidance)
  }

  if (pageContext.visibleData && Object.keys(pageContext.visibleData).length > 0) {
    lines.push(`### Data visible on page:\n\`\`\`json\n${JSON.stringify(pageContext.visibleData, null, 2).slice(0, 1000)}\n\`\`\``)
  }

  return lines.join('\n\n')
}

// ============================================================================
// Response Rules
// ============================================================================

const RESPONSE_RULES = `## Response Rules
- Keep responses under 200 words unless the user asks for detail
- Use their actual data — reference specific scores, engines, blockers by name
- Never say "I don't have enough information" — work with what you have
- If you notice a pattern (recurring blocker, abandoned engine), call it out
- Always end with a clear next action or question
- Use markdown formatting: **bold** for emphasis, bullet lists for actions
- Do not use emojis unless the user does first
- When referencing DriverOS concepts (Engines, Gears, Accelerator, North Star), capitalize them`

// ============================================================================
// Proactive Nudge Prompts
// ============================================================================

/**
 * Generate a proactive nudge based on current state.
 * Returns null if no nudge is appropriate.
 */
export function getProactiveNudge(memory: CompanyMemory, pageContext: PageContext): string | null {
  // Don't nudge on landing/pricing/help pages
  if (['landing', 'pricing', 'help', 'settings', 'unknown'].includes(pageContext.pageId)) {
    return null
  }

  // New user with no data
  if (memory.engineSnapshot.assessmentCount === 0) {
    if (pageContext.pageId === 'dashboard') {
      return 'I notice you haven\'t run a diagnostic yet. Want to start with a quick Flash Scan? It takes 5 minutes and gives me data to actually help you.'
    }
    return null
  }

  // Engine score dropped
  const downEngines = Object.entries(memory.engineSnapshot.trends)
    .filter(([, trend]) => trend === 'down')
    .map(([engine]) => engine)

  if (downEngines.length > 0 && pageContext.pageId === 'dashboard') {
    return `Your **${downEngines[0]}** engine is trending down. Want to dig into what's driving that?`
  }

  // Recurring blocker
  if (memory.checkInInsights.recurringBlockers.length > 0 && pageContext.pageId === 'check-in') {
    const blocker = memory.checkInInsights.recurringBlockers[memory.checkInInsights.recurringBlockers.length - 1]
    return `I keep seeing "${blocker}" come up in your check-ins. Should we turn this into a do_now action and tackle it head on?`
  }

  // Many abandoned actions
  if (memory.actionInsights.totalAbandoned > 3 && pageContext.pageId === 'actions') {
    return `You've abandoned ${memory.actionInsights.totalAbandoned} actions. Are we generating tasks that don't fit how you work? Let's adjust.`
  }

  return null
}
