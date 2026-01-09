import { enableDemoMode, exitDemoMode, isDemoMode, loadDemoData } from '../lib/demo-mode'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock as any

describe('Demo Mode', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('enableDemoMode', () => {
    it('should set demo mode flag in localStorage', () => {
      enableDemoMode()
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('demo-mode', 'true')
      expect(localStorageMock.setItem).toHaveBeenCalledWith('demo-timestamp', expect.any(String))
    })
  })

  describe('exitDemoMode', () => {
    it('should remove demo mode data from localStorage', () => {
      exitDemoMode()
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('demo-mode')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('demo-timestamp')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('demo-flash-result')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('demo-full-audit-result')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('demo-imported-actions')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('demo-imported-goals')
    })
  })

  describe('isDemoMode', () => {
    it('should return true when demo mode is active', () => {
      localStorageMock.getItem.mockReturnValue('true')
      
      expect(isDemoMode()).toBe(true)
      expect(localStorageMock.getItem).toHaveBeenCalledWith('demo-mode')
    })

    it('should return false when demo mode is not active', () => {
      localStorageMock.getItem.mockReturnValue(null)
      
      expect(isDemoMode()).toBe(false)
    })
  })

  describe('loadDemoData', () => {
    it('should not load data when not in demo mode', () => {
      localStorageMock.getItem.mockReturnValue(null)
      
      loadDemoData()
      
      // Should not set any demo data
      expect(localStorageMock.setItem).not.toHaveBeenCalled()
    })

    it('should load demo data when in demo mode', () => {
      localStorageMock.getItem.mockReturnValue('true')
      
      loadDemoData()
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('demo-flash-result', expect.any(String))
      expect(localStorageMock.setItem).toHaveBeenCalledWith('demo-full-audit-result', expect.any(String))
      expect(localStorageMock.setItem).toHaveBeenCalledWith('demo-imported-actions', expect.any(String))
      expect(localStorageMock.setItem).toHaveBeenCalledWith('demo-imported-goals', expect.any(String))
    })
  })
})
