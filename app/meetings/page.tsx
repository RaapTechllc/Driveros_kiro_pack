'use client'

import { useState, useEffect } from 'react'
import { meetingTemplates } from '@/lib/meeting-templates'
import { MeetingTemplateCard } from '@/components/meetings/MeetingTemplateCard'
import { MeetingForm } from '@/components/meetings/MeetingForm'
import { MeetingTemplate, QuickWin } from '@/lib/types'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { History } from 'lucide-react'

export default function MeetingsPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<MeetingTemplate | null>(null)
  const [completedActions, setCompletedActions] = useState<QuickWin[] | null>(null)
  const [acceleratorKPI, setAcceleratorKPI] = useState<string>('')

  // Load accelerator from localStorage
  useEffect(() => {
    const flashResult = localStorage.getItem('flash-scan-result')
    const auditResult = localStorage.getItem('full-audit-result')

    if (auditResult) {
      const result = JSON.parse(auditResult)
      setAcceleratorKPI(result.accelerator?.kpi || 'Weekly KPI')
    } else if (flashResult) {
      const result = JSON.parse(flashResult)
      setAcceleratorKPI(result.accelerator?.kpi || 'Weekly KPI')
    }
  }, [])

  const handleMeetingComplete = (actions: QuickWin[]) => {
    setCompletedActions(actions)
  }

  const handleBackToTemplates = () => {
    setSelectedTemplate(null)
    setCompletedActions(null)
  }

  if (completedActions) {
    return (
      <>
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Meeting Complete!</h1>
            <p className="text-muted-foreground">
              Your {selectedTemplate?.title} generated {completedActions.length} new actions
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Actions Generated</h2>
            <div className="space-y-3">
              {completedActions.map((action, index) => (
                <div key={index} className="border rounded p-4 bg-white dark:bg-gray-800">
                  <div className="font-medium">{action.title}</div>
                  <div className="text-sm text-muted-foreground">{action.why}</div>
                  <div className="text-xs mt-2 flex justify-between">
                    <span>Owner: {action.owner_role}</span>
                    <span>{action.eta_days}d • {action.engine}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Button onClick={handleBackToTemplates}>
              Start Another Meeting
            </Button>
            <Link href="/dashboard">
              <Button variant="outline">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </>
    )
  }

  if (selectedTemplate) {
    return (
      <>
        <MeetingForm
          template={selectedTemplate}
          acceleratorKPI={acceleratorKPI}
          onComplete={handleMeetingComplete}
          onBack={handleBackToTemplates}
        />
      </>
    )
  }

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Meeting Templates</h1>
          <p className="text-xl text-muted-foreground">
            Structured meetings to maintain momentum and drive results
          </p>
          {acceleratorKPI && (
            <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg inline-block">
              Current Accelerator: {acceleratorKPI}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {Object.values(meetingTemplates).map((template) => (
            <MeetingTemplateCard
              key={template.type}
              template={template}
              onSelect={() => setSelectedTemplate(template)}
            />
          ))}
        </div>

        <div className="flex justify-center gap-4">
          <Link href="/meetings/history">
            <Button variant="outline">
              <History className="h-4 w-4 mr-2" />
              Meeting History
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    </>
  )
}
