/**
 * Test for check-ins data layer
 */

import { getTodayCheckIn, createCheckIn, updateCheckIn } from '../../../lib/data/check-ins'

describe('Check-ins Data Layer', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    // Set demo mode
    process.env.NEXT_PUBLIC_DEMO_MODE = 'true'
  })

  it('should return null when no check-in exists for today', async () => {
    const checkIn = await getTodayCheckIn('demo-org', 'demo-user')
    expect(checkIn).toBeNull()
  })

  it('should create a new check-in', async () => {
    const today = new Date().toISOString().split('T')[0]
    const checkInData = {
      org_id: 'demo-org',
      user_id: 'demo-user',
      date: today,
      actions_completed: true,
      blocker: null,
      win_or_lesson: 'Completed all tasks on time',
      action_updates: { task1: 'done', task2: 'in_progress' },
    }

    const checkIn = await createCheckIn(checkInData)
    
    expect(checkIn.id).toBeDefined()
    expect(checkIn.date).toBe(today)
    expect(checkIn.actions_completed).toBe(true)
    expect(checkIn.win_or_lesson).toBe('Completed all tasks on time')
  })

  it('should get today\'s check-in after creating it', async () => {
    const today = new Date().toISOString().split('T')[0]
    const checkInData = {
      org_id: 'demo-org',
      user_id: 'demo-user',
      date: today,
      actions_completed: false,
      blocker: 'Waiting for client approval',
      win_or_lesson: null,
      action_updates: null,
    }

    await createCheckIn(checkInData)
    const retrieved = await getTodayCheckIn('demo-org', 'demo-user')
    
    expect(retrieved).not.toBeNull()
    expect(retrieved?.date).toBe(today)
    expect(retrieved?.actions_completed).toBe(false)
    expect(retrieved?.blocker).toBe('Waiting for client approval')
  })

  it('should update an existing check-in', async () => {
    const today = new Date().toISOString().split('T')[0]
    const checkInData = {
      org_id: 'demo-org',
      user_id: 'demo-user',
      date: today,
      actions_completed: false,
      blocker: 'Initial blocker',
      win_or_lesson: null,
      action_updates: null,
    }

    const created = await createCheckIn(checkInData)
    const updated = await updateCheckIn(created.id, {
      actions_completed: true,
      blocker: null,
      win_or_lesson: 'Resolved the blocker successfully',
    })

    expect(updated.actions_completed).toBe(true)
    expect(updated.blocker).toBeNull()
    expect(updated.win_or_lesson).toBe('Resolved the blocker successfully')
  })
})