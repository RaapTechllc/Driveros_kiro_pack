/**
 * Weekly Scorecard Template
 * Auto-populated report showing weekly business health.
 */

import type { BrandConfig } from '@/lib/data/backend'
import type { WeeklyScorecardData } from '../types'

export function getWeeklyScorecardTemplate(data: WeeklyScorecardData, brand: BrandConfig): string {
  const trendIcon = (trend: 'up' | 'down' | 'flat', pct: number) => {
    if (trend === 'up') return `<span class="trend trend-up">↑ ${pct}%</span>`
    if (trend === 'down') return `<span class="trend trend-down">↓ ${pct}%</span>`
    return `<span class="trend trend-flat">→ 0%</span>`
  }

  const gearLabel = ['', 'Idle', 'Cruising', 'Accelerating', 'Racing', 'Apex'][data.gear] || ''

  return `
    <div class="header">
      <div>
        ${brand.logo_url ? `<div class="header-logo"><img src="${brand.logo_url}" alt="Logo" /></div>` : ''}
        <h1>Weekly Scorecard</h1>
        <p style="color: #64748b; font-size: 14px;">${data.orgName}</p>
      </div>
      <div class="header-meta">
        <div>Week of ${data.weekOf}</div>
        <div style="font-size: 18px; font-weight: 700; color: var(--color-primary);">Gear ${data.gear} — ${gearLabel}</div>
        <div style="font-size: 24px; font-weight: 700;">${data.overallScore}/100</div>
      </div>
    </div>

    <h2>Engine Scores</h2>
    <div class="score-grid">
      ${data.engineScores.map(e => `
        <div class="score-card">
          <div class="score">${e.score}</div>
          <div class="label">${e.engine}</div>
          ${trendIcon(e.trend, e.changePercent)}
        </div>
      `).join('')}
    </div>

    <h2>Key Stats</h2>
    <div class="stat-row">
      <span class="stat-label">Actions Completed</span>
      <span class="stat-value">${data.actionsCompleted} / ${data.actionsTotal}</span>
    </div>
    <div class="stat-row">
      <span class="stat-label">Check-in Streak</span>
      <span class="stat-value">${data.checkInStreak} days 🔥</span>
    </div>
    <div class="stat-row">
      <span class="stat-label">Completion Rate</span>
      <span class="stat-value">${data.actionsTotal > 0 ? Math.round((data.actionsCompleted / data.actionsTotal) * 100) : 0}%</span>
    </div>

    ${data.topWins.length > 0 ? `
    <h2>🏆 Wins This Week</h2>
    <ul class="list">
      ${data.topWins.map(w => `<li>${w}</li>`).join('')}
    </ul>
    ` : ''}

    ${data.topBlockers.length > 0 ? `
    <h2>🚧 Blockers</h2>
    <ul class="list">
      ${data.topBlockers.map(b => `<li>${b}</li>`).join('')}
    </ul>
    ` : ''}

    ${data.nextWeekFocus.length > 0 ? `
    <h2>🎯 Next Week Focus</h2>
    <ul class="list">
      ${data.nextWeekFocus.map(f => `<li>${f}</li>`).join('')}
    </ul>
    ` : ''}
  `
}
