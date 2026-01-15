/**
 * Transcript Parser - Simplified
 * Extracts action items, decisions, and blockers from meeting notes.
 */

import { QuickWin } from './types'

export interface ExtractedMeetingData {
  summary: string
  actionItems: ExtractedAction[]
  decisions: string[]
  blockers: string[]
  wins: string[]
  keyTopics: string[]
  participants: string[]
  rawTranscript: string
}

export interface ExtractedAction {
  title: string
  owner?: string
  dueDate?: string
  context: string
}

const ACTION_KEYWORDS = ['action item', 'todo', 'will do', 'need to', 'should', 'must', 'follow up', 'next step', 'deadline']
const DECISION_KEYWORDS = ['decided', 'agreed', 'we\'ll go with', 'the plan is', 'approved', 'confirmed']
const BLOCKER_KEYWORDS = ['blocked', 'stuck', 'issue', 'problem', 'waiting on', 'depends on']
const WIN_KEYWORDS = ['win', 'achieved', 'completed', 'success', 'shipped', 'launched']

function matchesKeywords(content: string, keywords: string[]): boolean {
  const lower = content.toLowerCase()
  return keywords.some(k => lower.includes(k))
}

function parseLines(text: string): { speaker?: string; content: string }[] {
  return text.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => {
      // Try "Speaker: content" format
      const match = line.match(/^([A-Za-z\s]+):\s*(.+)$/)
      return match ? { speaker: match[1].trim(), content: match[2].trim() } : { content: line }
    })
}

export function parseTranscript(rawTranscript: string): ExtractedMeetingData {
  const lines = parseLines(rawTranscript)
  
  const actionItems: ExtractedAction[] = lines
    .filter(l => matchesKeywords(l.content, ACTION_KEYWORDS))
    .map(l => ({
      title: l.content.replace(/^(action item:?|todo:?)/i, '').trim().slice(0, 100),
      owner: l.speaker,
      context: l.content
    }))

  const decisions = lines.filter(l => matchesKeywords(l.content, DECISION_KEYWORDS)).map(l => l.content)
  const blockers = lines.filter(l => matchesKeywords(l.content, BLOCKER_KEYWORDS)).map(l => l.content)
  const wins = lines.filter(l => matchesKeywords(l.content, WIN_KEYWORDS)).map(l => l.content)
  
  const participants = Array.from(new Set(lines.map(l => l.speaker).filter((s): s is string => !!s)))
  const summary = lines.slice(0, 3).map(l => l.content).join(' ').slice(0, 300)

  return { summary, actionItems, decisions, blockers, wins, keyTopics: [], participants, rawTranscript }
}

export function validateTranscript(rawTranscript: string): { valid: boolean; error?: string } {
  if (!rawTranscript?.trim()) return { valid: false, error: 'Transcript is empty' }
  if (rawTranscript.trim().length < 50) return { valid: false, error: 'Transcript too short (min 50 chars)' }
  return { valid: true }
}

export function convertToQuickWins(actions: ExtractedAction[]): QuickWin[] {
  return actions.map(a => ({
    title: a.title,
    why: a.context.slice(0, 100),
    owner_role: 'Owner' as const,
    eta_days: 7,
    engine: 'Leadership'
  }))
}
