import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function UpgradePrompt() {
  return (
    <div className="bg-secondary p-6 rounded-lg text-center">
      <h3 className="text-lg font-semibold mb-2">Want Complete Analysis?</h3>
      <p className="text-muted-foreground mb-4">
        Get detailed engine scoring, goal alignment, and meeting templates in 15-20 minutes.
      </p>
      <Link href="/full-audit">
        <Button size="lg">
          Upgrade to Full Audit
        </Button>
      </Link>
    </div>
  )
}
