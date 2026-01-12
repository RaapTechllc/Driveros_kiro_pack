import { enableDemoMode, exitDemoMode, isDemoMode, loadDemoData } from '../lib/demo-mode'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

// Set up window and localStorage before importing modules
Object.defineProperty(global, 'window', {
  value: { localStorage: localStorageMock },
  writable: true
})
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true
})

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
    it('should load demo data into localStorage', () => {
      loadDemoData()
      
      // Should set demo data keys
      expect(localStorageMock.setItem).toHaveBeenCalledWith('demo-full-audit-result', expect.any(String))
      expect(localStorageMock.setItem).toHaveBeenCalledWith('full-audit-result', expect.any(String))
      expect(localStorageMock.setItem).toHaveBeenCalledWith('demo-imported-actions', expect.any(String))
      expect(localStorageMock.setItem).toHaveBeenCalledWith('demo-imported-goals', expect.any(String))
    })
  })
})
