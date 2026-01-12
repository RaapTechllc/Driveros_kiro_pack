'use client'

import * as React from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import {
  Settings,
  Bell,
  User,
  LogOut,
  Moon,
  Sun,
  Monitor,
  Gauge,
  Menu,
  Palette,
  Sparkles,
  Sunrise
} from "lucide-react" // Import Menu for mobile trigger
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/Button" // Absolute path, verify if it exists
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar" // Absolute path, verify
import { cn } from "@/lib/utils"

function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  const handleThemeChange = (newTheme: string) => {
    try {
      setTheme(newTheme)
    } catch (error) {
      console.error('Failed to change theme:', error)
      // Fallback to system theme
      setTheme('system')
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Mode</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handleThemeChange("light")}>
          <Sun className="mr-2 h-4 w-4" /> Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("dark")}>
          <Moon className="mr-2 h-4 w-4" /> Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("system")}>
          <Monitor className="mr-2 h-4 w-4" /> System
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground">Theme Palettes</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handleThemeChange("midnight-racing")}>
          <Sparkles className="mr-2 h-4 w-4 text-blue-400" /> Midnight Racing
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("sunrise")}>
          <Sunrise className="mr-2 h-4 w-4 text-orange-400" /> Sunrise
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("sunrise-dark")}>
          <Sunrise className="mr-2 h-4 w-4 text-amber-500" /> Sunrise Dark
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ThemePaletteSelector() {
  const { setTheme } = useTheme()
  // In a real implementation, we might use a context or custom hook to manage the data-theme attribute.
  // Since next-themes handles class or data-theme, usually we need to set the attribute on the html/body.
  // For now, assuming standard next-themes setup. If we need specific color palettes (Default, Dusk, etc.),
  // we might need a separate state or just rely on 'theme' if we mapped them to next-themes values.
  // However, the spec says "Theme System (7 Palettes)". Typically this is orthogonal to Light/Dark.
  // We'll add a simple placeholder for Palette switching if needed, or stick to Light/Dark for now 
  // and assume the user manages palettes elsewhere or we extend this later.
  // For simplicity in this first pass, we'll stick to the requested Light/Dark toggle above 
  // but acknowledging the 7 themes requirement, we might want a separate "Appearance" menu.

  // For now, let's keep it simple with just Light/Dark as per the basic requirements, 
  // but the spec mentioned "Theme Selector: Dropdown or modal trigger".
  return null;
}


interface HeaderProps {
  onMobileMenuClick?: () => void
  onSidebarToggle?: () => void
  isSidebarCollapsed?: boolean
}

export function Header({ onMobileMenuClick, onSidebarToggle, isSidebarCollapsed }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center mx-auto max-w-7xl px-4">
        {/* Mobile Menu Trigger */}
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 md:hidden"
          onClick={onMobileMenuClick}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>

        {/* Logo */}
        <div className="mr-4 flex items-center gap-2">
          <Link href="/dashboard" className="flex items-center gap-2 transition-opacity hover:opacity-90">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
              <Gauge className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight hidden sm:inline-block">DriverOS</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        {/* Desktop Navigation - Moved to Sidebar */}
        <div className="flex-1" />

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive border-2 border-background" />
            <span className="sr-only">Notifications</span>
          </Button>

          <div className="w-px h-6 bg-border mx-1 hidden sm:block"></div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full ml-1">
                <Avatar className="h-9 w-9 border border-border">
                  <AvatarImage src="/placeholder-avatar.jpg" alt="@user" />
                  <AvatarFallback>KJ</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Kyle Jones</p>
                  <p className="text-xs leading-none text-muted-foreground">kyle@driveros.com</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
