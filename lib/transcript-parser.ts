/**
 * Transcript Parser for Meeting Notes
 * 
 * Parses meeting transcripts from various AI tools (Read.ai, Otter, Fireflies, etc.)
 * and extracts actionable insights, decisions, and blockers.
 */

import { QuickWin } from './types'

export interface TranscriptLine {
  speaker?: string
  timestamp?: string
  content: string
}

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

// Patterns for identifying different transcript formats
const TRANSCRIPT_PATTERNS = {
  // Read.ai format: "Speaker Name (00:00:00): content"
  readAi: /^([^(]+)\s*\((\d{2}:\d{2}:\d{2})\):\s*(.+)$/,
  // Otter format: "Speaker Name  00:00" or "Speaker Name: content"
  otter: /^([A-Za-z\s]+)\s+(\d{1,2}:\d{2})?\s*[:\-]?\s*(.+)$/,
  // Fireflies format: "Speaker (00:00): content"
  fireflies: /^([^(]+)\s*\((\d{1,2}:\d{2})\):\s*(.+)$/,
  // Zoom format: "00:00:00 Speaker Name: content" or "Speaker Name    00:00:00"
  zoom: /^(?:(\d{2}:\d{2}:\d{2})\s+)?([A-Za-z\s]+?)(?:\s+(\d{2}:\d{2}:\d{2}))?\s*:\s*(.+)$/,
  // Microsoft Teams format: "Speaker Name joined/left" or "[00:00:00] Speaker Name: content"
  teams: /^\[?(\d{2}:\d{2}:\d{2})\]?\s*([A-Za-z\s]+?):\s*(.+)$/,
  // Google Meet format: "Speaker Name\n00:00:00\ncontent" (multi-line, handled specially)
  googleMeet: /^([A-Za-z\s]+)\s*$/,
  // Grain format: "@00:00 Speaker Name: content"
  grain: /^@(\d{2}:\d{2})\s+([A-Za-z\s]+?):\s*(.+)$/,
  // Fathom format: "Speaker Name • 00:00 content"
  fathom: /^([A-Za-z\s]+)\s*[•·]\s*(\d{1,2}:\d{2})\s*(.+)$/,
  // Rev.ai format: "Speaker 1 (00:00:00): content"
  revAi: /^(Speaker\s*\d+)\s*\((\d{2}:\d{2}:\d{2})\):\s*(.+)$/,
  // Descript format: "SPEAKER NAME:\ncontent" (all caps name)
  descript: /^([A-Z][A-Z\s]+):\s*$/,
  // Assembly.ai format: "speaker_00: content"
  assemblyAi: /^(speaker_\d+):\s*(.+)$/,
  // Sonix format: "(00:00:00) Speaker Name: content"
  sonix: /^\((\d{2}:\d{2}:\d{2})\)\s*([A-Za-z\s]+?):\s*(.+)$/,
  // VTT/SRT caption format: "00:00:00.000 --> 00:00:00.000"
  vttTimestamp: /^(\d{2}:\d{2}:\d{2})[.,]\d{3}\s*-->\s*(\d{2}:\d{2}:\d{2})[.,]\d{3}$/,
  // Generic format: "Name: content"
  generic: /^([A-Za-z\s]+):\s*(.+)$/
}

// Keywords for extraction
const ACTION_KEYWORDS = [
  'action item',
  'todo',
  'to do',
  'to-do',
  'will do',
  'i\'ll',
  'we\'ll',
  'going to',
  'need to',
  'should',
  'must',
  'have to',
  'let\'s',
  'next step',
  'follow up',
  'follow-up',
  'take care of',
  'responsible for',
  'owns this',
  'assigned to',
  'by friday',
  'by monday',
  'by next week',
  'by end of',
  'deadline'
]

const DECISION_KEYWORDS = [
  'decided',
  'decision',
  'agreed',
  'we\'ll go with',
  'let\'s go with',
  'the plan is',
  'we\'re going to',
  'final answer',
  'conclusion',
  'settled on',
  'chosen',
  'selected',
  'approved',
  'confirmed'
]

const BLOCKER_KEYWORDS = [
  'blocked',
  'blocker',
  'blocking',
  'stuck',
  'issue',
  'problem',
  'challenge',
  'obstacle',
  'risk',
  'concern',
  'worry',
  'delay',
  'waiting on',
  'depends on',
  'bottleneck',
  'can\'t proceed',
  'holding up'
]

const WIN_KEYWORDS = [
  'win',
  'won',
  'achieved',
  'accomplished',
  'completed',
  'finished',
  'success',
  'successful',
  'great job',
  'well done',
  'milestone',
  'shipped',
  'launched',
  'delivered',
  'hit target',
  'exceeded'
]

const OWNER_ROLE_MAP: Record<string, QuickWin['owner_role']> = {
  'ceo': 'Owner',
  'owner': 'Owner',
  'founder': 'Owner',
  'president': 'Owner',
  'operations': 'Ops',
  'ops': 'Ops',
  'coo': 'Ops',
  'sales': 'Sales',
  'marketing': 'Sales',
  'cmo': 'Sales',
  'finance': 'Finance',
  'cfo': 'Finance',
  'accounting': 'Finance'
}

/**
 * Detect the transcript format from content
 */
export function detectTranscriptFormat(rawText: string): string {
  const firstLines = rawText.split('\n').slice(0, 10).join('\n')
  
  // Check for VTT/SRT headers
  if (firstLines.includes('WEBVTT') || /^\d+\s*$/.test(firstLines.split('\n')[0])) {
    return 'vtt'
  }
  
  // Check for specific format markers
  if (firstLines.includes('• ') || firstLines.includes('· ')) return 'fathom'
  if (firstLines.match(/@\d{2}:\d{2}/)) return 'grain'
  if (firstLines.match(/\(\d{2}:\d{2}:\d{2}\)/)) return 'sonix'
  if (firstLines.match(/\[\d{2}:\d{2}:\d{2}\]/)) return 'teams'
  if (firstLines.match(/speaker_\d+:/i)) return 'assemblyAi'
  if (firstLines.match(/^Speaker\s*\d+\s*\(/m)) return 'revAi'
  if (firstLines.match(/^[A-Z][A-Z\s]+:\s*$/m)) return 'descript'
  if (firstLines.match(/^\d{2}:\d{2}:\d{2}\s+[A-Za-z]/m)) return 'zoom'
  
  return 'auto'
}

/**
 * Parse VTT/SRT subtitle format
 */
function parseVTTFormat(rawText: string): TranscriptLine[] {
  const lines: TranscriptLine[] = []
  const blocks = rawText.split(/\n\n+/)
  
  for (const block of blocks) {
    const blockLines = block.trim().split('\n')
    if (blockLines.length < 2) continue
    
    // Skip WEBVTT header and numeric indices
    const filtered = blockLines.filter(l => 
      l.trim() && 
      l !== 'WEBVTT' && 
      !/^\d+$/.test(l.trim()) &&
      !l.includes('-->')
    )
    
    // Extract timestamp if present
    const timestampLine = blockLines.find(l => l.includes('-->'))
    let timestamp: string | undefined
    if (timestampLine) {
      const match = timestampLine.match(/(\d{2}:\d{2}:\d{2})/)
      timestamp = match?.[1]
    }
    
    if (filtered.length > 0) {
      lines.push({
        timestamp,
        content: filtered.join(' ').trim()
      })
    }
  }
  
  return lines
}

/**
 * Parse Google Meet format (multi-line blocks)
 */
function parseGoogleMeetFormat(rawText: string): TranscriptLine[] {
  const lines: TranscriptLine[] = []
  const blocks = rawText.split(/\n\n+/)
  
  for (const block of blocks) {
    const blockLines = block.trim().split('\n')
    if (blockLines.length < 2) continue
    
    // First line is typically the speaker
    const speaker = blockLines[0].trim()
    // Second line might be timestamp
    const timestampMatch = blockLines[1]?.match(/(\d{1,2}:\d{2}(?::\d{2})?)/)
    const timestamp = timestampMatch?.[1]
    
    // Rest is content
    const startIndex = timestamp ? 2 : 1
    const content = blockLines.slice(startIndex).join(' ').trim()
    
    if (content) {
      lines.push({ speaker, timestamp, content })
    }
  }
  
  return lines
}

/**
 * Parse Descript format (ALL CAPS speaker names)
 */
function parseDescriptFormat(rawText: string): TranscriptLine[] {
  const lines: TranscriptLine[] = []
  const blocks = rawText.split(/^([A-Z][A-Z\s]+):\s*$/m)
  
  let currentSpeaker = ''
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i].trim()
    if (!block) continue
    
    // Check if this is a speaker name (ALL CAPS)
    if (/^[A-Z][A-Z\s]+$/.test(block)) {
      currentSpeaker = block.split(' ').map(w => 
        w.charAt(0) + w.slice(1).toLowerCase()
      ).join(' ')
    } else if (currentSpeaker) {
      // This is content for the current speaker
      const contentLines = block.split('\n').filter(l => l.trim())
      for (const content of contentLines) {
        lines.push({ speaker: currentSpeaker, content: content.trim() })
      }
    }
  }
  
  return lines
}

/**
 * Parse raw transcript text into structured lines
 */
export function parseTranscriptLines(rawText: string): TranscriptLine[] {
  const format = detectTranscriptFormat(rawText)
  
  // Handle special formats
  if (format === 'vtt') {
    return parseVTTFormat(rawText)
  }
  if (format === 'descript') {
    return parseDescriptFormat(rawText)
  }
  
  // Check for Google Meet multi-line format
  const blocks = rawText.split(/\n\n+/)
  if (blocks.length > 3 && blocks.every(b => b.split('\n').length >= 2)) {
    const meetLines = parseGoogleMeetFormat(rawText)
    if (meetLines.length > 0) return meetLines
  }
  
  const lines = rawText.split('\n').filter(line => line.trim())
  const parsedLines: TranscriptLine[] = []

  for (const line of lines) {
    let match: RegExpMatchArray | null = null
    let parsed: TranscriptLine = { content: line.trim() }

    // Try each pattern in priority order
    const patternPriority = [
      'readAi', 'teams', 'sonix', 'grain', 'fathom', 'revAi', 
      'assemblyAi', 'zoom', 'fireflies', 'otter', 'generic'
    ]
    
    for (const formatName of patternPriority) {
      const pattern = TRANSCRIPT_PATTERNS[formatName as keyof typeof TRANSCRIPT_PATTERNS]
      if (!pattern) continue
      
      match = line.match(pattern)
      if (match) {
        if (formatName === 'generic' || formatName === 'assemblyAi') {
          parsed = {
            speaker: match[1].trim(),
            content: match[2].trim()
          }
        } else if (formatName === 'zoom') {
          // Zoom: either timestamp first or after name
          parsed = {
            timestamp: match[1] || match[3],
            speaker: match[2].trim(),
            content: match[4]?.trim() || ''
          }
        } else if (formatName === 'grain') {
          parsed = {
            timestamp: match[1],
            speaker: match[2].trim(),
            content: match[3]?.trim() || ''
          }
        } else if (formatName === 'fathom') {
          parsed = {
            speaker: match[1].trim(),
            timestamp: match[2],
            content: match[3]?.trim() || ''
          }
        } else {
          parsed = {
            speaker: match[1]?.trim() || match[2]?.trim(),
            timestamp: match[2] || match[1],
            content: match[3]?.trim() || match[2]?.trim() || ''
          }
        }
        break
      }
    }

    if (parsed.content) {
      parsedLines.push(parsed)
    }
  }

  return parsedLines
}

/**
 * Extract unique participants from transcript
 */
export function extractParticipants(lines: TranscriptLine[]): string[] {
  const speakers = new Set<string>()
  
  for (const line of lines) {
    if (line.speaker) {
      speakers.add(line.speaker)
    }
  }
  
  return Array.from(speakers)
}

/**
 * Check if content matches any keywords in a list
 */
function matchesKeywords(content: string, keywords: string[]): boolean {
  const lowerContent = content.toLowerCase()
  return keywords.some(keyword => lowerContent.includes(keyword.toLowerCase()))
}

/**
 * Extract action items from transcript
 */
export function extractActionItems(lines: TranscriptLine[]): ExtractedAction[] {
  const actions: ExtractedAction[] = []
  
  for (const line of lines) {
    if (matchesKeywords(line.content, ACTION_KEYWORDS)) {
      // Try to identify owner from the content or speaker
      let owner: string | undefined = line.speaker
      
      // Look for explicit ownership patterns
      const ownerMatch = line.content.match(/(?:assigned to|owned by|responsible:?)\s+([A-Za-z]+)/i)
      if (ownerMatch) {
        owner = ownerMatch[1]
      }
      
      // Try to extract a clean action title
      let title = line.content
      
      // Remove common prefixes
      title = title.replace(/^(action item:?|todo:?|to do:?)/i, '').trim()
      
      // Truncate if too long
      if (title.length > 100) {
        title = title.substring(0, 97) + '...'
      }
      
      actions.push({
        title,
        owner,
        context: line.content
      })
    }
  }
  
  return actions
}

/**
 * Extract decisions from transcript
 */
export function extractDecisions(lines: TranscriptLine[]): string[] {
  const decisions: string[] = []
  
  for (const line of lines) {
    if (matchesKeywords(line.content, DECISION_KEYWORDS)) {
      decisions.push(line.content)
    }
  }
  
  return decisions
}

/**
 * Extract blockers from transcript
 */
export function extractBlockers(lines: TranscriptLine[]): string[] {
  const blockers: string[] = []
  
  for (const line of lines) {
    if (matchesKeywords(line.content, BLOCKER_KEYWORDS)) {
      blockers.push(line.content)
    }
  }
  
  return blockers
}

/**
 * Extract wins/accomplishments from transcript
 */
export function extractWins(lines: TranscriptLine[]): string[] {
  const wins: string[] = []
  
  for (const line of lines) {
    if (matchesKeywords(line.content, WIN_KEYWORDS)) {
      wins.push(line.content)
    }
  }
  
  return wins
}

/**
 * Generate a brief summary from transcript content
 */
export function generateSummary(lines: TranscriptLine[], maxLength: number = 300): string {
  if (lines.length === 0) return 'No transcript content provided.'
  
  // Get first few substantive lines as summary basis
  const substantiveLines = lines
    .filter(l => l.content.length > 20)
    .slice(0, 5)
    .map(l => l.content)
  
  const summary = substantiveLines.join(' ').substring(0, maxLength)
  
  return summary.length === maxLength ? summary + '...' : summary
}

/**
 * Extract key topics mentioned frequently
 */
export function extractKeyTopics(lines: TranscriptLine[]): string[] {
  const wordCount: Record<string, number> = {}
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need',
    'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we',
    'they', 'what', 'which', 'who', 'when', 'where', 'why', 'how', 'all',
    'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such',
    'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
    'just', 'also', 'now', 'here', 'there', 'then', 'once', 'like', 'get',
    'got', 'going', 'go', 'know', 'think', 'yeah', 'yes', 'okay', 'ok', 'um',
    'uh', 'right', 'well', 'actually', 'really', 'thing', 'things', 'way'
  ])
  
  for (const line of lines) {
    const words = line.content.toLowerCase().match(/\b[a-z]{4,}\b/g) || []
    for (const word of words) {
      if (!stopWords.has(word)) {
        wordCount[word] = (wordCount[word] || 0) + 1
      }
    }
  }
  
  // Get top 10 most frequent meaningful words
  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word)
}

