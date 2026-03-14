/**
 * Scheduled job types for DriverOS.
 * Jobs are triggered by Supabase Edge Functions, Vercel Cron, or external scheduler.
 */

export interface ScheduledJob {
  id: string
  name: string
  description: string
  schedule: CronSchedule
  handler: (context: JobContext) => Promise<JobResult>
  enabled: boolean
}

export interface CronSchedule {
  /** Cron expression (e.g., '0 7 * * *' for 7 AM daily) */
  expression: string
  /** User's timezone (e.g., 'America/Chicago') */
  timezone: string
}

export interface JobContext {
  orgId: string
  userId?: string
  timezone: string
  now: Date
  params?: Record<string, unknown>
}

export interface JobResult {
  success: boolean
  jobName: string
  orgId: string
  executedAt: string
  duration: number
  output?: unknown
  error?: string
}

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed'

export interface JobExecution {
  id: string
  jobId: string
  orgId: string
  status: JobStatus
  startedAt: string
  completedAt?: string
  result?: JobResult
}

/**
 * Registry of all available scheduled jobs.
 */
export const JOB_REGISTRY: Record<string, Omit<ScheduledJob, 'id' | 'handler'>> = {
  'morning-briefing': {
    name: 'Morning Briefing',
    description: 'Daily AI-generated briefing at 7 AM user timezone',
    schedule: { expression: '0 7 * * *', timezone: 'America/Chicago' },
    enabled: true,
  },
  'weekly-scorecard': {
    name: 'Weekly Scorecard',
    description: 'Auto-generate weekly scorecard every Monday at 8 AM',
    schedule: { expression: '0 8 * * 1', timezone: 'America/Chicago' },
    enabled: true,
  },
  'market-update': {
    name: 'Market Update',
    description: 'Fetch industry market data daily at 6 AM',
    schedule: { expression: '0 6 * * *', timezone: 'America/Chicago' },
    enabled: false, // Placeholder — enable when data feeds are configured
  },
}
