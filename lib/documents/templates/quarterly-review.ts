/**
 * Quarterly Review Template
 * Strategic review of business health over a quarter.
 */

import type { BrandConfig } from '@/lib/data/backend'
import type { QuarterlyReviewData } from '../types'

export function getQuarterlyReviewTemplate(data: QuarterlyReviewData, brand: BrandConfig): string {
  const gearLabel = ['', 'Idle', 'Cruising', 'Accelerating', 'Racing', 'Apex']
  const gearChange = data.gearProgression.end - data.gearProgression.start

  return `
    <div class="header">
      <div>
        ${brand.logo_url ? `<div class="header-logo"><img src="${brand.logo_url}" alt="Logo" /></div>` : ''}
        <h1>Quarterly Business Review</h1>
        <p style="color: #64748b; font-size: 14px;">${data.orgName}</p>
      </div>
      <div class="header-meta">
        <div>${data.quarter} ${data.year}</div>
        <div style="font-size: 14px;">
          Gear: ${data.gearProgression.start} → ${data.gearProgression.end}
          ${gearChange > 0 ? `<span class="trend-up"> ↑${gearChange}</span>` : gearChange < 0 ? `<span class="trend-down"> ↓${Math.abs(gearChange)}</span>` : ''}
        </div>
      </div>
    </div>

    <h2>🎯 North Star</h2>
    <div style="background: #f0f9ff; border-left: 4px solid var(--color-primary); padding: 16px; border-radius: 4px; margin: 12px 0;">
      <div style="font-weight: 600; font-size: 16px;">${data.northStarGoal}</div>
      <div style="color: #475569; margin-top: 4px;">${data.northStarProgress}</div>
    </div>

    <h2>Quarter at a Glance</h2>
    <div class="score-grid" style="grid-template-columns: repeat(4, 1fr);">
      <div class="score-card">
        <div class="score">${data.actionsCompleted}</div>
        <div class="label">Actions Done</div>
      </div>
      <div class="score-card">
        <div class="score">${data.actionsCreated}</div>
        <div class="label">Actions Created</div>
      </div>
      <div class="score-card">
        <div class="score">${data.meetingsHeld}</div>
        <div class="label">Meetings Held</div>
      </div>
      <div class="score-card">
        <div class="score">${Math.round(data.checkInRate * 100)}%</div>
        <div class="label">Check-in Rate</div>
      </div>
    </div>

    <h2>Engine Trends</h2>
    <table class="action-table">
      <thead>
        <tr>
          <th>Engine</th>
          <th>Start</th>
          <th>End</th>
          <th>Change</th>
        </tr>
      </thead>
      <tbody>
        ${(['vision', 'people', 'operations', 'revenue', 'finance'] as const).map(engine => {
          const trends = data.engineTrends[engine] || []
          const start = trends.length > 0 ? trends[trends.length - 1].score : 0
          const end = trends.length > 0 ? trends[0].score : 0
          const change = end - start
          return `
            <tr>
              <td style="text-transform: capitalize; font-weight: 500;">${engine}</td>
              <td>${start}</td>
              <td>${end}</td>
              <td class="${change > 0 ? 'trend-up' : change < 0 ? 'trend-down' : 'trend-flat'}">
                ${change > 0 ? '+' : ''}${change}
              </td>
            </tr>
          `
        }).join('')}
      </tbody>
    </table>

    ${data.keyAccomplishments.length > 0 ? `
    <h2>🏆 Key Accomplishments</h2>
    <ul class="list">
      ${data.keyAccomplishments.map(a => `<li>${a}</li>`).join('')}
    </ul>
    ` : ''}

    ${data.areasForImprovement.length > 0 ? `
    <h2>📈 Areas for Improvement</h2>
    <ul class="list">
      ${data.areasForImprovement.map(a => `<li>${a}</li>`).join('')}
    </ul>
    ` : ''}

    ${data.nextQuarterPriorities.length > 0 ? `
    <h2>🎯 Next Quarter Priorities</h2>
    <ul class="list">
      ${data.nextQuarterPriorities.map(p => `<li>${p}</li>`).join('')}
    </ul>
    ` : ''}
  `
}