/**
 * Map extracted owner name to DriverOS role
 */
export function mapOwnerToRole(ownerName?: string): QuickWin['owner_role'] {
  if (!ownerName) return 'Owner'
  
  const lowerName = ownerName.toLowerCase()
  
  for (const [keyword, role] of Object.entries(OWNER_ROLE_MAP)) {
    if (lowerName.includes(keyword)) {
      return role
    }
  }
  
  return 'Owner' // Default
}

/**
 * Infer engine from action context
 */
export function inferEngine(content: string): QuickWin['engine'] {
  const lowerContent = content.toLowerCase()
  
  if (lowerContent.match(/sales|marketing|lead|customer|conversion|pipeline/)) {
    return 'Marketing & Sales'
  }
  if (lowerContent.match(/finance|budget|cash|revenue|cost|profit|accounting/)) {
    return 'Finance'
  }
  if (lowerContent.match(/process|operations|delivery|quality|efficiency|workflow/)) {
    return 'Operations'
  }
  if (lowerContent.match(/team|hire|culture|training|onboard|employee|staff/)) {
    return 'Personnel'
  }
  
  return 'Leadership' // Default
}

/**
 * Convert extracted actions to QuickWin format
 */
export function convertToQuickWins(actions: ExtractedAction[]): QuickWin[] {
  return actions.map(action => ({
    title: action.title,
    why: action.context.length > 100 ? action.context.substring(0, 97) + '...' : action.context,
    owner_role: mapOwnerToRole(action.owner),
    eta_days: 7, // Default ETA
    engine: inferEngine(action.context)
  }))
}

/**
 * Main function: Parse and extract all meeting data from transcript
 */
export function parseTranscript(rawTranscript: string): ExtractedMeetingData {
  const lines = parseTranscriptLines(rawTranscript)
  
  return {
    summary: generateSummary(lines),
    actionItems: extractActionItems(lines),
    decisions: extractDecisions(lines),
    blockers: extractBlockers(lines),
    wins: extractWins(lines),
    keyTopics: extractKeyTopics(lines),
    participants: extractParticipants(lines),
    rawTranscript
  }
}

/**
 * Validate transcript has minimum content
 */
export function validateTranscript(rawTranscript: string): { valid: boolean; error?: string } {
  if (!rawTranscript || rawTranscript.trim().length === 0) {
    return { valid: false, error: 'Transcript is empty' }
  }
  
  if (rawTranscript.trim().length < 50) {
    return { valid: false, error: 'Transcript is too short (minimum 50 characters)' }
  }
  
  const lines = parseTranscriptLines(rawTranscript)
  if (lines.length < 3) {
    return { valid: false, error: 'Transcript needs at least 3 lines of content' }
  }
  
  return { valid: true }
}
