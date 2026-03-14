/**
 * Branding Module Types
 *
 * Defines the brand configuration that applies to all generated documents,
 * emails, and AI outputs. Acts like a Claude "skill" — always in context.
 */

/** Color definition with primary/secondary variants */
export interface BrandColors {
  primary: string
  primaryForeground: string
  secondary: string
  secondaryForeground: string
  accent: string
  accentForeground: string
  /** Background for documents */
  background: string
  /** Text color for documents */
  foreground: string
}

/** Font configuration */
export interface BrandFonts {
  /** Display/heading font family */
  heading: string
  /** Body text font family */
  body: string
  /** Monospace font for data/code */
  mono: string
}

/** Logo configuration */
export interface BrandLogo {
  /** URL or base64 of primary logo (for light backgrounds) */
  primary?: string
  /** URL or base64 of inverted logo (for dark backgrounds) */
  inverted?: string
  /** URL or base64 of icon-only logo */
  icon?: string
  /** Alt text for accessibility */
  altText: string
}

/** Voice and tone guidelines */
export interface BrandVoice {
  /** Overall tone: professional, casual, friendly, authoritative, etc. */
  tone: string
  /** Writing style descriptors */
  style: string[]
  /** Example phrases that sound like the brand */
  examplePhrases: string[]
  /** Words/phrases to always avoid */
  avoids: string[]
  /** How to address clients/customers */
  customerTerm: string
  /** How to address the team */
  teamTerm: string
}

/** Complete brand configuration */
export interface BrandConfig {
  /** Schema version for migration */
  schemaVersion: 1
  /** Organization ID */
  orgId: string
  /** Last updated timestamp */
  updatedAt: string

  /** Company name as it appears on documents */
  companyName: string
  /** Tagline or slogan */
  tagline?: string
  /** Company website URL */
  website?: string

  /** Logo assets */
  logo: BrandLogo

  /** Brand colors */
  colors: BrandColors

  /** Typography */
  fonts: BrandFonts

  /** Voice and tone */
  voice: BrandVoice

  /** Additional brand notes or guidelines */
  notes?: string
}
