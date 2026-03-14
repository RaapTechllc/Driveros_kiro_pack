/**
 * Market Update Job (Placeholder)
 * Fetches industry-specific market data for the org's configured industry.
 *
 * Construction industry data sources (future):
 * - Material price indices (lumber, steel, concrete)
 * - Labor rate benchmarks
 * - Permit activity in target markets
 * - Interest rate / lending conditions
 *
 * This is a scaffold — actual data feed integrations will be added per industry plugin.
 */

import type { JobContext, JobResult } from './types'
import { getBackend } from '@/lib/data/backend'

export interface MarketUpdate {
  industry: string
  generatedAt: string
  dataPoints: MarketDataPoint[]
  summary: string
  alerts: MarketAlert[]
}

export interface MarketDataPoint {
  metric: string
  value: number
  unit: string
  change: number
  changePercent: number
  period: string
  source: string
}

export interface MarketAlert {
  severity: 'info' | 'warning' | 'critical'
  title: string
  description: string
}

export async function runMarketUpdate(context: JobContext): Promise<JobResult> {
  const start = Date.now()
  const { orgId } = context

  try {
    const backend = await getBackend()
    const industryConfig = await backend.getIndustryConfig(orgId)
    const industry = industryConfig?.plugin || 'general'

    // Placeholder: generate sample data based on industry
    const update = generatePlaceholderUpdate(industry, context.now)

    // Store in company memory for AI context
    const memory = await backend.getCompanyMemory(orgId)
    await backend.setCompanyMemory(orgId, {
      ...memory,
      latestMarketUpdate: update,
      marketUpdateTimestamp: new Date().toISOString(),
    })

    return {
      success: true,
      jobName: 'market-update',
      orgId,
      executedAt: new Date().toISOString(),
      duration: Date.now() - start,
      output: update,
    }
  } catch (error) {
    return {
      success: false,
      jobName: 'market-update',
      orgId,
      executedAt: new Date().toISOString(),
      duration: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

function generatePlaceholderUpdate(industry: string, now: Date): MarketUpdate {
  const isConstruction = industry === 'construction'

  const dataPoints: MarketDataPoint[] = isConstruction
    ? [
        { metric: 'Lumber Price Index', value: 485, unit: '$/MBF', change: -12, changePercent: -2.4, period: 'weekly', source: 'placeholder' },
        { metric: 'Steel Rebar', value: 720, unit: '$/ton', change: 5, changePercent: 0.7, period: 'weekly', source: 'placeholder' },
        { metric: 'Ready-Mix Concrete', value: 165, unit: '$/yd³', change: 0, changePercent: 0, period: 'weekly', source: 'placeholder' },
        { metric: 'Avg Hourly Labor Rate', value: 34.50, unit: '$/hr', change: 0.25, changePercent: 0.7, period: 'monthly', source: 'placeholder' },
        { metric: 'Building Permits (SA)', value: 1520, unit: 'K units', change: 15, changePercent: 1.0, period: 'monthly', source: 'placeholder' },
      ]
    : [
        { metric: 'Industry Growth Rate', value: 3.2, unit: '%', change: 0.1, changePercent: 3.2, period: 'quarterly', source: 'placeholder' },
        { metric: 'Consumer Confidence', value: 102.5, unit: 'index', change: -1.3, changePercent: -1.3, period: 'monthly', source: 'placeholder' },
      ]

  const alerts: MarketAlert[] = isConstruction
    ? [
        { severity: 'info', title: 'Lumber prices declining', description: 'Lumber futures down 2.4% WoW — potential savings on upcoming bids.' },
      ]
    : []

  return {
    industry,
    generatedAt: now.toISOString(),
    dataPoints,
    summary: isConstruction
      ? 'Construction market conditions stable. Lumber prices softening, labor remains tight. Building permits up slightly.'
      : `Market conditions for "${industry}" sector: moderate growth expected. Data feeds not yet configured for this industry.`,
    alerts,
  }
}
