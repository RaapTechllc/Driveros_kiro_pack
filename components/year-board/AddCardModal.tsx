'use client'

import { useState } from 'react'
import { YearItem } from '@/lib/year-board-types'
import { addYearItem, loadYearPlan, createYearItem } from '@/lib/year-board-storage'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useFocusTrap } from '@/lib/hooks/useFocusTrap'

interface AddCardModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: () => void
}

const MODAL_TITLE_ID = 'add-card-modal-title'

export function AddCardModal({ isOpen, onClose, onAdd }: AddCardModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    rationale: '',
    type: 'play' as YearItem['type'],
    department: 'company' as YearItem['department'],
    quarter: 1 as YearItem['quarter'],
    status: 'planned' as YearItem['status'],
    alignment_status: 'linked' as YearItem['alignment_status']
  })

  const focusTrapRef = useFocusTrap<HTMLDivElement>({ enabled: isOpen })

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Get the year plan
    const yearPlan = loadYearPlan()
    if (!yearPlan) {
      alert('No year plan found. Please generate a year plan first.')
      return
    }

    // Create the new item
    const newItem = createYearItem(
      formData.type,
      formData.title,
      formData.department,
      formData.quarter,
      formData.rationale,
      yearPlan.id
    )

    // Add status and alignment
    newItem.status = formData.status
    newItem.alignment_status = formData.alignment_status

    // Save to storage
    addYearItem(newItem)

    // Trigger refresh
    onAdd()

    // Reset form and close
    setFormData({
      title: '',
      rationale: '',
      type: 'play',
      department: 'company',
      quarter: 1,
      status: 'planned',
      alignment_status: 'linked'
    })
    onClose()
  }

  const handleCancel = () => {
    setFormData({
      title: '',
      rationale: '',
      type: 'play',
      department: 'company',
      quarter: 1,
      status: 'planned',
      alignment_status: 'linked'
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleCancel}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={focusTrapRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={MODAL_TITLE_ID}
        className="relative bg-card border-2 rounded-lg shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 id={MODAL_TITLE_ID} className="text-xl font-bold">Add New Card</h2>
            <button
              type="button"
              onClick={handleCancel}
              aria-label="Close modal"
              className="text-muted-foreground hover:text-foreground text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Title
            </label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="e.g., Launch new product"
            />
          </div>

          {/* Rationale */}
          <div>
            <label htmlFor="rationale" className="block text-sm font-medium mb-2">
              Rationale
            </label>
            <textarea
              id="rationale"
              value={formData.rationale}
              onChange={(e) => setFormData({ ...formData, rationale: e.target.value })}
              required
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Why is this important?"
            />
          </div>

          {/* Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium mb-2">
              Type
            </label>
            <Select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as YearItem['type'] })}
              required
            >
              <option value="milestone">Milestone</option>
              <option value="play">Play</option>
              <option value="ritual">Ritual</option>
              <option value="tuneup">Tune-Up</option>
            </Select>
          </div>

          {/* Department */}
          <div>
            <label htmlFor="department" className="block text-sm font-medium mb-2">
              Department
            </label>
            <Select
              id="department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value as YearItem['department'] })}
              required
            >
              <option value="company">Company</option>
              <option value="ops">Ops</option>
              <option value="sales_marketing">Sales/Marketing</option>
              <option value="finance">Finance</option>
            </Select>
          </div>

          {/* Quarter */}
          <div>
            <label htmlFor="quarter" className="block text-sm font-medium mb-2">
              Quarter
            </label>
            <Select
              id="quarter"
              value={formData.quarter.toString()}
              onChange={(e) => setFormData({ ...formData, quarter: parseInt(e.target.value) as YearItem['quarter'] })}
              required
            >
              <option value="1">Q1</option>
              <option value="2">Q2</option>
              <option value="3">Q3</option>
              <option value="4">Q4</option>
            </Select>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium mb-2">
              Status
            </label>
            <Select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as YearItem['status'] })}
            >
              <option value="planned">Planned</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
              <option value="done">Done</option>
            </Select>
          </div>

          {/* Alignment Status */}
          <div>
            <label htmlFor="alignment" className="block text-sm font-medium mb-2">
              Alignment to North Star
            </label>
            <Select
              id="alignment"
              value={formData.alignment_status}
              onChange={(e) => setFormData({ ...formData, alignment_status: e.target.value as YearItem['alignment_status'] })}
            >
              <option value="linked">Linked</option>
              <option value="unlinked">Unlinked</option>
            </Select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
            >
              Add Card
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
