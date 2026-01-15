import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function UpgradePrompt() {
  return (
    <div className="bg-secondary p-6 rounded-lg text-center">
      <h3 className="text-lg font-semibold mb-2">Want the full engine scorecard?</h3>
      <p className="text-muted-foreground mb-4">
        Turn this quick scan into a complete audit: 5-engine scoring, risk flags, and a prioritized action plan you can run this week.
      </p>
      <Link href="/full-audit">
        <Button size="lg">
          Unlock Full Audit
        </Button>
      </Link>
    </div>
  )
}
