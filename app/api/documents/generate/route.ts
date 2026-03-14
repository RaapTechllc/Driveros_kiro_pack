/**
 * Document Generation API
 * POST /api/documents/generate
 *
 * Body: { template, orgId, title?, dateRange?, data }
 * Returns: { id, title, content (HTML), generatedAt }
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateDocument } from '@/lib/documents/pdf-generator'
import { getBackend } from '@/lib/data/backend'
import type { TemplateType } from '@/lib/documents/types'

const VALID_TEMPLATES: TemplateType[] = [
  'weekly-scorecard', 'quarterly-review', 'client-report',
  'monthly-health', 'annual-plan', 'flash-scan-results', 'full-audit-results',
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { template, orgId, title, dateRange, data } = body

    if (!template || !VALID_TEMPLATES.includes(template)) {
      return NextResponse.json(
        { error: `Invalid template. Valid: ${VALID_TEMPLATES.join(', ')}` },
        { status: 400 }
      )
    }

    if (!orgId) {
      return NextResponse.json({ error: 'orgId is required' }, { status: 400 })
    }

    // Fetch brand config for the org
    const backend = await getBackend()
    const brandConfig = await backend.getBrandConfig(orgId)

    const doc = await generateDocument({
      config: {
        orgId,
        title: title || `${template} Report`,
        template,
        brandConfig,
        dateRange,
      },
      data: data || {},
    })

    return NextResponse.json(doc)
  } catch (error) {
    console.error('Document generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate document' },
      { status: 500 }
    )
  }
}
