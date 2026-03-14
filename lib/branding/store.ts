/**
 * Branding Store
 *
 * Save/load brand configuration.
 * Demo mode: localStorage. Production: Supabase.
 */

import { safeGetItem, safeSetItem } from '@/lib/storage'
import type { BrandConfig } from './types'

const STORAGE_KEY = 'brand-config'

/** Create a default brand config */
export function createDefaultBrandConfig(orgId: string): BrandConfig {
  return {
    schemaVersion: 1,
    orgId,
    updatedAt: new Date().toISOString(),
    companyName: '',
    logo: {
      altText: 'Company Logo',
    },
    colors: {
      primary: '#2563eb',
      primaryForeground: '#ffffff',
      secondary: '#64748b',
      secondaryForeground: '#ffffff',
      accent: '#f59e0b',
      accentForeground: '#000000',
      background: '#ffffff',
      foreground: '#0f172a',
    },
    fonts: {
      heading: 'Inter, system-ui, sans-serif',
      body: 'Inter, system-ui, sans-serif',
      mono: 'JetBrains Mono, monospace',
    },
    voice: {
      tone: 'professional',
      style: ['clear', 'confident', 'helpful'],
      examplePhrases: [],
      avoids: [],
      customerTerm: 'client',
      teamTerm: 'team',
    },
  }
}

/** Load brand config from localStorage */
export function loadBrandConfig(orgId: string): BrandConfig {
  const stored = safeGetItem<BrandConfig | null>(STORAGE_KEY, null)
  if (stored && stored.orgId === orgId && stored.schemaVersion === 1) {
    return stored
  }
  return createDefaultBrandConfig(orgId)
}

/** Save brand config to localStorage */
export function saveBrandConfig(config: BrandConfig): void {
  config.updatedAt = new Date().toISOString()
  safeSetItem(STORAGE_KEY, config)
}

/** Check if brand config has been customized */
export function isBrandConfigured(orgId: string): boolean {
  const config = loadBrandConfig(orgId)
  return config.companyName.trim().length > 0
}

/** Update partial brand config */
export function updateBrandConfig(orgId: string, updates: Partial<BrandConfig>): BrandConfig {
  const current = loadBrandConfig(orgId)
  const updated: BrandConfig = {
    ...current,
    ...updates,
    // Deep merge nested objects
    logo: { ...current.logo, ...(updates.logo || {}) },
    colors: { ...current.colors, ...(updates.colors || {}) },
    fonts: { ...current.fonts, ...(updates.fonts || {}) },
    voice: { ...current.voice, ...(updates.voice || {}) },
    schemaVersion: 1,
    orgId,
    updatedAt: new Date().toISOString(),
  }
  saveBrandConfig(updated)
  return updated
}
