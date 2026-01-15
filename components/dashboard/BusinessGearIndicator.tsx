'use client'

import * as React from "react"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/Progress"

interface BusinessGearIndicatorProps {
    gear: number // 1-5
    progress: number // 0-100 completion of current gear
    phase: string // e.g. "Drive", "Neutral"
    description: string
}

export function BusinessGearIndicator({
    gear = 1,
    progress = 0,
    phase = "Parked",
    description = "Initial assessment needed."
}: BusinessGearIndicatorProps) {
    const gearColors = {
        1: { from: 'from-gray-600', to: 'to-gray-800', border: 'border-gray-500/20', text: 'text-gray-500' },
        2: { from: 'from-orange-600', to: 'to-orange-800', border: 'border-orange-500/20', text: 'text-orange-500' },
        3: { from: 'from-blue-600', to: 'to-blue-800', border: 'border-blue-500/20', text: 'text-blue-500' },
        4: { from: 'from-green-600', to: 'to-green-800', border: 'border-green-500/20', text: 'text-green-500' },
        5: { from: 'from-purple-600', to: 'to-purple-800', border: 'border-purple-500/20', text: 'text-purple-500' },
    }

    const currentColor = gearColors[gear as keyof typeof gearColors] || gearColors[1]

    return (
        <div className="w-full max-w-5xl mx-auto mb-12">

            {/* Dashboard-style panel */}
            <div className="relative overflow-hidden rounded-3xl border-2 border-border bg-card dark:bg-black p-12">

                {/* Scanline effect overlay */}
                <div className="absolute inset-0 opacity-5 dark:opacity-5 pointer-events-none"
                     style={{
                       backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, currentColor 2px, currentColor 4px)'
                     }}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">

                    {/* Left: Speedometer-style gear display */}
                    <div className="relative">
                        <div className="relative w-64 h-64 mx-auto">

                            {/* Outer ring - SVG speedometer */}
                            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                                {/* Background track */}
                                <circle
                                  cx="50" cy="50" r="40"
                                  fill="none"
                                  stroke="currentColor"
                                  className="text-gray-800 dark:text-gray-800"
                                  strokeWidth="8"
                                />
                                {/* Progress arc */}
                                <circle
                                  cx="50" cy="50" r="40"
                                  fill="none"
                                  stroke="url(#gearGradient)"
                                  strokeWidth="8"
                                  strokeLinecap="round"
                                  strokeDasharray={`${progress * 2.51} 251`}
                                  className="transition-all duration-1000 ease-out"
                                />
                                <defs>
                                    <linearGradient id="gearGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#FF4713" />
                                        <stop offset="100%" stopColor="#FFCC00" />
                                    </linearGradient>
                                </defs>
                            </svg>

                            {/* Center content */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <div className={cn(
                                    "text-9xl font-mono font-black bg-gradient-to-br bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(255,71,19,0.5)]",
                                    currentColor.from,
                                    currentColor.to
                                )}>
                                    {gear}
                                </div>
                                <div className="text-sm text-muted-foreground uppercase tracking-[0.2em] mt-2">
                                    Gear
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Status info */}
                    <div className="space-y-6">

                        {/* Phase label */}
                        <div>
                            <div className="text-muted-foreground text-sm font-medium uppercase tracking-wider mb-2">
                                Current Phase
                            </div>
                            <h2 className="font-display text-5xl font-bold text-foreground tracking-tight">
                                {phase}
                            </h2>
                        </div>

                        {/* Progress metric */}
                        <div className="space-y-3">
                            <div className="flex items-baseline justify-between">
                                <span className="text-muted-foreground text-sm font-medium">
                                    Progress to Next Gear
                                </span>
                                <span className="font-mono text-3xl font-bold text-primary">
                                    {progress}%
                                </span>
                            </div>

                            {/* Custom styled progress bar */}
                            <div className="relative h-3 bg-gray-900 dark:bg-gray-900 rounded-full overflow-hidden border border-border">
                                <div
                                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-600 to-yellow-400 rounded-full transition-all duration-1000 ease-out
                                             shadow-[0_0_20px_rgba(255,71,19,0.6)]"
                                  style={{ width: `${progress}%` }}
                                />
                                {/* Animated shine effect */}
                                <div className="absolute inset-0 overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent
                                                    animate-shimmer"
                                         style={{ width: '50%' }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Description with racing stripe */}
                        <div className="relative pl-6 border-l-2 border-primary">
                            <p className="text-muted-foreground leading-relaxed">
                                {description}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
