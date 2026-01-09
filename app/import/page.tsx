'use client'

import { useState } from 'react'
import { FileUpload } from '@/components/import/FileUpload'
import { ValidationResults } from '@/components/import/ValidationResults'
import { TemplateDownload } from '@/components/import/TemplateDownload'
import { validateActionsCSV, validateGoalsCSV, CSVImportResult, ImportedAction, ImportedGoal } from '@/lib/csv-import'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

type ImportStep = 'select' | 'upload' | 'validate' | 'success'
type ImportType = 'actions' | 'goals'

export default function ImportPage() {
  const [step, setStep] = useState<ImportStep>('select')
  const [importType, setImportType] = useState<ImportType>('actions')
  const [validationResult, setValidationResult] = useState<CSVImportResult | null>(null)
  const [importedCount, setImportedCount] = useState(0)

  const handleTypeSelect = (type: ImportType) => {
    setImportType(type)
    setStep('upload')
  }

  const handleFileSelect = async (file: File) => {
    const content = await file.text()

    try {
      let result: CSVImportResult
      if (importType === 'actions') {
        result = await validateActionsCSV(content)
      } else {
        result = await validateGoalsCSV(content)
      }

      setValidationResult(result)
      setStep('validate')
    } catch (error) {
      console.error('CSV validation error:', error)
      setValidationResult({
        success: false,
        errors: [{ row: 0, field: 'file', message: 'Failed to process CSV file' }],
        totalRows: 0,
        validRows: 0
      })
      setStep('validate')
    }
  }

  const handleImport = () => {
    if (!validationResult?.data) return

    if (importType === 'actions') {
      // Save actions to localStorage
      const existingActions = JSON.parse(localStorage.getItem('imported-actions') || '[]')
      const newActions = validationResult.data.map((action: ImportedAction) => ({
        ...action,
        id: `imported_${Date.now()}_${Math.random()}`,
        created_at: new Date().toISOString()
      }))
      localStorage.setItem('imported-actions', JSON.stringify([...existingActions, ...newActions]))
    } else {
      // Save goals to localStorage
      const existingGoals = JSON.parse(localStorage.getItem('imported-goals') || '[]')
      const newGoals = validationResult.data.map((goal: ImportedGoal) => ({
        ...goal,
        id: `imported_${Date.now()}_${Math.random()}`,
        created_at: new Date().toISOString()
      }))
      localStorage.setItem('imported-goals', JSON.stringify([...existingGoals, ...newGoals]))
    }

    setImportedCount(validationResult.validRows)
    setStep('success')
  }

  const handleReset = () => {
    setStep('select')
    setValidationResult(null)
    setImportedCount(0)
  }

  const handleTryAgain = () => {
    setStep('upload')
    setValidationResult(null)
  }

  const handleDownloadTemplate = () => {
    // Template download is handled by the TemplateDownload component
  }

  if (step === 'success') {
    return (
      <>
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <div className="text-6xl">🎉</div>
            <h1 className="text-3xl font-bold">Import Successful!</h1>
            <p className="text-xl text-muted-foreground">
              Successfully imported {importedCount} {importType}
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center" data-testid="final-success-message">
            <p className="text-green-800 dark:text-green-200">
              Your {importType} have been imported and are now available in the dashboard.
              {importType === 'actions' && ' They will appear in the Action Bay alongside generated actions.'}
              {importType === 'goals' && ' They will be integrated with your existing goal structure.'}
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg">
                View Dashboard
              </Button>
            </Link>
            <Button variant="outline" onClick={handleReset}>
              Import More Data
            </Button>
          </div>
        </div>
      </>
    )
  }

  if (step === 'validate' && validationResult) {
    return (
      <>
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Validation Results</h1>
            <p className="text-muted-foreground">
              Checking your {importType} CSV for errors
            </p>
          </div>

          <ValidationResults
            result={validationResult}
            type={importType}
            onDownloadTemplate={handleDownloadTemplate}
            onTryAgain={handleTryAgain}
            onProceed={validationResult.success ? handleImport : undefined}
          />

          <div className="text-center">
            <Button variant="outline" onClick={handleReset}>
              Start Over
            </Button>
          </div>
        </div>
      </>
    )
  }

  if (step === 'upload') {
    return (
      <>
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Import {importType === 'actions' ? 'Actions' : 'Goals'}</h1>
            <p className="text-muted-foreground">
              Upload your CSV file to import {importType} into DriverOS
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <FileUpload
              onFileSelect={handleFileSelect}
              accept=".csv"
              label={`Upload ${importType === 'actions' ? 'Actions' : 'Goals'} CSV`}
              description={`Select your ${importType} CSV file to validate and import`}
            />

            <TemplateDownload
              type={importType}
              onDownload={handleDownloadTemplate}
            />
          </div>

          <div className="text-center">
            <Button variant="outline" onClick={() => setStep('select')}>
              Back to Selection
            </Button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Import Data</h1>
          <p className="text-xl text-muted-foreground">
            Import your existing actions and goals from CSV files
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="border rounded-lg p-8 space-y-4 hover:border-primary/50 transition-colors">
            <div className="text-4xl text-center">📋</div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">Import Actions</h3>
              <p className="text-muted-foreground">
                Upload your action items with owners, timelines, and status tracking
              </p>
            </div>
            <div className="space-y-2 text-sm">
              <p><strong>Required fields:</strong> title, why, owner_role, engine, eta_days, status</p>
              <p><strong>Optional fields:</strong> due_date</p>
              <p><strong>Supported owners:</strong> Owner, Ops, Sales, Finance</p>
            </div>
            <Button onClick={() => handleTypeSelect('actions')} className="w-full">
              Import Actions
            </Button>
          </div>

          <div className="border rounded-lg p-8 space-y-4 hover:border-primary/50 transition-colors">
            <div className="text-4xl text-center">🎯</div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">Import Goals</h3>
              <p className="text-muted-foreground">
                Upload your North Star and department goals with metrics and targets
              </p>
            </div>
            <div className="space-y-2 text-sm">
              <p><strong>Required:</strong> 1 North Star goal, up to 3 department goals</p>
              <p><strong>Department goals need:</strong> alignment_statement</p>
              <p><strong>Supported departments:</strong> Ops, Sales/Marketing, Finance</p>
            </div>
            <Button onClick={() => handleTypeSelect('goals')} className="w-full">
              Import Goals
            </Button>
          </div>
        </div>

        <div className="text-center">
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    </>
  )
}
