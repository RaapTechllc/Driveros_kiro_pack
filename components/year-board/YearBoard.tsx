import { QuarterColumn } from './QuarterColumn'
import { downloadYearBoardCSV } from '@/lib/year-board-csv'

interface YearBoardProps {
  onPlanChange: () => void
}

export function YearBoard({ onPlanChange }: YearBoardProps) {
  const quarters = [1, 2, 3, 4] as const
  const departments = [
    { id: 'company', name: 'Company' },
    { id: 'ops', name: 'Ops' },
    { id: 'sales_marketing', name: 'Sales/Marketing' },
    { id: 'finance', name: 'Finance' }
  ] as const

  const handleExportCSV = () => {
    downloadYearBoardCSV()
  }

  const handleAddItem = () => {
    // TODO: Implement in Slice 4
    console.log('Add item clicked')
  }

  return (
    <div className="space-y-6">
      {/* Board Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">2026 Year Plan</h2>
          <p className="text-sm text-muted-foreground">
            Drag cards between quarters and departments to organize your year
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleExportCSV}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Export CSV
          </button>
          <button 
            onClick={handleAddItem}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Add Item
          </button>
        </div>
      </div>

      {/* Year Board Grid */}
      <div className="bg-card border rounded-lg p-4">
        {/* Quarter Headers */}
        <div className="grid grid-cols-5 gap-4 mb-4">
          <div></div> {/* Empty cell for department labels */}
          {quarters.map(quarter => (
            <div key={quarter} className="text-center font-semibold p-2 bg-secondary rounded">
              Q{quarter}
            </div>
          ))}
        </div>

        {/* Department Rows */}
        <div className="space-y-4">
          {departments.map(department => (
            <div key={department.id} className="grid grid-cols-5 gap-4 items-start">
              {/* Department Label */}
              <div className="font-medium p-2 text-right">
                {department.name}
              </div>
              
              {/* Quarter Columns */}
              {quarters.map(quarter => (
                <QuarterColumn
                  key={`${department.id}-${quarter}`}
                  quarter={quarter}
                  department={department.id as any}
                  onCardMove={onPlanChange}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
