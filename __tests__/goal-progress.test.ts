// Test progress calculation logic (extracted for testing)

function calcProgress(current?: number | null, target?: number | null): number | null {
  if (!current || !target || target === 0) return null
  return Math.min(100, Math.round((current / target) * 100))
}

function getStatusColor(pct: number | null): string {
  if (pct === null) return 'bg-gray-200 dark:bg-gray-700'
  if (pct >= 70) return 'bg-green-500'
  if (pct >= 40) return 'bg-yellow-500'
  return 'bg-red-500'
}

// Mock localStorage for persistence tests
const mockStorage: Record<string, string> = {}
const localStorageMock = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, value: string) => { mockStorage[key] = value },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]) }
}

describe('GoalProgress calculations', () => {
  describe('calcProgress', () => {
    it('returns percentage for valid values', () => {
      expect(calcProgress(50, 100)).toBe(50)
      expect(calcProgress(850000, 2000000)).toBe(43) // Demo data case
    })

    it('returns null for missing current', () => {
      expect(calcProgress(null, 100)).toBeNull()
      expect(calcProgress(undefined, 100)).toBeNull()
    })

    it('returns null for missing target', () => {
      expect(calcProgress(50, null)).toBeNull()
      expect(calcProgress(50, undefined)).toBeNull()
    })

    it('returns null for zero target', () => {
      expect(calcProgress(50, 0)).toBeNull()
    })

    it('caps at 100%', () => {
      expect(calcProgress(150, 100)).toBe(100)
    })
  })

  describe('getStatusColor', () => {
    it('returns green for >= 70%', () => {
      expect(getStatusColor(70)).toBe('bg-green-500')
      expect(getStatusColor(100)).toBe('bg-green-500')
    })

    it('returns yellow for 40-69%', () => {
      expect(getStatusColor(40)).toBe('bg-yellow-500')
      expect(getStatusColor(69)).toBe('bg-yellow-500')
    })

    it('returns red for < 40%', () => {
      expect(getStatusColor(39)).toBe('bg-red-500')
      expect(getStatusColor(0)).toBe('bg-red-500')
    })

    it('returns gray for null', () => {
      expect(getStatusColor(null)).toBe('bg-gray-200 dark:bg-gray-700')
    })
  })

  describe('progress recalculation', () => {
    it('recalculates percentage after current value update', () => {
      // Simulate updating current from 50 to 75 with target 100
      expect(calcProgress(50, 100)).toBe(50)
      expect(calcProgress(75, 100)).toBe(75)
    })
  })
})
