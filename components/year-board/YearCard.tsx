import { YearItem } from '@/lib/year-board-types'
import { deleteYearItem } from '@/lib/year-board-storage'
import { Badge } from '@/components/ui/Badge'

interface YearCardProps {
  item: YearItem
  onEdit: () => void
  onDelete: () => void
  onUpdate: () => void
}

export function YearCard({ item, onEdit, onDelete, onUpdate }: YearCardProps) {
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
  }

  const handleDelete = () => {
    if (confirm(`Delete "${item.title}"?`)) {
      deleteYearItem(item.id)
      onUpdate()
      onDelete()
    }
  }

  return (
    <div
      className="bg-card border rounded-lg p-3 cursor-move hover:shadow-md transition-shadow"
      draggable
      onDragStart={handleDragStart}
    >
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
            onClick={handleDelete}
            className="text-xs text-muted-foreground hover:text-destructive"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
