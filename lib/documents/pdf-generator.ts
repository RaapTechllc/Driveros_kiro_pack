/**
 * PDF Generator for DriverOS.
 * Generates branded HTML documents that can be converted to PDF.
 *
 * Architecture: Templates produce HTML → server renders to PDF via Puppeteer/wkhtmltopdf
 * For MVP: returns styled HTML that prints cleanly as PDF via browser print dialog.
 */

import type { BrandConfig } from '@/lib/data/backend'
import type { DocumentConfig, GeneratedDocument, TemplateType } from './types'
import { getWeeklyScorecardTemplate } from './templates/weekly-scorecard'
import { getQuarterlyReviewTemplate } from './templates/quarterly-review'
import { getClientReportTemplate } from './templates/client-report'

export interface PDFGeneratorOptions {
  config: DocumentConfig
  data: Record<string, unknown>
}

/**
 * Generate a branded HTML document from template + data.
 */
export async function generateDocument(options: PDFGeneratorOptions): Promise<GeneratedDocument> {
  const { config, data } = options
  const brand = config.brandConfig ?? getDefaultBrand()

  const html = renderTemplate(config.template, data, brand)
  const wrappedHtml = wrapInDocument(html, config.title, brand)

  return {
    id: crypto.randomUUID(),
    orgId: config.orgId,
    template: config.template,
    title: config.title,
    content: wrappedHtml,
    generatedAt: new Date().toISOString(),
    metadata: { dateRange: config.dateRange, format: config.format },
  }
}

function renderTemplate(template: TemplateType, data: Record<string, unknown>, brand: BrandConfig): string {
  switch (template) {
    case 'weekly-scorecard':
      return getWeeklyScorecardTemplate(data as any, brand)
    case 'quarterly-review':
      return getQuarterlyReviewTemplate(data as any, brand)
    case 'client-report':
      return getClientReportTemplate(data as any, brand)
    default:
      return `<div class="report-body"><p>Template "${template}" is not yet implemented.</p></div>`
  }
}

function getDefaultBrand(): BrandConfig {
  return {
    id: 'default',
    org_id: 'default',
    logo_url: null,
    colors: { primary: '#2563eb', secondary: '#1e40af', accent: '#f59e0b' },
    fonts: { heading: 'Inter', body: 'Inter' },
    tone: 'professional',
    voice: 'confident and clear',
    avoids: [],
  }
}

function wrapInDocument(bodyHtml: string, title: string, brand: BrandConfig): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=${brand.fonts.heading.replace(/ /g, '+')}:wght@400;600;700&family=${brand.fonts.body.replace(/ /g, '+')}:wght@300;400;500&display=swap');

    :root {
      --color-primary: ${brand.colors.primary};
      --color-secondary: ${brand.colors.secondary};
      --color-accent: ${brand.colors.accent};
      --font-heading: '${brand.fonts.heading}', system-ui, sans-serif;
      --font-body: '${brand.fonts.body}', system-ui, sans-serif;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: var(--font-body);
      color: #1a1a2e;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 32px;
      background: #fff;
    }

    h1, h2, h3 { font-family: var(--font-heading); color: var(--color-primary); }
    h1 { font-size: 28px; margin-bottom: 8px; }
    h2 { font-size: 20px; margin: 24px 0 12px; border-bottom: 2px solid var(--color-accent); padding-bottom: 4px; }
    h3 { font-size: 16px; margin: 16px 0 8px; color: var(--color-secondary); }

    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; border-bottom: 3px solid var(--color-primary); padding-bottom: 16px; }
    .header-logo img { max-height: 48px; }
    .header-meta { text-align: right; font-size: 13px; color: #666; }

    .score-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin: 16px 0; }
    .score-card { text-align: center; padding: 12px 8px; border-radius: 8px; background: #f8fafc; border: 1px solid #e2e8f0; }
    .score-card .score { font-size: 28px; font-weight: 700; color: var(--color-primary); }
    .score-card .label { font-size: 11px; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; }
    .score-card .trend { font-size: 12px; }
    .trend-up { color: #16a34a; }
    .trend-down { color: #dc2626; }
    .trend-flat { color: #64748b; }

    .stat-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
    .stat-label { color: #475569; }
    .stat-value { font-weight: 600; }

    .list { list-style: none; padding: 0; }
    .list li { padding: 6px 0 6px 20px; position: relative; }
    .list li::before { content: '→'; position: absolute; left: 0; color: var(--color-accent); font-weight: 600; }

    .action-table { width: 100%; border-collapse: collapse; margin: 12px 0; }
    .action-table th { background: var(--color-primary); color: #fff; padding: 8px 12px; text-align: left; font-size: 12px; text-transform: uppercase; }
    .action-table td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
    .action-table tr:nth-child(even) { background: #f8fafc; }

    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
    .badge-now { background: #fef2f2; color: #dc2626; }
    .badge-next { background: #eff6ff; color: #2563eb; }

    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8; }

    @media print {
      body { padding: 20px; }
      .score-grid { break-inside: avoid; }
    }
  </style>
</head>
<body>
  ${bodyHtml}
  <div class="footer">
    Generated by DriverOS &bull; ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
  </div>
</body>
</html>`
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
