import { ProgressBar } from '@/components/ui/ProgressBar'
import { Button } from '@/components/ui/Button'

interface CSVProcessingState {
  stage: 'parsing' | 'validating' | 'importing' | 'complete' | 'error'
  progress: number
  currentRow?: number
  totalRows?: number
  message?: string
  canCancel?: boolean
}

interface ProgressIndicatorProps {
  state: CSVProcessingState
  onCancel?: () => void
}

export function ProgressIndicator({ state, onCancel }: ProgressIndicatorProps) {
  const getStageLabel = (stage: string) => {
    switch (stage) {
      case 'parsing': return 'Parsing CSV file...'
      case 'validating': return 'Validating data...'
      case 'importing': return 'Importing records...'
      case 'complete': return 'Import complete!'
      case 'error': return 'Import failed'
      default: return 'Processing...'
    }
  }
  
  const getProgressVariant = () => {
    switch (state.stage) {
      case 'complete': return 'success'
      case 'error': return 'error'
      default: return 'default'
    }
  }
  
  const getProgressDetails = () => {
    if (state.currentRow && state.totalRows) {
      return `Processing row ${state.currentRow.toLocaleString()} of ${state.totalRows.toLocaleString()}`
    }
    return state.message || ''
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium">{getStageLabel(state.stage)}</h4>
          {getProgressDetails() && (
            <p className="text-sm text-muted-foreground">{getProgressDetails()}</p>
          )}
        </div>
        
        {state.canCancel && onCancel && state.stage !== 'complete' && state.stage !== 'error' && (
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
      
      <ProgressBar 
        progress={state.progress} 
        variant={getProgressVariant()}
        size="md"
        showPercentage={true}
      />
      
      {state.stage === 'error' && state.message && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{state.message}</p>
        </div>
      )}
      
      {state.stage === 'complete' && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">
            {state.message || 'CSV import completed successfully!'}
          </p>
        </div>
      )}
    </div>
  )
}
