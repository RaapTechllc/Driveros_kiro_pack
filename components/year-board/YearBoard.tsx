'use client'

import { useState } from 'react'
import { QuarterColumn } from './QuarterColumn'
import { AddCardModal } from './AddCardModal'
import { downloadYearBoardCSV } from '@/lib/year-board-csv'
import { Button } from '@/components/ui/Button'
import { Plus, Download } from 'lucide-react'

interface YearBoardProps {
  onPlanChange: () => void
}

export function YearBoard({ onPlanChange }: YearBoardProps) {
  const [refreshKey, setRefreshKey] = useState(0)
  const [showAddModal, setShowAddModal] = useState(false)

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

  const handleCardMove = () => {
    // Force all columns to refresh by changing the key
    setRefreshKey(prev => prev + 1)
    onPlanChange()
  }

  const handleAddCard = () => {
    handleCardMove()
    setShowAddModal(false)
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
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button
            size="sm"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Add Card Modal */}
      <AddCardModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddCard}
      />

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
                  key={`${department.id}-${quarter}-${refreshKey}`}
                  quarter={quarter}
                  department={department.id as any}
                  onCardMove={handleCardMove}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
