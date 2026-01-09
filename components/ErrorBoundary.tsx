'use client'

import React, { Component, ReactNode } from 'react'
import { Button } from './ui/Button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onReset?: () => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

/**
 * Error Boundary component that catches React errors in child components
 * Prevents entire app from crashing when a component fails
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so next render shows fallback UI
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // You could send to error tracking service here
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } })

    this.setState({
      error,
      errorInfo
    })
  }

  handleReset = () => {
    // Reset error state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })

    // Call custom reset handler if provided
    if (this.props.onReset) {
      this.props.onReset()
    }
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full space-y-6 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-red-600">
                Something went wrong
              </h1>
              <p className="text-muted-foreground">
                An unexpected error occurred. You can try refreshing the page or going back.
              </p>
            </div>

            {/* Show error details in development */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left bg-muted p-4 rounded-lg">
                <summary className="cursor-pointer font-medium mb-2">
                  Error Details (Dev Only)
                </summary>
                <pre className="text-xs overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="flex gap-3 justify-center">
              <Button onClick={this.handleReset} variant="default">
                Try Again
              </Button>
              <Button
                onClick={() => window.location.href = '/'}
                variant="outline"
              >
                Go Home
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Hook-friendly wrapper for ErrorBoundary
 * Usage: <ErrorBoundaryWrapper>{children}</ErrorBoundaryWrapper>
 */
export function ErrorBoundaryWrapper({
  children,
  onReset
}: {
  children: ReactNode
  onReset?: () => void
}) {
  return (
    <ErrorBoundary onReset={onReset}>
      {children}
    </ErrorBoundary>
  )
}
