'use client'

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
// import { Button } from "@/components/ui/Button" // Not currently used but good to have
import {
  LayoutDashboard,
  Zap,
  Calendar,
  Upload,
  Target,
  Gauge,
  Users,
  PieChart,
  Settings,
  HelpCircle,
  LogOut
} from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen?: boolean; // For mobile toggle state if needed
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
    title: "Year Board",
    href: "/year-board",
    icon: Target,
  },
  {
    title: "Import Data",
    href: "/import",
    icon: Upload,
  },
  /* 
  // Placeholder items until implemented
  {
    title: "Tasks",
    href: "/tasks",
    icon: Zap,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: PieChart,
  },
  {
    title: "Team",
    href: "/team",
    icon: Users,
  },
  */
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


export function Sidebar({ className, isOpen, ...props }: SidebarProps) {
  const pathname = usePathname()

  // Common classes for nav links
  const navLinkClass = (isActive: boolean) => cn(
    "flex items-center gap-3 px-4 py-2 text-sm font-medium transition-all duration-200 border-l-[3px]",
    isActive
      ? "bg-primary/10 text-primary border-primary font-semibold"
      : "text-secondary border-transparent hover:bg-muted hover:text-foreground"
  )

  return (
    <div className={cn("pb-12 w-64 border-r border-border bg-background min-h-[calc(100vh-64px)]", className)} {...props}>
      <div className="space-y-4 py-4">

        {/* MENU Section */}
        <div className="px-0">
          <h3 className="mb-2 px-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Menu
          </h3>
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
                  >
                    <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
                    {item.title}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>

        {/* GENERAL Section */}
        <div className="mt-6 px-0">
          <h3 className="mb-2 px-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            General
          </h3>
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
                  >
                    <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
                    {item.title}
                  </Link>
                )
              })}

              <button
                className={navLinkClass(false) + " w-full text-left"}
                onClick={() => console.log("Logout clicked")}
              >
                <LogOut className="h-5 w-5 text-muted-foreground" />
                Logout
              </button>

            </nav>
          </div>
        </div>

      </div>
    </div>
  )
}
