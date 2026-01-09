import { useState, useCallback, useRef } from 'react'
import { validateActionsCSV, validateGoalsCSV, CSVImportResult, CSVProcessingOptions } from '@/lib/csv-import'

interface CSVProcessingState {
  stage: 'idle' | 'parsing' | 'validating' | 'importing' | 'complete' | 'error'
  progress: number
  currentRow?: number
  totalRows?: number
  message?: string
  result?: CSVImportResult
  error?: string
}

export function useCSVProcessor() {
  const [state, setState] = useState<CSVProcessingState>({
    stage: 'idle',
    progress: 0
  })
  
  const abortControllerRef = useRef<AbortController | null>(null)
  
  const processCSV = useCallback(async (
    file: File, 
    type: 'actions' | 'goals'
  ): Promise<CSVImportResult> => {
    // Cancel any existing processing
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController()
    
    setState({
      stage: 'parsing',
      progress: 0,
      message: `Processing ${file.name}...`
    })
    
    try {
      // Read file content
      const content = await file.text()
      
      if (abortControllerRef.current.signal.aborted) {
        throw new Error('Processing cancelled')
      }
      
      // Set up processing options
      const options: CSVProcessingOptions = {
        chunkSize: 100,
        signal: abortControllerRef.current.signal,
        onProgress: (progress, currentRow, totalRows) => {
          setState(prev => ({
            ...prev,
            progress,
            currentRow,
            totalRows,
            message: `Processing row ${currentRow.toLocaleString()} of ${totalRows.toLocaleString()}`
          }))
        },
        onStageChange: (stage) => {
          setState(prev => ({
            ...prev,
            stage,
            message: stage === 'validating' 
              ? 'Validating data...' 
              : stage === 'importing'
              ? 'Importing records...'
              : prev.message
          }))
        }
      }
      
      // Process based on type
      const result = type === 'actions' 
        ? await validateActionsCSV(content, options)
        : await validateGoalsCSV(content, options)
      
      if (abortControllerRef.current.signal.aborted) {
        throw new Error('Processing cancelled')
      }
      
      setState({
        stage: 'complete',
        progress: 100,
        result,
        message: result.success 
          ? `Successfully imported ${result.validRows} ${type}`
          : `Import failed with ${result.errors.length} errors`
      })
      
      return result
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      
      setState({
        stage: 'error',
        progress: 0,
        error: errorMessage,
        message: errorMessage
      })
      
      throw error
    }
  }, [])
  
  const cancelProcessing = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setState({
        stage: 'idle',
        progress: 0,
        message: 'Processing cancelled'
      })
    }
  }, [])
  
  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setState({
      stage: 'idle',
      progress: 0
    })
  }, [])
  
  return {
    state,
    processCSV,
    cancelProcessing,
    reset,
    isProcessing: state.stage !== 'idle' && state.stage !== 'complete' && state.stage !== 'error'
  }
}
