import { QuickWin } from '@/lib/types'

interface QuickWinsListProps {
  wins: QuickWin[]
}

export function QuickWinsList({ wins }: QuickWinsListProps) {
  if (wins.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Quick Wins</h3>
        <p className="text-muted-foreground">No quick wins available.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Quick Wins</h3>
      <div className="space-y-3">
        {wins.map((win, index) => (
          <div key={index} className="border rounded-lg p-4" data-testid="quick-wins">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium">{win.title}</h4>
              <span className="text-xs bg-secondary px-2 py-1 rounded">
                {win.eta_days}d
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{win.why}</p>
            <div className="flex justify-between text-xs">
              <span>Owner: {win.owner_role}</span>
              <span>Engine: {win.engine}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
