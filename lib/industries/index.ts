/**
 * Industry Plugin Registry
 *
 * Central registry for all industry plugins.
 * Import and register new plugins here.
 */

export type { IndustryPlugin, IndustryPluginRegistry, IndustryQuestion, IndustryKPI, ComplianceItem, DocumentTemplate, SeasonalPattern, MarketDataPoint } from './types'
export { constructionPlugin } from './construction'

import type { IndustryPlugin, IndustryPluginRegistry } from './types'
import { constructionPlugin } from './construction'

const registry: IndustryPluginRegistry = {
  construction: constructionPlugin,
}

/** Get a plugin by industry ID */
export function getIndustryPlugin(industryId: string): IndustryPlugin | null {
  return registry[industryId] ?? null
}

/** Get all registered plugins */
export function getAllPlugins(): IndustryPlugin[] {
  return Object.values(registry)
}

/** List available industry IDs */
export function getAvailableIndustries(): { id: string; name: string; icon: string }[] {
  return Object.values(registry).map(p => ({ id: p.id, name: p.name, icon: p.icon }))
}

/** Register a new plugin at runtime */
export function registerPlugin(plugin: IndustryPlugin): void {
  registry[plugin.id] = plugin
}
