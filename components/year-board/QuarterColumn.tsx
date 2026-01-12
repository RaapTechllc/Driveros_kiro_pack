'use client'

import { useState, useEffect, useRef } from 'react'
import { YearItem } from '@/lib/year-board-types'
import { loadYearItems, moveYearItem } from '@/lib/year-board-storage'
import { YearCard } from './YearCard'
import { EditCardModal } from './EditCardModal'

interface QuarterColumnProps {
  quarter: 1 | 2 | 3 | 4
  department: 'company' | 'ops' | 'sales_marketing' | 'finance'
  onCardMove: () => void
}

export function QuarterColumn({ quarter, department, onCardMove }: QuarterColumnProps) {
  const [items, setItems] = useState<YearItem[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [editingItem, setEditingItem] = useState<YearItem | null>(null)
  const dragCounterRef = useRef(0)
  const [dropSuccess, setDropSuccess] = useState(false)

  useEffect(() => {
    loadItems()
  }, [quarter, department])

  const loadItems = () => {
    const allItems = loadYearItems()
    const filteredItems = allItems.filter(
      item => item.quarter === quarter && item.department === department
    )
    setItems(filteredItems)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
    dragCounterRef.current = 0

    const itemId = e.dataTransfer.getData('text/plain')
    if (itemId) {
      // Show success feedback
      setDropSuccess(true)
      setTimeout(() => setDropSuccess(false), 300)

      moveYearItem(itemId, quarter, department)
      onCardMove()
      setTimeout(() => loadItems(), 50)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Only set to true, don't toggle based on events
    if (!dragOver) {
      setDragOver(true)
    }
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current++
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current--

    // Only set dragOver to false when we've left all children
    if (dragCounterRef.current === 0) {
      setDragOver(false)
    }
  }

  const handleCardUpdate = () => {
    loadItems()
    onCardMove()
  }

  return (
    <div
      className={`min-h-[150px] p-3 border-2 rounded-lg transition-all duration-200 ${
        dragOver
          ? 'border-orange-500 bg-orange-500/10 scale-[1.02] animate-racing-pulse ring-2 ring-orange-500'
          : dropSuccess
          ? 'ring-2 ring-green-500'
          : 'border-border bg-muted/20 hover:bg-muted/30'
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
    >
      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="animate-slide-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <YearCard
              item={item}
              onEdit={() => setEditingItem(item)}
              onDelete={() => {}}
              onUpdate={handleCardUpdate}
            />
          </div>
        ))}

        {/* Edit Modal */}
        {editingItem && (
          <EditCardModal
            item={editingItem}
            isOpen={!!editingItem}
            onClose={() => setEditingItem(null)}
            onUpdate={handleCardUpdate}
          />
        )}

        {items.length === 0 && (
          <div className="flex items-center justify-center h-[120px]">
            <div className="text-center text-muted-foreground text-sm">
              {dragOver ? (
                <div className="font-medium text-primary">Drop here</div>
              ) : (
                <div className="opacity-60">Drag cards here</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
