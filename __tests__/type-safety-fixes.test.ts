import { ensureNullableFields } from '../lib/data/actions'

describe('Type Safety Fixes', () => {
  describe('ensureNullableFields utility', () => {
    it('should handle undefined fields by converting to null', () => {
      const input = {
        id: 'test-1',
        title: 'Test Action',
        priority: 'do_now' as const,
        status: 'not_started' as const,
        created_at: '2026-01-30T00:00:00Z',
        updated_at: '2026-01-30T00:00:00Z',
        // Intentionally omitting nullable fields to test undefined handling
      }

      const result = ensureNullableFields(input)

      expect(result.description).toBe(null)
      expect(result.why).toBe(null)
      expect(result.owner).toBe(null)
      expect(result.engine).toBe(null)
      expect(result.effort).toBe(null)
      expect(result.due_date).toBe(null)
      expect(result.source).toBe(null)
    })

    it('should preserve existing null values', () => {
      const input = {
        id: 'test-2',
        title: 'Test Action',
        description: null,
        why: null,
        owner: null,
        engine: null,
        priority: 'do_next' as const,
        status: 'in_progress' as const,
        effort: null,
        due_date: null,
        source: null,
        created_at: '2026-01-30T00:00:00Z',
        updated_at: '2026-01-30T00:00:00Z',
      }

      const result = ensureNullableFields(input)

      expect(result.description).toBe(null)
      expect(result.why).toBe(null)
      expect(result.owner).toBe(null)
      expect(result.engine).toBe(null)
      expect(result.effort).toBe(null)
      expect(result.due_date).toBe(null)
      expect(result.source).toBe(null)
    })

    it('should preserve existing non-null values', () => {
      const input = {
        id: 'test-3',
        title: 'Test Action',
        description: 'Test description',
        why: 'Test reason',
        owner: 'CEO',
        engine: 'operations' as const,
        priority: 'do_now' as const,
        status: 'completed' as const,
        effort: 5,
        due_date: '2026-02-01',
        source: 'manual',
        created_at: '2026-01-30T00:00:00Z',
        updated_at: '2026-01-30T00:00:00Z',
      }

      const result = ensureNullableFields(input)

      expect(result.description).toBe('Test description')
      expect(result.why).toBe('Test reason')
      expect(result.owner).toBe('CEO')
      expect(result.engine).toBe('operations')
      expect(result.effort).toBe(5)
      expect(result.due_date).toBe('2026-02-01')
      expect(result.source).toBe('manual')
    })

    it('should handle mixed null and undefined values', () => {
      const input = {
        id: 'test-4',
        title: 'Test Action',
        description: 'Has description',
        why: undefined, // Should become null
        owner: null, // Should stay null
        engine: 'finance' as const,
        priority: 'do_next' as const,
        status: 'blocked' as const,
        effort: undefined, // Should become null
        due_date: '2026-03-01',
        source: undefined, // Should become null
        created_at: '2026-01-30T00:00:00Z',
        updated_at: '2026-01-30T00:00:00Z',
      }

      const result = ensureNullableFields(input)

      expect(result.description).toBe('Has description')
      expect(result.why).toBe(null)
      expect(result.owner).toBe(null)
      expect(result.engine).toBe('finance')
      expect(result.effort).toBe(null)
      expect(result.due_date).toBe('2026-03-01')
      expect(result.source).toBe(null)
    })
  })
})
