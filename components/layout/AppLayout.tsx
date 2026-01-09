'use client'

import * as React from "react"
import { TopBanner } from "./TopBanner"
import { Header } from "./Header"
import { Sidebar } from "./Sidebar"
import { cn } from "@/lib/utils"

export function AppLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false)
    const [hasError, setHasError] = React.useState(false)

    if (hasError) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
                    <p className="text-muted-foreground mb-4">Please refresh the page to continue.</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                    >
                        Refresh Page
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans antialiased">
            {/* 1. Top Banner (Fixed/Sticky handled inside component) */}
            <TopBanner />

            {/* 2. Header (Sticky handled inside component) */}
            <Header onMobileMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

            <div className="flex flex-1">
                {/* 3. Sidebar (Hidden on mobile unless toggled, fixed on desktop) */}
                {/* Mobile Sidebar Overlay */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 z-30 bg-background/80 lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Sidebar Container */}
                <aside
                    className={cn(
                        "fixed inset-y-0 left-0 z-40 mt-[112px] lg:mt-0 lg:static lg:block w-64 bg-background",
                        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                    )}
                >
                    <Sidebar className="h-full" />
                </aside>

                {/* 4. Main Content */}
                <main className="flex-1 w-full p-4 lg:p-8 overflow-y-auto">
                    <div className="container mx-auto max-w-7xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
