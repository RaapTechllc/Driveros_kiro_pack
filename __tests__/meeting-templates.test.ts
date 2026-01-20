import { meetingTemplates, generateMeetingActions } from '../lib/meeting-templates'
import { MeetingFormData } from '../lib/types'

// Mock storage module
jest.mock('../lib/storage', () => ({
  safeGetItem: jest.fn(() => ({ success: false, data: null })),
  safeSetItem: jest.fn(() => ({ success: true })),
  safeRemoveItem: jest.fn(() => ({ success: true })),
}))

describe('Meeting Templates', () => {
  test('should have all three meeting templates', () => {
    expect(meetingTemplates.warm_up).toBeDefined()
    expect(meetingTemplates.pit_stop).toBeDefined()
    expect(meetingTemplates.full_tune_up).toBeDefined()
  })

  test('warm-up template should have correct structure', () => {
    const template = meetingTemplates.warm_up
    expect(template.type).toBe('warm_up')
    expect(template.title).toBe('Daily Warm-Up')
    expect(template.duration_min).toBe(10)
    expect(template.agenda).toHaveLength(3)
    expect(template.inputs).toHaveLength(3)
    expect(template.outputs).toHaveLength(2)
  })

  test('pit-stop template should have correct structure', () => {
    const template = meetingTemplates.pit_stop
    expect(template.type).toBe('pit_stop')
    expect(template.title).toBe('Weekly Pit Stop')
    expect(template.duration_min).toBe(30)
    expect(template.agenda).toHaveLength(3)
    expect(template.inputs).toHaveLength(2)
    expect(template.outputs).toHaveLength(3)
  })

  test('full-tune-up template should have correct structure', () => {
    const template = meetingTemplates.full_tune_up
    expect(template.type).toBe('full_tune_up')
    expect(template.title).toBe('Full Tune-Up')
    expect(template.duration_min).toBe(75)
    expect(template.agenda).toHaveLength(4)
    expect(template.inputs).toHaveLength(2)
    expect(template.outputs).toHaveLength(3)
  })

  describe('generateMeetingActions', () => {
    test('should generate warm-up action when brake and focus provided', () => {
      const formData: MeetingFormData = {
        top_brake: 'Slow approvals',
        today_focus: 'Close 3 deals'
      }
      
      const actions = generateMeetingActions('warm_up', formData)
      expect(actions).toHaveLength(1)
      expect(actions[0].title).toContain('Slow approvals')
      expect(actions[0].why).toContain('Close 3 deals')
      expect(actions[0].eta_days).toBe(1)
      expect(actions[0].owner_role).toBe('Owner')
    })

    test('should generate pit-stop actions for missed target', () => {
      const formData: MeetingFormData = {
        accelerator_result: 'miss'
      }
      
      const actions = generateMeetingActions('pit_stop', formData)
      expect(actions).toHaveLength(3)
      expect(actions[0].title).toContain('Analyze')
      expect(actions[1].title).toContain('Adjust')
      expect(actions[2].title).toContain('recovery')
    })

    test('should generate pit-stop actions for successful target', () => {
      const formData: MeetingFormData = {
        accelerator_result: 'win'
      }
      
      const actions = generateMeetingActions('pit_stop', formData)
      expect(actions).toHaveLength(2)
      expect(actions[0].title).toContain('Maintain')
      expect(actions[1].title).toContain('Scale')
    })

    test('should generate full-tune-up actions', () => {
      const formData: MeetingFormData = {}
      
      const actions = generateMeetingActions('full_tune_up', formData)
      expect(actions).toHaveLength(3)
      expect(actions[0].title).toContain('North Star')
      expect(actions[1].title).toContain('department goals')
      expect(actions[2].title).toContain('risk controls')
    })

    test('should assign appropriate owners and engines', () => {
      const formData: MeetingFormData = {
        accelerator_result: 'miss'
      }
      
      const actions = generateMeetingActions('pit_stop', formData)
      expect(actions[0].owner_role).toBe('Owner')
      expect(actions[0].engine).toBe('Leadership')
      expect(actions[1].owner_role).toBe('Ops')
      expect(actions[1].engine).toBe('Operations')
    })
  })
})
