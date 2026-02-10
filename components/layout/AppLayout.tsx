'use client'

import * as React from "react"
import { usePathname, useRouter } from 'next/navigation'

import { Header } from "./Header"
import { Sidebar } from "./Sidebar"
import { cn } from "@/lib/utils"
import { useAuth } from '@/components/providers/AuthProvider'

const SIDEBAR_COLLAPSED_KEY = 'sidebar-collapsed'

export function AppLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false)
    const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false)
    const { user, isLoading } = useAuth()
    const pathname = usePathname()
    const router = useRouter()

    // Load collapsed state from localStorage on mount
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(SIDEBAR_COLLAPSED_KEY)
            if (saved === 'true') {
                setIsSidebarCollapsed(true)
            }
        }
    }, [])

    // Persist collapsed state to localStorage
    const handleCollapsedChange = (collapsed: boolean) => {
        setIsSidebarCollapsed(collapsed)
        if (typeof window !== 'undefined') {
            localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed))
        }
    }

    React.useEffect(() => {
        if (isLoading) return

        if (user && !user.currentOrg) {
            if (!pathname.startsWith('/onboarding')) {
                router.replace('/onboarding')
            }
            return
        }

        if (user?.currentOrg && pathname.startsWith('/onboarding')) {
            router.replace('/dashboard')
        }
    }, [user, isLoading, pathname, router])

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans antialiased">
            {/* Header */}

            {/* 2. Header (Sticky handled inside component) */}
            <Header
                onMobileMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
                onSidebarToggle={() => handleCollapsedChange(!isSidebarCollapsed)}
                isSidebarCollapsed={isSidebarCollapsed}
            />

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
                        "fixed inset-y-0 left-0 z-40 mt-[112px] lg:mt-0 lg:static lg:block bg-background transition-all duration-300",
                        isSidebarCollapsed ? "w-16" : "w-64",
                        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                    )}
                >
                    <Sidebar
                        className="h-full"
                        isCollapsed={isSidebarCollapsed}
                        onCollapsedChange={handleCollapsedChange}
                    />
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
