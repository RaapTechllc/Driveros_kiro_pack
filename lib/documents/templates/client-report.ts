/**
 * Client Report Template
 * Professional client-facing report with branded styling.
 */

import type { BrandConfig } from '@/lib/data/backend'
import type { ClientReportData } from '../types'

export function getClientReportTemplate(data: ClientReportData, brand: BrandConfig): string {
  const trendIcon = (trend?: 'up' | 'down' | 'flat') => {
    if (trend === 'up') return '<span class="trend-up">↑</span>'
    if (trend === 'down') return '<span class="trend-down">↓</span>'
    return '<span class="trend-flat">→</span>'
  }

  return `
    <div class="header">
      <div>
        ${brand.logo_url ? `<div class="header-logo"><img src="${brand.logo_url}" alt="Logo" /></div>` : ''}
        <h1>Business Health Report</h1>
        <p style="color: #64748b; font-size: 14px;">${data.orgName}${data.clientName ? ` — Prepared for ${data.clientName}` : ''}</p>
      </div>
      <div class="header-meta">
        <div>${new Date(data.reportDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>
    </div>

    <h2>Executive Summary</h2>
    <p style="margin: 8px 0 20px; color: #334155;">${data.projectSummary}</p>

    <h2>Engine Scores</h2>
    <div class="score-grid">
      ${data.engineScores.map(e => `
        <div class="score-card">
          <div class="score">${e.score}<span style="font-size: 14px; color: #94a3b8;">/${e.maxScore}</span></div>
          <div class="label">${e.engine}</div>
          ${trendIcon(e.trend)}
        </div>
      `).join('')}
    </div>

    ${data.keyMetrics.length > 0 ? `
    <h2>Key Metrics</h2>
    ${data.keyMetrics.map(m => `
      <div class="stat-row">
        <span class="stat-label">${m.label}</span>
        <span class="stat-value">${m.value} ${trendIcon(m.trend)}</span>
      </div>
    `).join('')}
    ` : ''}

    ${data.recommendations.length > 0 ? `
    <h2>Recommendations</h2>
    <table class="action-table">
      <thead>
        <tr>
          <th>Recommendation</th>
          <th>Priority</th>
          <th>Details</th>
        </tr>
      </thead>
      <tbody>
        ${data.recommendations.map(r => `
          <tr>
            <td style="font-weight: 500;">${r.title}</td>
            <td><span class="badge ${r.priority === 'do_now' ? 'badge-now' : 'badge-next'}">${r.priority === 'do_now' ? 'DO NOW' : 'DO NEXT'}</span></td>
            <td>${r.description}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    ` : ''}

    ${data.nextSteps.length > 0 ? `
    <h2>Next Steps</h2>
    <ul class="list">
      ${data.nextSteps.map(s => `<li>${s}</li>`).join('')}
    </ul>
    ` : ''}
  `
}
