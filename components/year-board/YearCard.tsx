'use client'

import { useState } from 'react'
import { YearItem } from '@/lib/year-board-types'
import { deleteYearItem, addYearItem, loadYearItems, saveYearItems } from '@/lib/year-board-storage'
import { Badge } from '@/components/ui/Badge'
import { ContextMenu, useContextMenu, ContextMenuItem } from '@/components/ui/ContextMenu'
import { 
  Pencil, 
  Copy, 
  Trash2, 
  ClipboardCopy, 
  ClipboardPaste,
  MoveRight,
  CheckCircle,
  Circle,
  AlertCircle,
  Play
} from 'lucide-react'

interface YearCardProps {
  item: YearItem
  onEdit: () => void
  onDelete: () => void
  onUpdate: () => void
}

// Global clipboard for copy/paste between cards
let clipboardItem: YearItem | null = null

export function YearCard({ item, onEdit, onDelete, onUpdate }: YearCardProps) {
  const { contextMenu, handleContextMenu, closeContextMenu } = useContextMenu()
  const [showMoveMenu, setShowMoveMenu] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const typeColors = {
    milestone: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    play: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    ritual: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    tuneup: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
  }

  const statusColors = {
    planned: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    blocked: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    done: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  }

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', item.id)
    e.dataTransfer.effectAllowed = 'move'
    setIsDragging(true)
  }

  const handleDragEnd = (e: React.DragEvent) => {
    setIsDragging(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Allow keyboard activation for accessibility
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onEdit()
    }
  }

  // Create accessible label for screen readers
  const accessibleLabel = `${item.type} card: ${item.title}${item.status ? `, status: ${item.status}` : ''}${item.alignment_status === 'unlinked' ? ', not linked to North Star' : ''}`

  const handleDeleteItem = () => {
    if (confirm(`Delete "${item.title}"?`)) {
      deleteYearItem(item.id)
      onUpdate()
      onDelete()
    }
  }

  const handleDuplicate = () => {
    const duplicatedItem: YearItem = {
      ...item,
      id: `year-item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: `${item.title} (copy)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    addYearItem(duplicatedItem)
    onUpdate()
  }

  const handleCopy = () => {
    clipboardItem = { ...item }
  }

  const handlePaste = () => {
    if (clipboardItem) {
      const pastedItem: YearItem = {
        ...clipboardItem,
        id: `year-item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        quarter: item.quarter,
        department: item.department,
        title: `${clipboardItem.title} (pasted)`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      addYearItem(pastedItem)
      onUpdate()
    }
  }

  const handleStatusChange = (newStatus: YearItem['status']) => {
    const items = loadYearItems()
    const index = items.findIndex(i => i.id === item.id)
    if (index !== -1) {
      items[index] = {
        ...items[index],
        status: newStatus,
        updated_at: new Date().toISOString()
      }
      saveYearItems(items)
      onUpdate()
    }
  }

  const handleMoveToQuarter = (newQuarter: 1 | 2 | 3 | 4) => {
    const items = loadYearItems()
    const index = items.findIndex(i => i.id === item.id)
    if (index !== -1) {
      items[index] = {
        ...items[index],
        quarter: newQuarter,
        updated_at: new Date().toISOString()
      }
      saveYearItems(items)
      onUpdate()
    }
    setShowMoveMenu(false)
  }

  const contextMenuItems: ContextMenuItem[] = [
    {
      id: 'edit',
      label: 'Edit',
      icon: <Pencil className="h-4 w-4" />,
      shortcut: 'E',
      onClick: onEdit
    },
    {
      id: 'duplicate',
      label: 'Duplicate',
      icon: <Copy className="h-4 w-4" />,
      shortcut: '⌘D',
      onClick: handleDuplicate
    },
    { id: 'sep1', label: '', separator: true },
    {
      id: 'copy',
      label: 'Copy',
      icon: <ClipboardCopy className="h-4 w-4" />,
      shortcut: '⌘C',
      onClick: handleCopy
    },
    {
      id: 'paste',
      label: 'Paste here',
      icon: <ClipboardPaste className="h-4 w-4" />,
      shortcut: '⌘V',
      disabled: !clipboardItem,
      onClick: handlePaste
    },
    { id: 'sep2', label: '', separator: true },
    {
      id: 'status-planned',
      label: 'Set Planned',
      icon: <Circle className="h-4 w-4" />,
      onClick: () => handleStatusChange('planned')
    },
    {
      id: 'status-active',
      label: 'Set Active',
      icon: <Play className="h-4 w-4" />,
      onClick: () => handleStatusChange('active')
    },
    {
      id: 'status-blocked',
      label: 'Set Blocked',
      icon: <AlertCircle className="h-4 w-4" />,
      onClick: () => handleStatusChange('blocked')
    },
    {
      id: 'status-done',
      label: 'Set Done',
      icon: <CheckCircle className="h-4 w-4" />,
      onClick: () => handleStatusChange('done')
    },
    { id: 'sep3', label: '', separator: true },
    {
      id: 'move-q1',
      label: 'Move to Q1',
      icon: <MoveRight className="h-4 w-4" />,
      disabled: item.quarter === 1,
      onClick: () => handleMoveToQuarter(1)
    },
    {
      id: 'move-q2',
      label: 'Move to Q2',
      icon: <MoveRight className="h-4 w-4" />,
      disabled: item.quarter === 2,
      onClick: () => handleMoveToQuarter(2)
    },
    {
      id: 'move-q3',
      label: 'Move to Q3',
      icon: <MoveRight className="h-4 w-4" />,
      disabled: item.quarter === 3,
      onClick: () => handleMoveToQuarter(3)
    },
    {
      id: 'move-q4',
      label: 'Move to Q4',
      icon: <MoveRight className="h-4 w-4" />,
      disabled: item.quarter === 4,
      onClick: () => handleMoveToQuarter(4)
    },
    { id: 'sep4', label: '', separator: true },
    {
      id: 'delete',
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      shortcut: '⌫',
      danger: true,
      onClick: handleDeleteItem
    }
  ]

  return (
    <div className="animate-slide-in">
      <div
        role="button"
        tabIndex={0}
        aria-label={accessibleLabel}
        aria-grabbed={isDragging}
        aria-describedby={`card-instructions-${item.id}`}
        className="bg-card border rounded-lg p-3 cursor-move hover:shadow-[0_0_20px_rgba(255,71,19,0.2)] transition-[transform,shadow] duration-300 active:cursor-grabbing active:scale-105 active:shadow-[0_0_30px_rgba(255,71,19,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onContextMenu={handleContextMenu}
        onKeyDown={handleKeyDown}
      >
        <span id={`card-instructions-${item.id}`} className="sr-only">
          Press Enter or Space to edit. Drag to move to another quarter.
        </span>
        {/* Header with badges */}
        <div className="flex justify-between items-start mb-2">
          <Badge className={typeColors[item.type]}>
            {item.type}
          </Badge>
          {item.alignment_status === 'unlinked' && (
            <Badge variant="outline" className="text-yellow-600 border-yellow-600">
              Link to North Star
            </Badge>
          )}
        </div>

        {/* Title */}
        <h4 className="font-medium text-sm mb-1">{item.title}</h4>

        {/* Rationale */}
        <p className="text-xs text-muted-foreground mb-2">{item.rationale}</p>

        {/* Footer with status */}
        <div className="flex justify-between items-center">
          {item.status && (
            <Badge className={statusColors[item.status]} variant="outline">
              {item.status}
            </Badge>
          )}
          <div className="flex gap-1">
            <button
              onClick={onEdit}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Edit
            </button>
            <button
              onClick={handleDeleteItem}
              className="text-xs text-muted-foreground hover:text-destructive"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          items={contextMenuItems}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={closeContextMenu}
        />
      )}
    </div>
  )
}
