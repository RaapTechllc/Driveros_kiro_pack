'use client'

import * as React from "react"
import { Target } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { cn } from "@/lib/utils"
import { isDemoMode, exitDemoMode } from "@/lib/demo-mode"
import { useRouter } from 'next/navigation'

export function TopBanner() {
    const [showDemoBanner, setShowDemoBanner] = React.useState(false)
    const router = useRouter()

    React.useEffect(() => {
        setShowDemoBanner(isDemoMode())
    }, [])

    if (!showDemoBanner) return null

    const handleExitDemo = () => {
        // Restore backup data if it exists
        const backup = localStorage.getItem('demo-backup')
        if (backup) {
            try {
                const backupData = JSON.parse(backup)
                Object.entries(backupData).forEach(([key, value]) => {
                    if (value) {
                        localStorage.setItem(key, value as string)
                    }
                })
                localStorage.removeItem('demo-backup')
            } catch (error) {
                console.error('Failed to restore backup:', error)
            }
        }
        
        // Exit demo mode
        exitDemoMode()
        
        // Navigate to homepage
        router.push('/')
    }

    return (
        <div className="sticky top-0 z-50 flex flex-col w-full">
            {/* Demo Mode Banner */}
            <div className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-4 py-3 shadow-md backdrop-blur-sm transition-all duration-300">
                <div className="container flex items-center justify-between mx-auto max-w-7xl">
                    <div className="flex items-center gap-3 text-sm font-medium">
                        <span className="flex items-center justify-center w-6 h-6 bg-white/20 rounded-full">
                            🏆
                        </span>
                        <span>Demo Mode Active • TechFlow Solutions Sample Data</span>
                    </div>
                    <button
                        onClick={handleExitDemo}
                        className="px-3 py-1 text-xs font-medium text-white/90 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                    >
                        Exit Demo
                    </button>
                </div>
            </div>
        </div>
    )
}
