import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { saveGeneratedPlan } from '@/lib/year-board-generator'

interface EmptyStateProps {
  onPlanCreated: () => void
}

export function EmptyState({ onPlanCreated }: EmptyStateProps) {
  const handleGeneratePlan = () => {
    // Generate plan with sample North Star (in real app, would get from existing goals)
    const sampleNorthStarId = 'north-star-2026'
    saveGeneratedPlan(sampleNorthStarId)
    onPlanCreated()
  }

  const handleAddManually = () => {
    // TODO: Implement manual item creation in Slice 4
    console.log('Add manually clicked')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center space-y-8">
        {/* Main CTA */}
        <div className="space-y-4">
          <div className="text-6xl mb-4">📅</div>
          <h2 className="text-2xl font-semibold">Create Your Year Plan</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get a complete year-at-a-glance view with quarterly milestones, strategic plays, 
            and operating rituals all aligned to your North Star goal.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={handleGeneratePlan}>
            Generate my Year Plan
          </Button>
          <Button variant="outline" size="lg" onClick={handleAddManually}>
            Add Item Manually
          </Button>
        </div>

        {/* What gets generated */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-lg">What You'll Get</CardTitle>
            <CardDescription>
              AI-generated plan with strategic items across all quarters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>3-6 Milestones</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>6 Strategic Plays</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded"></div>
                  <span>4 Operating Rituals</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded"></div>
                  <span>4 Quarterly Tune-Ups</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Example Layout */}
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-lg">Year Board Preview</CardTitle>
            <CardDescription>
              Your board will show quarters (Q1-Q4) with department swimlanes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div className="font-medium text-center p-2 bg-secondary rounded">Q1</div>
              <div className="font-medium text-center p-2 bg-secondary rounded">Q2</div>
              <div className="font-medium text-center p-2 bg-secondary rounded">Q3</div>
              <div className="font-medium text-center p-2 bg-secondary rounded">Q4</div>
              
              <div className="col-span-4 grid grid-cols-5 gap-2 mt-2">
                <div className="font-medium p-2">Company</div>
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-center">Milestone</div>
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded text-center">Play</div>
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded text-center">Ritual</div>
                <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded text-center">Tune-Up</div>
                
                <div className="font-medium p-2">Ops</div>
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded"></div>
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded text-center">Play</div>
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded text-center">Ritual</div>
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded"></div>
                
                <div className="font-medium p-2">Sales</div>
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded"></div>
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded"></div>
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded text-center">Play</div>
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded"></div>
                
                <div className="font-medium p-2">Finance</div>
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded text-center">Play</div>
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded"></div>
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded"></div>
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
