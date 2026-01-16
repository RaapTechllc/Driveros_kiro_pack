'use client'

import { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { AlertTriangle, RefreshCw, Home, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface PageErrorBoundaryProps {
  children: ReactNode
  pageName?: string
  onReset?: () => void
}

interface PageErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: string | null
}

/**
 * Page-level error boundary with recovery options
 * Use this to wrap individual pages to prevent full app crashes
 */
export class PageErrorBoundary extends Component<PageErrorBoundaryProps, PageErrorBoundaryState> {
  constructor(props: PageErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<PageErrorBoundaryState> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for debugging
    console.error(`[PageError] ${this.props.pageName || 'Unknown page'}:`, error, errorInfo)

    this.setState({
      errorInfo: errorInfo.componentStack || null
    })
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    this.props.onReset?.()
  }

  handleClearStorageAndRetry = () => {
    // Clear potentially corrupted localStorage data
    const keysToCheck = [
      'full-audit-result',
      'flash-scan-result',
      'imported-actions',
      'imported-goals',
      'action-statuses'
    ]

    keysToCheck.forEach(key => {
      try {
        const data = localStorage.getItem(key)
        if (data) {
          JSON.parse(data) // Test if parseable
        }
      } catch {
        // Remove corrupted data
        localStorage.removeItem(key)
        console.info(`[Recovery] Removed corrupted key: ${key}`)
      }
    })

    this.handleRetry()
  }

  render() {
    if (this.state.hasError) {
      const isDataError = this.state.error?.message?.includes('JSON') ||
                          this.state.error?.message?.includes('parse') ||
                          this.state.error?.message?.includes('localStorage')

      return (
        <div className="min-h-[50vh] flex items-center justify-center p-8">
          <div className="max-w-md w-full space-y-6 text-center">
            {/* Error Icon */}
            <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>

            {/* Error Message */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Something went wrong</h2>
              <p className="text-muted-foreground">
                {isDataError
                  ? 'There was a problem loading your data. This might be caused by corrupted saved data.'
                  : `An error occurred on the ${this.props.pageName || 'page'}. Please try again.`
                }
              </p>
            </div>

            {/* Error Details (collapsible) */}
            {this.state.error && (
              <details className="text-left bg-muted/50 rounded-lg p-4">
                <summary className="cursor-pointer text-sm font-medium">
                  Technical Details
                </summary>
                <pre className="mt-2 text-xs overflow-auto max-h-32 text-muted-foreground">
                  {this.state.error.message}
                </pre>
              </details>
            )}

            {/* Recovery Actions */}
            <div className="flex flex-col gap-3">
              <Button onClick={this.handleRetry} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>

              {isDataError && (
                <Button
                  onClick={this.handleClearStorageAndRetry}
                  variant="outline"
                  className="w-full"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Corrupted Data & Retry
                </Button>
              )}

              <Link href="/dashboard" className="w-full">
                <Button variant="outline" className="w-full">
                  <Home className="w-4 h-4 mr-2" />
                  Return to Dashboard
                </Button>
              </Link>
            </div>

            {/* Help Text */}
            <p className="text-xs text-muted-foreground">
              If this problem persists, try clearing your browser cache or contact support.
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * HOC to wrap pages with error boundary
 */
export function withPageErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  pageName: string
) {
  return function WithErrorBoundary(props: P) {
    return (
      <PageErrorBoundary pageName={pageName}>
        <WrappedComponent {...props} />
      </PageErrorBoundary>
    )
  }
}
