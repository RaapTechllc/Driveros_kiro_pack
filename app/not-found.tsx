import Link from 'next/link'
import { Button } from '@/components/ui/Button'

/**
 * Global 404 page
 * Shown when a route doesn't exist
 */
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold">404</h1>
          <h2 className="text-2xl font-semibold">Page Not Found</h2>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline">View Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
