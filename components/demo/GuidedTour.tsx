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
    description: 'The one KPI that moves your North Star forward each week',
    target: '[data-tour="accelerator"]',
    position: 'bottom'
  },
  {
    id: 'engines',
    title: 'Signal Board',
    description: 'Health status of your 5 business engines with actionable insights',
    target: '[data-tour="engines"]', 
    position: 'top'
  },
  {
    id: 'actions',
    title: 'Action Bay',
    description: 'Prioritized actions with clear owners and timelines',
    target: '[data-tour="actions"]',
    position: 'top'
  },
  {
    id: 'export',
    title: 'CSV Export',
    description: 'Export your goals and actions for external tools',
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
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={skipTour} />
      
      {/* Tour tooltip */}
      <div className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border p-4 max-w-sm mx-4 top-4 left-1/2 transform -translate-x-1/2 sm:max-w-md">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">
              {step.title}
            </h4>
            <span className="text-xs text-muted-foreground">
              {currentStep + 1} of {TOUR_STEPS.length}
            </span>
          </div>
          
          <p className="text-sm text-muted-foreground">
            {step.description}
          </p>
          
          <div className="flex justify-between items-center pt-2">
            <Button
              variant="outline"
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
              {currentStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </div>
        </div>
        
        {/* Arrow indicator */}
        <div className="absolute w-3 h-3 bg-white dark:bg-gray-800 border rotate-45 -bottom-1.5 left-1/2 transform -translate-x-1/2" />
      </div>
    </>
  )
}
