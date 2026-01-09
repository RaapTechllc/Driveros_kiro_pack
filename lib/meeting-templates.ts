import { MeetingTemplate, MeetingFormData, QuickWin } from './types'

export const meetingTemplates: Record<string, MeetingTemplate> = {
  warm_up: {
    type: 'warm_up',
    title: 'Daily Warm-Up',
    duration_min: 10,
    description: 'Quick daily check-in to maintain momentum on your weekly Accelerator',
    agenda: [
      'What is the Accelerator for the week?',
      'What blocks it today?',
      'What is the one fix?'
    ],
    inputs: [
      'Yesterday result (1 line)',
      'Today focus (1 line)', 
      'Top brake (1 line)'
    ],
    outputs: [
      '1 action (owner + eta)',
      'Updated Accelerator confidence (if needed)'
    ]
  },
  
  pit_stop: {
    type: 'pit_stop',
    title: 'Weekly Pit Stop',
    duration_min: 30,
    description: 'Weekly review to assess Accelerator progress and set next actions',
    agenda: [
      'Accelerator: win or miss? Why?',
      'Top 1 engine gap (pick the lowest engine)',
      'Set 3 actions with owners and due dates'
    ],
    inputs: [
      'Accelerator result (actual vs target)',
      'Engine status summary (red/yellow/green)'
    ],
    outputs: [
      '3 actions (do now)',
      '3 actions (do next)',
      'Owner assignments'
    ]
  },
  
  full_tune_up: {
    type: 'full_tune_up',
    title: 'Full Tune-Up',
    duration_min: 75,
    description: 'Monthly/quarterly strategic review to realign goals and refresh strategy',
    agenda: [
      'North Star still right?',
      'Accelerator still the right lever?',
      'Re-align department goals',
      'Reset the next 4 weeks'
    ],
    inputs: [
      'Trend view (4–12 weeks)',
      'Goal alignment check (North Star -> dept goals)'
    ],
    outputs: [
      'Updated targets',
      'Updated goal tree (max 3 departments)',
      'Refreshed controls for brakes'
    ]
  }
}

export function generateMeetingActions(
  meetingType: 'warm_up' | 'pit_stop' | 'full_tune_up',
  formData: MeetingFormData,
  acceleratorKPI?: string
): QuickWin[] {
  const actions: QuickWin[] = []
  
  switch (meetingType) {
    case 'warm_up':
      if (formData.top_brake && formData.today_focus) {
        actions.push({
          title: `Address: ${formData.top_brake}`,
          why: `Blocking today's focus: ${formData.today_focus}`,
          owner_role: 'Owner',
          eta_days: 1,
          engine: 'Operations'
        })
      }
      break
      
    case 'pit_stop':
      if (formData.accelerator_result === 'miss') {
        actions.push(
          {
            title: 'Analyze Accelerator gap',
            why: 'Weekly target missed, need root cause analysis',
            owner_role: 'Owner',
            eta_days: 2,
            engine: 'Leadership'
          },
          {
            title: 'Adjust weekly process',
            why: 'Current approach not delivering results',
            owner_role: 'Ops',
            eta_days: 3,
            engine: 'Operations'
          },
          {
            title: 'Set recovery target',
            why: 'Get back on track for monthly goal',
            owner_role: 'Owner',
            eta_days: 1,
            engine: 'Leadership'
          }
        )
      } else {
        actions.push(
          {
            title: 'Maintain current momentum',
            why: 'Weekly target achieved, keep process consistent',
            owner_role: 'Ops',
            eta_days: 7,
            engine: 'Operations'
          },
          {
            title: 'Scale successful approach',
            why: 'Winning process can be optimized further',
            owner_role: 'Owner',
            eta_days: 5,
            engine: 'Leadership'
          }
        )
      }
      break
      
    case 'full_tune_up':
      actions.push(
        {
          title: 'Update North Star metrics',
          why: 'Quarterly review requires metric refresh',
          owner_role: 'Owner',
          eta_days: 7,
          engine: 'Leadership'
        },
        {
          title: 'Realign department goals',
          why: 'Ensure all departments support updated North Star',
          owner_role: 'Owner',
          eta_days: 14,
          engine: 'Leadership'
        },
        {
          title: 'Refresh risk controls',
          why: 'Business environment changes require updated brakes',
          owner_role: 'Finance',
          eta_days: 10,
          engine: 'Finance'
        }
      )
      break
  }
  
  return actions
}

export function saveMeetingNotes(
  meetingType: 'warm_up' | 'pit_stop' | 'full_tune_up',
  notes: string,
  decisions: string[],
  actions: QuickWin[]
) {
  const meeting = {
    id: `meeting_${Date.now()}`,
    company_id: 'demo_company',
    type: meetingType,
    scheduled_for: new Date().toISOString(),
    notes,
    decisions,
    action_ids: actions.map(a => `action_${Date.now()}_${Math.random()}`),
    created_at: new Date().toISOString()
  }
  
  // Save to localStorage for demo
  const existingMeetings = JSON.parse(localStorage.getItem('meetings') || '[]')
  existingMeetings.push(meeting)
  localStorage.setItem('meetings', JSON.stringify(existingMeetings))
  
  // Save actions to existing actions list
  const existingActions = JSON.parse(localStorage.getItem('meeting-actions') || '[]')
  const actionsWithMeetingId = actions.map(action => ({
    ...action,
    meeting_id: meeting.id,
    created_at: new Date().toISOString()
  }))
  existingActions.push(...actionsWithMeetingId)
  localStorage.setItem('meeting-actions', JSON.stringify(existingActions))
  
  return meeting
}
