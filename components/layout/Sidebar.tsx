'use client'

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Calendar,
  Upload,
  Target,
  Settings,
  HelpCircle,
  LogOut,
  Activity,
  ChevronLeft,
  ChevronRight,
  Crown
} from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen?: boolean
  isCollapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}

const mainNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Meetings",
    href: "/meetings",
    icon: Calendar,
  },
  {
    title: "Daily Check-In",
    href: "/check-in",
    icon: Calendar,
  },
  {
    title: "Weekly Pit Stop",
    href: "/pit-stop",
    icon: Calendar,
  },
  {
    title: "Year Board",
    href: "/year-board",
    icon: Target,
  },
  {
    title: "Parked Ideas",
    href: "/parked-ideas",
    icon: Target,
  },
  {
    title: "Import Data",
    href: "/import",
    icon: Upload,
  },
  {
    title: "Performance",
    href: "/performance",
    icon: Activity,
  },
  {
    title: "Admin Reviews",
    href: "/admin/apex-reviews",
    icon: Crown,
  },
]

const generalNavItems = [
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    title: "Help",
    href: "/help",
    icon: HelpCircle,
  },
]


export function Sidebar({ className, isOpen, isCollapsed = false, onCollapsedChange, ...props }: SidebarProps) {
  const pathname = usePathname()

  // Common classes for nav links
  // Using text-foreground/80 for better contrast in all themes instead of text-secondary
  const navLinkClass = (isActive: boolean) => cn(
    "flex items-center gap-3 py-2 text-sm font-medium transition-all duration-200 border-l-[3px]",
    isCollapsed ? "px-3 justify-center" : "px-4",
    isActive
      ? "bg-primary/10 text-primary border-primary font-semibold"
      : "text-foreground/80 border-transparent hover:bg-muted hover:text-foreground"
  )

  return (
    <div
      className={cn(
        "pb-12 border-r border-border bg-background min-h-[calc(100vh-64px)] transition-all duration-300 ease-in-out relative",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
      {...props}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => onCollapsedChange?.(!isCollapsed)}
        className={cn(
          "absolute -right-3 top-6 z-50 flex h-6 w-6 items-center justify-center rounded-full border bg-background shadow-md hover:bg-muted transition-colors",
          "text-muted-foreground hover:text-foreground"
        )}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      <div className="space-y-4 py-4">

        {/* MENU Section */}
        <div className="px-0">
          {!isCollapsed && (
            <h3 className="mb-2 px-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Menu
            </h3>
          )}
          <div className="space-y-1">
            <nav className="grid gap-1">
              {mainNavItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={navLinkClass(isActive)}
                    title={isCollapsed ? item.title : undefined}
                  >
                    <Icon className={cn(
                      "h-5 w-5 flex-shrink-0",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )} />
                    {!isCollapsed && (
                      <span className="truncate">{item.title}</span>
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>

        {/* GENERAL Section */}
        <div className="mt-6 px-0">
          {!isCollapsed && (
            <h3 className="mb-2 px-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              General
            </h3>
          )}
          <div className="space-y-1">
            <nav className="grid gap-1">
              {generalNavItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={navLinkClass(isActive)}
                    title={isCollapsed ? item.title : undefined}
                  >
                    <Icon className={cn(
                      "h-5 w-5 flex-shrink-0",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )} />
                    {!isCollapsed && (
                      <span className="truncate">{item.title}</span>
                    )}
                  </Link>
                )
              })}

              <button
                className={cn(navLinkClass(false), "w-full text-left")}
                onClick={() => {/* Logout functionality - not implemented for hackathon */ }}
                title={isCollapsed ? "Logout" : undefined}
              >
                <LogOut className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                {!isCollapsed && <span className="truncate">Logout</span>}
              </button>

            </nav>
          </div>
        </div>

      </div>
    </div>
  )
}
