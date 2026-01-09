import { CSVImportResult } from '@/lib/csv-import'
import { Button } from '@/components/ui/Button'

interface ValidationResultsProps {
  result: CSVImportResult
  type: 'actions' | 'goals'
  onDownloadTemplate: () => void
  onTryAgain: () => void
  onProceed?: () => void
}

export function ValidationResults({ 
  result, 
  type, 
  onDownloadTemplate, 
  onTryAgain, 
  onProceed 
}: ValidationResultsProps) {
  if (result.success) {
    return (
      <div className="space-y-4">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6" data-testid="success-message">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-2xl">✅</div>
            <div>
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                Validation Successful
              </h3>
              <p className="text-sm text-green-600 dark:text-green-300">
                {result.validRows} {type} ready to import
              </p>
            </div>
          </div>
          
          <div className="flex gap-4">
            {onProceed && (
              <Button onClick={onProceed}>
                Import {result.validRows} {type}
              </Button>
            )}
            <Button variant="outline" onClick={onTryAgain}>
              Upload Different File
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6" data-testid="error-message">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-2xl">❌</div>
          <div>
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
              Validation Failed
            </h3>
            <p className="text-sm text-red-600 dark:text-red-300">
              {result.totalRows - result.validRows} of {result.totalRows} rows have errors
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Errors Found:</h4>
            <div className="space-y-2">
              {result.errors.map((error, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 border rounded p-3 text-sm">
                  <div className="font-medium">
                    {error.row === 0 ? 'Header' : `Row ${error.row}`} - {error.field}
                  </div>
                  <div className="text-muted-foreground">{error.message}</div>
                  {error.value && (
                    <div className="text-xs mt-1">
                      Value: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">
                        {error.value}
                      </code>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {result.errors.length >= 5 && (
              <p className="text-xs text-muted-foreground mt-2">
                Showing first 5 errors. Fix these and re-upload to see more.
              </p>
            )}
          </div>

          <div className="flex gap-4 flex-wrap">
            <Button onClick={onDownloadTemplate} variant="outline">
              Download Template
            </Button>
            <Button onClick={onTryAgain} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
