'use client'

import { Button } from '@/components/ui/Button'
import { enableDemoMode, loadDemoData } from '@/lib/demo-mode'
import { useRouter } from 'next/navigation'

export function DemoModeToggle() {
  const router = useRouter()

  const startDemo = () => {
    // Check if user has existing data
    const hasExistingData = localStorage.getItem('full-audit-result') || 
                           localStorage.getItem('flash-scan-result') ||
                           localStorage.getItem('full-audit-data') ||
                           localStorage.getItem('flash-scan-data')
    
    if (hasExistingData) {
      const confirmed = confirm(
        'Starting demo mode will temporarily replace your current data. Your data will be restored when you exit demo mode. Continue?'
      )
      if (!confirmed) return
      
      // Backup existing data
      const backup = {
        'full-audit-result': localStorage.getItem('full-audit-result'),
        'flash-scan-result': localStorage.getItem('flash-scan-result'),
        'full-audit-data': localStorage.getItem('full-audit-data'),
        'flash-scan-data': localStorage.getItem('flash-scan-data'),
        'imported-actions': localStorage.getItem('imported-actions'),
        'imported-goals': localStorage.getItem('imported-goals')
      }
      localStorage.setItem('demo-backup', JSON.stringify(backup))
    }
    
    // Enable demo mode and load demo data
    enableDemoMode()
    loadDemoData()
    
    // Navigate to dashboard
    router.push('/dashboard')
  }

  return (
    <div className="mt-8 p-6 border rounded-lg bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20 border-orange-200 dark:border-orange-800">
      <div className="text-center space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
            🏆 Judge Demo Mode
          </h3>
          <p className="text-sm text-orange-700 dark:text-orange-200">
            See the complete DriverOS experience instantly with realistic sample data
          </p>
        </div>
        
        <Button 
          onClick={startDemo}
          size="lg"
          className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3"
        >
          Launch Demo Dashboard
        </Button>
        
        <p className="text-xs text-orange-600 dark:text-orange-300">
          Pre-loaded with TechFlow Solutions • All features enabled • Imported data included
        </p>
      </div>
    </div>
  )
}
