'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export interface ContextMenuItem {
  id: string
  label: string
  icon?: React.ReactNode
  shortcut?: string
  disabled?: boolean
  danger?: boolean
  separator?: boolean
  onClick?: () => void
}

interface ContextMenuProps {
  items: ContextMenuItem[]
  x: number
  y: number
  onClose: () => void
}

export function ContextMenu({ items, x, y, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x, y })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    // Adjust position if menu would go off screen
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      let adjustedX = x
      let adjustedY = y

      if (x + rect.width > viewportWidth) {
        adjustedX = viewportWidth - rect.width - 10
      }
      if (y + rect.height > viewportHeight) {
        adjustedY = viewportHeight - rect.height - 10
      }

      setPosition({ x: adjustedX, y: adjustedY })
    }
  }, [x, y])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }

      // Arrow key navigation
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        const menuItems = menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not([disabled])')
        if (!menuItems || menuItems.length === 0) return

        const currentIndex = Array.from(menuItems).findIndex(item => item === document.activeElement)
        let nextIndex: number

        if (e.key === 'ArrowDown') {
          nextIndex = currentIndex < menuItems.length - 1 ? currentIndex + 1 : 0
        } else {
          nextIndex = currentIndex > 0 ? currentIndex - 1 : menuItems.length - 1
        }

        menuItems[nextIndex]?.focus()
      }
    }

    const handleScroll = () => {
      onClose()
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('scroll', handleScroll, true)

    // Focus first menu item when menu opens
    requestAnimationFrame(() => {
      const firstItem = menuRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]:not([disabled])')
      firstItem?.focus()
    })

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('scroll', handleScroll, true)
    }
  }, [onClose])

  const handleItemClick = (item: ContextMenuItem) => {
    if (!item.disabled && item.onClick) {
      item.onClick()
      onClose()
    }
  }

  if (!mounted) return null

  const menu = (
    <div
      ref={menuRef}
      role="menu"
      aria-label="Context menu"
      className="fixed z-[100] min-w-[180px] overflow-hidden rounded-lg border bg-popover p-1 shadow-lg animate-in fade-in-0 zoom-in-95"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {items.map((item, index) => {
        if (item.separator) {
          return (
            <div
              key={`separator-${index}`}
              role="separator"
              className="my-1 h-px bg-border"
            />
          )
        }

        return (
          <button
            key={item.id}
            role="menuitem"
            onClick={() => handleItemClick(item)}
            disabled={item.disabled}
            aria-disabled={item.disabled}
            tabIndex={item.disabled ? -1 : 0}
            className={`
              w-full flex items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-sm
              outline-none transition-colors
              ${item.disabled
                ? 'opacity-50 cursor-not-allowed'
                : item.danger
                  ? 'text-destructive hover:bg-destructive/10 focus:bg-destructive/10'
                  : 'hover:bg-accent focus:bg-accent'
              }
            `}
          >
            <span className="flex items-center gap-2">
              {item.icon && (
                <span className="w-4 h-4 flex items-center justify-center" aria-hidden="true">
                  {item.icon}
                </span>
              )}
              {item.label}
            </span>
            {item.shortcut && (
              <span className="ml-auto text-xs text-muted-foreground" aria-hidden="true">
                {item.shortcut}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )

  return createPortal(menu, document.body)
}

// Hook for managing context menu state
export function useContextMenu() {
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    data?: unknown
  } | null>(null)

  const handleContextMenu = (e: React.MouseEvent, data?: unknown) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      data
    })
  }

  const closeContextMenu = () => {
    setContextMenu(null)
  }

  return {
    contextMenu,
    handleContextMenu,
    closeContextMenu
  }
}
