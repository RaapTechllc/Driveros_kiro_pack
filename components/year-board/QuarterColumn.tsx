'use client'

import { useState, useEffect } from 'react'
import { YearItem } from '@/lib/year-board-types'
import { loadYearItems, moveYearItem } from '@/lib/year-board-storage'
import { YearCard } from './YearCard'

interface QuarterColumnProps {
  quarter: 1 | 2 | 3 | 4
  department: 'company' | 'ops' | 'sales_marketing' | 'finance'
  onCardMove: () => void
}

export function QuarterColumn({ quarter, department, onCardMove }: QuarterColumnProps) {
  const [items, setItems] = useState<YearItem[]>([])
  const [dragOver, setDragOver] = useState(false)

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
    setDragOver(false)
    
    const itemId = e.dataTransfer.getData('text/plain')
    if (itemId) {
      moveYearItem(itemId, quarter, department)
      loadItems()
      onCardMove()
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleCardUpdate = () => {
    loadItems()
    onCardMove()
  }

  return (
    <div
      className={`min-h-[120px] p-2 border-2 border-dashed rounded-lg transition-colors ${
        dragOver 
          ? 'border-primary bg-primary/5' 
          : 'border-muted-foreground/20 hover:border-muted-foreground/40'
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <div className="space-y-2">
        {items.map(item => (
          <YearCard
            key={item.id}
            item={item}
            onEdit={() => console.log('Edit card', item.id)}
            onDelete={() => console.log('Delete card', item.id)}
            onUpdate={handleCardUpdate}
          />
        ))}
        
        {items.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-8">
            {dragOver ? 'Drop here' : 'Drop cards here'}
          </div>
        )}
      </div>
    </div>
  )
}
