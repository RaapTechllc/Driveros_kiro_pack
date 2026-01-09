import { useState } from 'react'
import { MeetingTemplate, MeetingFormData, QuickWin } from '@/lib/types'
import { generateMeetingActions, saveMeetingNotes } from '@/lib/meeting-templates'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface MeetingFormProps {
  template: MeetingTemplate
  acceleratorKPI?: string
  onComplete: (actions: QuickWin[]) => void
  onBack: () => void
}

export function MeetingForm({ template, acceleratorKPI, onComplete, onBack }: MeetingFormProps) {
  const [formData, setFormData] = useState<MeetingFormData>({})
  const [notes, setNotes] = useState('')
  const [decisions, setDecisions] = useState<string[]>([''])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const actions = generateMeetingActions(template.type, formData, acceleratorKPI)
    const cleanDecisions = decisions.filter(d => d.trim())
    
    saveMeetingNotes(template.type, notes, cleanDecisions, actions)
    onComplete(actions)
  }

  const addDecision = () => {
    setDecisions([...decisions, ''])
  }

  const updateDecision = (index: number, value: string) => {
    const newDecisions = [...decisions]
    newDecisions[index] = value
    setDecisions(newDecisions)
  }

  const removeDecision = (index: number) => {
    setDecisions(decisions.filter((_, i) => i !== index))
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{template.title}</h2>
          <p className="text-muted-foreground">{template.duration_min} minutes • {template.description}</p>
        </div>
        <Button variant="outline" onClick={onBack}>Back</Button>
      </div>

      <div className="bg-secondary p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Meeting Agenda</h3>
        <ol className="space-y-1">
          {template.agenda.map((item, index) => (
            <li key={index} className="text-sm">
              {index + 1}. {item}
            </li>
          ))}
        </ol>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dynamic inputs based on meeting type */}
        {template.type === 'warm_up' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Yesterday's result (1 line)</label>
              <Input
                value={formData.yesterday_result || ''}
                onChange={(e) => setFormData({...formData, yesterday_result: e.target.value})}
                placeholder="What did you accomplish yesterday toward the Accelerator?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Today's focus (1 line)</label>
              <Input
                value={formData.today_focus || ''}
                onChange={(e) => setFormData({...formData, today_focus: e.target.value})}
                placeholder="What's your main focus today?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Top brake (1 line)</label>
              <Input
                value={formData.top_brake || ''}
                onChange={(e) => setFormData({...formData, top_brake: e.target.value})}
                placeholder="What's blocking progress today?"
              />
            </div>
          </div>
        )}

        {template.type === 'pit_stop' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Accelerator Result</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="accelerator_result"
                    value="win"
                    checked={formData.accelerator_result === 'win'}
                    onChange={(e) => setFormData({...formData, accelerator_result: e.target.value as 'win' | 'miss'})}
                    className="mr-2"
                  />
                  Win - Hit weekly target
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="accelerator_result"
                    value="miss"
                    checked={formData.accelerator_result === 'miss'}
                    onChange={(e) => setFormData({...formData, accelerator_result: e.target.value as 'win' | 'miss'})}
                    className="mr-2"
                  />
                  Miss - Didn't hit target
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Actual vs Target</label>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  value={formData.accelerator_actual || ''}
                  onChange={(e) => setFormData({...formData, accelerator_actual: e.target.value})}
                  placeholder="Actual result"
                />
                <Input
                  value={formData.accelerator_target || ''}
                  onChange={(e) => setFormData({...formData, accelerator_target: e.target.value})}
                  placeholder="Target"
                />
              </div>
            </div>
          </div>
        )}

        {template.type === 'full_tune_up' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">North Star Review</label>
              <Input
                value={formData.north_star_review || ''}
                onChange={(e) => setFormData({...formData, north_star_review: e.target.value})}
                placeholder="Is the North Star still the right goal?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Accelerator Review</label>
              <Input
                value={formData.accelerator_review || ''}
                onChange={(e) => setFormData({...formData, accelerator_review: e.target.value})}
                placeholder="Is the weekly Accelerator still the right lever?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Goal Alignment</label>
              <Input
                value={formData.goal_alignment || ''}
                onChange={(e) => setFormData({...formData, goal_alignment: e.target.value})}
                placeholder="How well do department goals align with North Star?"
              />
            </div>
          </div>
        )}

        {/* Meeting Notes */}
        <div>
          <label className="block text-sm font-medium mb-2">Meeting Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 border rounded-md min-h-[100px]"
            placeholder="Key discussion points, insights, concerns..."
          />
        </div>

        {/* Decisions */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium">Decisions Made</label>
            <Button type="button" variant="outline" size="sm" onClick={addDecision}>
              Add Decision
            </Button>
          </div>
          <div className="space-y-2">
            {decisions.map((decision, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={decision}
                  onChange={(e) => updateDecision(index, e.target.value)}
                  placeholder="Decision or commitment made..."
                />
                {decisions.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeDecision(index)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full">
          Complete Meeting & Generate Actions
        </Button>
      </form>
    </div>
  )
}
