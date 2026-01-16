'use client'

import { useState } from 'react'
import { FileUpload } from '@/components/import/FileUpload'
import { ValidationResults } from '@/components/import/ValidationResults'
import { TemplateDownload } from '@/components/import/TemplateDownload'
import { validateActionsCSV, validateGoalsCSV, CSVImportResult, ImportedAction, ImportedGoal } from '@/lib/csv-import'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { ClipboardCheck, Target } from 'lucide-react'

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
          <div className="group relative border-2 border-border/50 rounded-2xl p-8 space-y-6 hover:border-primary/50 hover:bg-card/50 transition-all duration-300 overflow-hidden">
            {/* Background Gradient Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative z-10 flex flex-col items-center">
              <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ClipboardCheck className="h-10 w-10 text-primary" />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold">Import Actions</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Upload your action items with owners, timelines, and status tracking
                </p>
              </div>
            </div>

            <div className="relative z-10 space-y-3 p-4 bg-muted/30 rounded-lg text-sm border border-border/50">
              <div className="flex gap-2 text-muted-foreground">
                <span className="font-semibold text-foreground min-w-[60px]">Required:</span>
                <span>title, why, owner_role, engine, status</span>
              </div>
              <div className="flex gap-2 text-muted-foreground">
                <span className="font-semibold text-foreground min-w-[60px]">Optional:</span>
                <span>due_date, eta_days</span>
              </div>
            </div>

            <Button onClick={() => handleTypeSelect('actions')} className="w-full relative z-10" size="lg">
              Select CSV File
            </Button>
          </div>

          <div className="group relative border-2 border-border/50 rounded-2xl p-8 space-y-6 hover:border-blue-500/50 hover:bg-card/50 transition-all duration-300 overflow-hidden">
            {/* Background Gradient Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative z-10 flex flex-col items-center">
              <div className="h-20 w-20 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Target className="h-10 w-10 text-blue-500" />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold">Import Goals</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Upload your North Star and department goals with metrics
                </p>
              </div>
            </div>

            <div className="relative z-10 space-y-3 p-4 bg-muted/30 rounded-lg text-sm border border-border/50">
              <div className="flex gap-2 text-muted-foreground">
                <span className="font-semibold text-foreground min-w-[70px]">Structure:</span>
                <span>1 North Star + 3 Dept Goals</span>
              </div>
              <div className="flex gap-2 text-muted-foreground">
                <span className="font-semibold text-foreground min-w-[70px]">Alignment:</span>
                <span>Must link to parent goals</span>
              </div>
            </div>

            <Button onClick={() => handleTypeSelect('goals')} className="w-full relative z-10" variant="outline" size="lg">
              Select CSV File
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
