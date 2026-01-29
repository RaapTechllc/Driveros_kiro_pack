/**
 * Parked Ideas Tests
 * 
 * Tests the parked ideas data layer functionality
 */

import { getParkedIdeas, createParkedIdea, deleteParkedIdea } from '@/lib/data/parked-ideas'

// Mock localStorage for testing
const mockStorage: { [key: string]: string } = {}
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: (key: string) => mockStorage[key] || null,
    setItem: (key: string, value: string) => {
      mockStorage[key] = value
    },
    removeItem: (key: string) => {
      delete mockStorage[key]
    },
    clear: () => {
      Object.keys(mockStorage).forEach(key => delete mockStorage[key])
    }
  }
})

describe('Parked Ideas Data Layer', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
  })

  it('should return empty array when no parked ideas exist', async () => {
    const ideas = await getParkedIdeas('test-org')
    expect(ideas).toEqual([])
  })

  it('should create and retrieve parked ideas', async () => {
    const newIdea = {
      title: 'Test Idea',
      description: 'Test description',
      reason: 'Test reason'
    }

    const created = await createParkedIdea(newIdea, 'test-org', 'test-user')
    expect(created.title).toBe(newIdea.title)
    expect(created.description).toBe(newIdea.description)
    expect(created.reason).toBe(newIdea.reason)
    expect(created.org_id).toBe('test-org')
    expect(created.created_by).toBe('test-user')

    const ideas = await getParkedIdeas('test-org')
    expect(ideas).toHaveLength(1)
    expect(ideas[0].title).toBe(newIdea.title)
  })

  it('should delete parked ideas', async () => {
    const newIdea = {
      title: 'Test Idea to Delete',
      description: 'Will be deleted',
      reason: 'Testing deletion'
    }

    const created = await createParkedIdea(newIdea, 'test-org', 'test-user')
    let ideas = await getParkedIdeas('test-org')
    expect(ideas).toHaveLength(1)

    await deleteParkedIdea(created.id)
    ideas = await getParkedIdeas('test-org')
    expect(ideas).toHaveLength(0)
  })

  it('should handle multiple parked ideas', async () => {
    const idea1 = { title: 'Idea 1', description: 'Desc 1', reason: 'Reason 1' }
    const idea2 = { title: 'Idea 2', description: 'Desc 2', reason: 'Reason 2' }

    await createParkedIdea(idea1, 'test-org', 'test-user')
    await createParkedIdea(idea2, 'test-org', 'test-user')

    const ideas = await getParkedIdeas('test-org')
    expect(ideas).toHaveLength(2)
    
    // Should be ordered by created_at descending (newest first)
    expect(ideas[0].title).toBe('Idea 2')
    expect(ideas[1].title).toBe('Idea 1')
  })
})