'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'

interface TourStep {
  id: string
  title: string
  description: string
  target: string
  position: 'top' | 'bottom' | 'left' | 'right'
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'gear',
    title: 'Business Gear',
    description: 'Your current business phase (1-5 scale) based on engine performance',
    target: '[data-tour="gear"]',
    position: 'bottom'
  },
  {
    id: 'accelerator',
    title: 'Weekly Accelerator',
    description: 'The one KPI that moves your North Star forward each week. This keeps your team focused on what matters most.',
    target: '[data-tour="accelerator"]',
    position: 'bottom'
  },
  {
    id: 'engines',
    title: 'Signal Board - Try the filters!',
    description: 'Health status of your 5 business engines. Scroll down to see Action Bay and try filtering by engine or status.',
    target: '[data-tour="engines"]',
    position: 'top'
  },
  {
    id: 'actions',
    title: 'Action Bay - Click to interact!',
    description: 'Try clicking status badges (todo → doing → done) to see transitions. Filter actions by engine, owner, or status above.',
    target: '[data-tour="actions"]',
    position: 'top'
  },
  {
    id: 'export',
    title: 'Export Everything',
    description: 'Download your complete analysis as CSV for Excel/Google Sheets. Try it now!',
    target: '[data-tour="export"]',
    position: 'left'
  }
]

interface GuidedTourProps {
  onComplete: () => void
}

export function GuidedTour({ onComplete }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  const nextStep = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeTour()
    }
  }

  const skipTour = () => {
    completeTour()
  }

  const completeTour = () => {
    setIsVisible(false)
    localStorage.setItem('demo-tour-completed', 'true')
    onComplete()
  }

  if (!isVisible || currentStep >= TOUR_STEPS.length) {
    return null
  }

  const step = TOUR_STEPS[currentStep]

  return (
    <>
      {/* Semi-transparent overlay - allows interaction */}
      <div className="fixed inset-0 bg-black/30 z-40 pointer-events-none" />

      {/* Tour tooltip with pulse animation */}
      <div className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border-2 border-primary/20 p-5 max-w-sm mx-4 top-4 left-1/2 transform -translate-x-1/2 sm:max-w-md animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <h4 className="font-semibold text-base">
                {step.title}
              </h4>
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              {currentStep + 1}/{TOUR_STEPS.length}
            </span>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {step.description}
          </p>

          {currentStep === 3 && (
            <div className="text-xs bg-primary/5 border border-primary/20 rounded p-2 text-primary">
              💡 <strong>Try it:</strong> Click a status badge below to see the magic!
            </div>
          )}

          <div className="flex justify-between items-center pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={skipTour}
              className="text-xs"
            >
              Skip Tour
            </Button>

            <Button
              size="sm"
              onClick={nextStep}
              className="text-xs"
            >
              {currentStep === TOUR_STEPS.length - 1 ? '✨ Start Exploring' : 'Next →'}
            </Button>
          </div>
        </div>

        {/* Arrow indicator */}
        <div className="absolute w-3 h-3 bg-white dark:bg-gray-800 border-t-2 border-l-2 border-primary/20 rotate-45 -bottom-1.5 left-1/2 transform -translate-x-1/2" />
      </div>
    </>
  )
}
