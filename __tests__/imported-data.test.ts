import { loadImportedActions, loadImportedGoals, transformImportedActions, transformImportedGoals } from '../lib/imported-data'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock as any

// Mock demo-mode module
jest.mock('../lib/demo-mode', () => ({
  isDemoMode: jest.fn(() => false)
}))

describe('Imported Data', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('loadImportedActions', () => {
    it('should return empty array when no data exists', () => {
      localStorageMock.getItem.mockReturnValue(null)
      
      const result = loadImportedActions()
      
      expect(result).toEqual([])
      expect(localStorageMock.getItem).toHaveBeenCalledWith('imported-actions')
    })

    it('should parse and return imported actions', () => {
      const mockActions = [
        {
          id: '1',
          title: 'Test Action',
          why: 'Test reason',
          owner_role: 'Owner',
          engine: 'Leadership',
          eta_days: 7,
          status: 'todo',
          created_at: '2026-01-07T00:00:00.000Z'
        }
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockActions))
      
      const result = loadImportedActions()
      
      expect(result).toEqual(mockActions)
    })

    it('should handle corrupted localStorage gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid json')
      
      const result = loadImportedActions()
      
      expect(result).toEqual([])
    })
  })

  describe('loadImportedGoals', () => {
    it('should return empty array when no data exists', () => {
      localStorageMock.getItem.mockReturnValue(null)
      
      const result = loadImportedGoals()
      
      expect(result).toEqual([])
      expect(localStorageMock.getItem).toHaveBeenCalledWith('imported-goals')
    })

    it('should parse and return imported goals', () => {
      const mockGoals = [
        {
          id: '1',
          level: 'north_star',
          title: 'Test Goal',
          metric: 'Revenue',
          current: 100000,
          target: 200000,
          created_at: '2026-01-07T00:00:00.000Z'
        }
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockGoals))
      
      const result = loadImportedGoals()
      
      expect(result).toEqual(mockGoals)
    })
  })

  describe('transformImportedActions', () => {
    it('should add source field to imported actions', () => {
      const mockActions = [
        {
          id: '1',
          title: 'Test Action',
          why: 'Test reason',
          owner_role: 'Owner' as const,
          engine: 'Leadership',
          eta_days: 7,
          status: 'todo' as const,
          created_at: '2026-01-07T00:00:00.000Z'
        }
      ]
      
      const result = transformImportedActions(mockActions)
      
      expect(result).toEqual([
        {
          ...mockActions[0],
          source: 'imported'
        }
      ])
    })
  })

  describe('transformImportedGoals', () => {
    it('should separate north star and department goals', () => {
      const mockGoals = [
        {
          id: '1',
          level: 'north_star' as const,
          title: 'North Star Goal',
          created_at: '2026-01-07T00:00:00.000Z'
        },
        {
          id: '2',
          level: 'department' as const,
          department: 'Ops',
          title: 'Department Goal',
          created_at: '2026-01-07T00:00:00.000Z'
        }
      ]
      
      const result = transformImportedGoals(mockGoals)
      
      expect(result.northStar).toEqual(mockGoals[0])
      expect(result.departments).toEqual([mockGoals[1]])
    })

    it('should handle missing north star goal', () => {
      const mockGoals = [
        {
          id: '1',
          level: 'department' as const,
          department: 'Ops',
          title: 'Department Goal',
          created_at: '2026-01-07T00:00:00.000Z'
        }
      ]
      
      const result = transformImportedGoals(mockGoals)
      
      expect(result.northStar).toBeUndefined()
      expect(result.departments).toEqual(mockGoals)
    })
  })
})
