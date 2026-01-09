import { 
  validateActionsCSVSync as validateActionsCSV, 
  validateGoalsCSVSync as validateGoalsCSV, 
  parseCSV, 
  generateTemplateCSV 
} from '../lib/csv-import'

describe('CSV Import', () => {
  describe('parseCSV', () => {
    test('should parse simple CSV', () => {
      const csv = 'name,age,city\nJohn,30,NYC\nJane,25,LA'
      const result = parseCSV(csv)
      
      expect(result).toEqual([
        ['name', 'age', 'city'],
        ['John', '30', 'NYC'],
        ['Jane', '25', 'LA']
      ])
    })

    test('should handle quoted fields with commas', () => {
      const csv = 'title,description\n"Task 1","This is a task, with comma"\n"Task 2","Simple task"'
      const result = parseCSV(csv)
      
      expect(result).toEqual([
        ['title', 'description'],
        ['Task 1', 'This is a task, with comma'],
        ['Task 2', 'Simple task']
      ])
    })
  })

  describe('validateActionsCSV', () => {
    const validActionsCSV = `title,why,owner_role,engine,eta_days,status,due_date
"Set weekly meeting","Improve team communication",Owner,Leadership,7,todo,2026-01-15
"Review finances","Understand cash flow",Finance,Finance,3,doing,`

    test('should validate correct actions CSV', () => {
      const result = validateActionsCSV(validActionsCSV)
      
      expect(result.success).toBe(true)
      expect(result.validRows).toBe(2)
      expect(result.errors).toHaveLength(0)
      expect(result.data).toHaveLength(2)
      expect(result.data![0].title).toBe('Set weekly meeting')
      expect(result.data![0].eta_days).toBe(7)
    })

    test('should reject CSV with missing headers', () => {
      const invalidCSV = 'title,why,owner_role\n"Task","Reason",Owner'
      const result = validateActionsCSV(invalidCSV)
      
      expect(result.success).toBe(false)
      expect(result.errors.some(e => e.message.includes('Missing required header: engine'))).toBe(true)
    })

    test('should validate owner_role values', () => {
      const invalidCSV = `title,why,owner_role,engine,eta_days,status
"Task","Reason",InvalidRole,Leadership,7,todo`
      const result = validateActionsCSV(invalidCSV)
      
      expect(result.success).toBe(false)
      expect(result.errors.some(e => e.message.includes('Invalid owner_role'))).toBe(true)
    })

    test('should validate engine values', () => {
      const invalidCSV = `title,why,owner_role,engine,eta_days,status
"Task","Reason",Owner,InvalidEngine,7,todo`
      const result = validateActionsCSV(invalidCSV)
      
      expect(result.success).toBe(false)
      expect(result.errors.some(e => e.message.includes('Invalid engine'))).toBe(true)
    })

    test('should validate eta_days as number', () => {
      const invalidCSV = `title,why,owner_role,engine,eta_days,status
"Task","Reason",Owner,Leadership,invalid,todo`
      const result = validateActionsCSV(invalidCSV)
      
      expect(result.success).toBe(false)
      expect(result.errors.some(e => e.message.includes('eta_days must be a number'))).toBe(true)
    })

    test('should validate date format', () => {
      const invalidCSV = `title,why,owner_role,engine,eta_days,status,due_date
"Task","Reason",Owner,Leadership,7,todo,invalid-date`
      const result = validateActionsCSV(invalidCSV)
      
      expect(result.success).toBe(false)
      expect(result.errors.some(e => e.message.includes('due_date must be in YYYY-MM-DD format'))).toBe(true)
    })

    test('should default eta_days to 7 if missing', () => {
      const csvWithMissingEta = `title,why,owner_role,engine,eta_days,status
"Task","Reason",Owner,Leadership,,todo`
      const result = validateActionsCSV(csvWithMissingEta)
      
      expect(result.success).toBe(true)
      expect(result.data![0].eta_days).toBe(7)
    })
  })

  describe('validateGoalsCSV', () => {
    const validGoalsCSV = `level,department,title,metric,current,target,due_date,alignment_statement
north_star,,"Reach $2M ARR","Monthly Revenue",150000,166667,2026-12-31,
department,Ops,"Reduce response time","Hours",8,2,2026-06-30,"Faster support improves retention"`

    test('should validate correct goals CSV', () => {
      const result = validateGoalsCSV(validGoalsCSV)
      
      expect(result.success).toBe(true)
      expect(result.validRows).toBe(2)
      expect(result.errors).toHaveLength(0)
      expect(result.data).toHaveLength(2)
      expect(result.data![0].level).toBe('north_star')
      expect(result.data![1].level).toBe('department')
    })

    test('should require exactly one north_star goal', () => {
      const invalidCSV = `level,title
department,"Goal 1"
department,"Goal 2"`
      const result = validateGoalsCSV(invalidCSV)
      
      expect(result.success).toBe(false)
      expect(result.errors.some(e => e.message.includes('Must have exactly 1 north_star goal'))).toBe(true)
    })

    test('should limit department goals to 3', () => {
      const invalidCSV = `level,title,alignment_statement
north_star,"North Star",
department,"Goal 1","Alignment 1"
department,"Goal 2","Alignment 2"
department,"Goal 3","Alignment 3"
department,"Goal 4","Alignment 4"`
      const result = validateGoalsCSV(invalidCSV)
      
      expect(result.success).toBe(false)
      expect(result.errors.some(e => e.message.includes('Maximum 3 department goals allowed'))).toBe(true)
    })

    test('should require alignment_statement for department goals', () => {
      const invalidCSV = `level,title,alignment_statement
north_star,"North Star",
department,"Goal 1",`
      const result = validateGoalsCSV(invalidCSV)
      
      expect(result.success).toBe(false)
      expect(result.errors.some(e => e.message.includes('alignment_statement is required for department goals'))).toBe(true)
    })

    test('should validate numeric fields', () => {
      const invalidCSV = `level,title,current,target
north_star,"North Star",invalid,also-invalid`
      const result = validateGoalsCSV(invalidCSV)
      
      expect(result.success).toBe(false)
      expect(result.errors.some(e => e.message.includes('current must be a number'))).toBe(true)
      expect(result.errors.some(e => e.message.includes('target must be a number'))).toBe(true)
    })
  })

  describe('generateTemplateCSV', () => {
    test('should generate actions template', () => {
      const template = generateTemplateCSV('actions')
      
      expect(template).toContain('title,why,owner_role,engine,eta_days,status,due_date')
      expect(template).toContain('Owner')
      expect(template).toContain('Leadership')
      expect(template).toContain('todo')
    })

    test('should generate goals template', () => {
      const template = generateTemplateCSV('goals')
      
      expect(template).toContain('level,department,title,metric,current,target,due_date,alignment_statement')
      expect(template).toContain('north_star')
      expect(template).toContain('department')
      expect(template).toContain('alignment')
    })
  })
})
