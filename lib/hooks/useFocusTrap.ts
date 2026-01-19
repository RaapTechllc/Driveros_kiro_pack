'use client'

import { useEffect, useRef, useCallback } from 'react'

const FOCUSABLE_ELEMENTS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

interface UseFocusTrapOptions {
  enabled?: boolean
  returnFocusOnDeactivate?: boolean
}

/**
 * Custom hook for trapping focus within a container element.
 * Useful for modals, dialogs, and other overlay components to ensure
 * keyboard users can't tab outside the container while it's open.
 */
export function useFocusTrap<T extends HTMLElement = HTMLDivElement>(
  options: UseFocusTrapOptions = {}
) {
  const { enabled = true, returnFocusOnDeactivate = true } = options
  const containerRef = useRef<T>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return []
    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS)
    ).filter(el => el.offsetParent !== null) // Filter out hidden elements
  }, [])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled || event.key !== 'Tab') return

      const focusableElements = getFocusableElements()
      if (focusableElements.length === 0) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      // Shift + Tab - move focus to previous element
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault()
          lastElement.focus()
        }
      } else {
        // Tab - move focus to next element
        if (document.activeElement === lastElement) {
          event.preventDefault()
          firstElement.focus()
        }
      }
    },
    [enabled, getFocusableElements]
  )

  useEffect(() => {
    if (!enabled) return

    // Store the currently focused element to restore later
    previousActiveElement.current = document.activeElement as HTMLElement

    // Focus the first focusable element in the container
    const focusableElements = getFocusableElements()
    if (focusableElements.length > 0) {
      // Small delay to ensure the element is rendered
      requestAnimationFrame(() => {
        focusableElements[0].focus()
      })
    }

    // Add keydown listener for tab trapping
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)

      // Return focus to the previously focused element
      if (returnFocusOnDeactivate && previousActiveElement.current) {
        previousActiveElement.current.focus()
      }
    }
  }, [enabled, handleKeyDown, getFocusableElements, returnFocusOnDeactivate])

  return containerRef
}
