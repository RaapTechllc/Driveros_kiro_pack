import { z } from 'zod'

// CSV injection prevention - detect dangerous formulas
const CSV_INJECTION_PATTERNS = [
  /^[=@+\-]/,  // Starts with formula characters
  /\b(cmd|powershell|bash|sh)\b/i,  // Command injection
  /\b(script|javascript|vbscript)\b/i,  // Script injection
]

function sanitizeCSVInput(value: string): string {
  if (typeof value !== 'string') return ''
  
  // Check for CSV injection patterns
  for (const pattern of CSV_INJECTION_PATTERNS) {
    if (pattern.test(value.trim())) {
      // Prefix with single quote to neutralize formula
      return `'${value}`
    }
  }
  
  return value.trim()
}

// Base string validation with XSS prevention
const safeString = z.string()
  .min(1, 'Required')
  .transform((val) => {
    // Basic XSS prevention - strip HTML tags and dangerous characters
    return val
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[<>'"&]/g, (char) => {
        const entities: Record<string, string> = {
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#x27;',
          '&': '&amp;'
        }
        return entities[char] || char
      })
      .trim()
  })
  .refine((val) => val.length <= 500, 'Too long')

// CSV-safe string validation
const csvSafeString = z.string()
  .transform(sanitizeCSVInput)
  .refine((val) => val.length > 0, 'Required')
  .refine((val) => val.length <= 500, 'Too long')

// Flash Scan validation schema
export const flashScanSchema = z.object({
  industry: z.enum(['Tech', 'Healthcare', 'Finance', 'Retail', 'Manufacturing', 'Other']),
  size_band: z.enum(['1-10', '11-50', '51-200', '201+']),
  role: z.enum(['Owner', 'CEO', 'Leader', 'Ops', 'Sales', 'Finance']),
  north_star: safeString.refine((val) => val.length <= 200, 'North star goal too long'),
  top_constraint: safeString.refine((val) => val.length <= 200, 'Constraint description too long')
})

// Full Audit validation schema
export const fullAuditSchema = flashScanSchema.extend({
  // Leadership Engine
  vision_clarity: z.number().int().min(1).max(5),
  decision_speed: z.number().int().min(1).max(5),
  team_alignment: z.number().int().min(1).max(5),
  
  // Operations Engine
  process_efficiency: z.number().int().min(1).max(5),
  quality_control: z.number().int().min(1).max(5),
  delivery_reliability: z.number().int().min(1).max(5),
  
  // Marketing & Sales Engine
  lead_generation: z.number().int().min(1).max(5),
  conversion_rate: z.number().int().min(1).max(5),
  customer_retention: z.number().int().min(1).max(5),
  
  // Finance Engine
  cash_flow_health: z.number().int().min(1).max(5),
  profitability: z.number().int().min(1).max(5),
  financial_planning: z.number().int().min(1).max(5),
  
  // Personnel Engine
  team_satisfaction: z.number().int().min(1).max(5),
  skill_gaps: z.number().int().min(1).max(5),
  retention_risk: z.number().int().min(1).max(5)
})

// CSV Import validation schemas
export const csvActionSchema = z.object({
  title: csvSafeString.refine((val) => val.length <= 100, 'Title too long'),
  why: csvSafeString.refine((val) => val.length <= 200, 'Why description too long'),
  owner_role: z.enum(['Owner', 'Ops', 'Sales', 'Finance']),
  engine: z.enum(['Leadership', 'Operations', 'Marketing & Sales', 'Finance', 'Personnel']),
  eta_days: z.number().int().min(1).max(365),
  status: z.enum(['todo', 'doing', 'done']),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional()
})

export const csvGoalSchema = z.object({
  level: z.enum(['north_star', 'department']),
  department: z.enum(['Ops', 'Sales/Marketing', 'Finance']).optional(),
  title: csvSafeString.refine((val) => val.length <= 100, 'Title too long'),
  metric: csvSafeString.refine((val) => val.length <= 50, 'Metric too long').optional(),
  current: z.number().optional(),
  target: z.number().optional(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
  alignment_statement: csvSafeString.refine((val) => val.length <= 200, 'Alignment statement too long').optional()
})

// Export types
export type FlashScanInput = z.infer<typeof flashScanSchema>
export type FullAuditInput = z.infer<typeof fullAuditSchema>
export type CSVActionInput = z.infer<typeof csvActionSchema>
export type CSVGoalInput = z.infer<typeof csvGoalSchema>