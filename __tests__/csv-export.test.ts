import { exportActions, exportGoals, exportMeetingTemplates, exportCombinedData, exportExcelReady } from '../lib/csv-export'
import { FullAuditResult } from '../lib/full-audit-analysis'
import { FlashScanResult } from '../lib/types'

// Mock imported data module
jest.mock('../lib/imported-data', () => ({
  loadImportedActions: jest.fn(() => [
    {
      id: 'imported-1',
      title: 'Imported Action',
      why: 'Imported reason',
      owner_role: 'Owner',
      engine: 'Leadership',
      eta_days: 5,
      status: 'todo',
      due_date: '2026-01-15'
    }
  ]),
  loadImportedGoals: jest.fn(() => [
    {
      id: 'imported-goal-1',
      level: 'north_star',
      title: 'Imported North Star',
      metric: 'Revenue',
      current: 100000,
      target: 200000
    }
  ])
}))

describe('CSV Export', () => {
  const mockAuditResult: FullAuditResult = {
    schema_version: '1.0',
    status: 'ok',
    mode: 'audit',
    completion_score: 1.0,
    company: { industry: 'Tech', role: 'Owner', size_band: '11-50' },
    gear: { number: 3, label: 'Drive', reason: 'Test reason' },
    engines: [],
    accelerator: { kpi: 'Weekly Active Users', cadence: 'weekly', recommended: true, user_override_allowed: true, notes: 'Test notes' },
    brakes: { risk_level: 'low', flags: [], controls: [] },
    goals: {
      north_star: { title: 'Test North Star', metric: 'Revenue', current: null, target: null, due_date: null },
      departments: [
        { department: 'Ops', title: 'Ops Goal', metric: 'Efficiency', current: null, target: null, due_date: null, alignment_statement: 'Supports north star' }
      ]
    },
    actions: {
      do_now: [
        { title: 'Action 1', why: 'Reason 1', owner_role: 'Owner', eta_days: 3, engine: 'Leadership' }
      ],
      do_next: [
        { title: 'Action 2', why: 'Reason 2', owner_role: 'Ops', eta_days: 7, engine: 'Operations' }
      ]
    },
    meetings: {
      warm_up: { duration_min: 10, agenda: [] },
      pit_stop: { duration_min: 30, agenda: [] },
      full_tune_up: { duration_min: 75, agenda: [] }
    },
    exports: { actions_csv_ready: true, goals_csv_ready: true }
  }

  const mockFlashResult: FlashScanResult = {
    schema_version: '1.0',
    confidence_score: 0.85,
    accelerator: { kpi: 'Weekly Active Users', cadence: 'weekly', recommended: true, notes: 'Test notes' },
    quick_wins: [
      { title: 'Quick Win 1', why: 'Quick reason', owner_role: 'Owner', eta_days: 1, engine: 'Leadership' }
    ],
    gear_estimate: { number: 2, label: 'Grip', reason: 'Test reason' }
  }

  describe('exportActions', () => {
    it('should export actions with headers', () => {
      const result = exportActions(mockAuditResult)
      
      expect(result).toContain('title,why,owner_role,engine,eta_days,status,due_date,source')
      expect(result).toContain('"Action 1","Reason 1",Owner,"Leadership",3,todo,,generated')
      expect(result).toContain('"Action 2","Reason 2",Ops,"Operations",7,todo,,generated')
      expect(result).toContain('"Imported Action","Imported reason",Owner,"Leadership",5,todo,2026-01-15,imported')
    })

    it('should export flash scan quick wins', () => {
      const result = exportActions(undefined, mockFlashResult)
      
      expect(result).toContain('"Quick Win 1","Quick reason",Owner,"Leadership",1,todo,,generated')
    })

    it('should handle empty data', () => {
      const result = exportActions()
      
      expect(result).toContain('title,why,owner_role,engine,eta_days,status,due_date,source')
      expect(result).toContain('"Imported Action"') // Should still include imported data
    })
  })

  describe('exportGoals', () => {
    it('should export goals with headers', () => {
      const result = exportGoals(mockAuditResult)
      
      expect(result).toContain('level,department,title,metric,current,target,due_date,alignment_statement,source')
      expect(result).toContain('north_star,,"Test North Star","Revenue",,,,,generated')
      expect(result).toContain('department,Ops,"Ops Goal","Efficiency",,,,"Supports north star",generated')
      expect(result).toContain('north_star,,"Imported North Star","Revenue",100000,200000,,"",imported')
    })

    it('should handle empty audit result', () => {
      const result = exportGoals()
      
      expect(result).toContain('level,department,title,metric,current,target,due_date,alignment_statement,source')
      expect(result).toContain('"Imported North Star"') // Should still include imported data
    })
  })

  describe('exportMeetingTemplates', () => {
    it('should export meeting templates with agenda items', () => {
      const result = exportMeetingTemplates()
      
      expect(result).toContain('type,title,duration_min,agenda_item,description')
      expect(result).toContain('warm_up,"Daily Warm-Up",10')
      expect(result).toContain('pit_stop,"Weekly Pit Stop",30')
      expect(result).toContain('full_tune_up,"Monthly Full Tune-Up",75')
    })
  })

  describe('exportCombinedData', () => {
    it('should export all data sections', () => {
      const result = exportCombinedData(mockAuditResult, mockFlashResult)
      
      expect(result).toContain('# DriverOS Complete Export')
      expect(result).toContain('# GOALS')
      expect(result).toContain('# ACTIONS')
      expect(result).toContain('# MEETING TEMPLATES')
      expect(result).toContain('Schema Version: 1.0')
    })
  })

  describe('exportExcelReady', () => {
    it('should export Excel-ready format with examples and descriptions', () => {
      const result = exportExcelReady(mockAuditResult, mockFlashResult)
      
      expect(result).toContain('DriverOS Export - Excel Ready Format')
      expect(result).toContain('ACTIONS SHEET')
      expect(result).toContain('GOALS SHEET')
      expect(result).toContain('FIELD DESCRIPTIONS')
      expect(result).toContain('Example: Weekly team standup')
      expect(result).toContain('- title: Brief description of the action (required)')
    })
  })
})
