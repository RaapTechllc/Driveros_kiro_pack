import { MeetingTemplate } from '@/lib/types'
import { Button } from '@/components/ui/Button'

interface MeetingTemplateCardProps {
  template: MeetingTemplate
  onSelect: () => void
}

export function MeetingTemplateCard({ template, onSelect }: MeetingTemplateCardProps) {
  return (
    <div className="border rounded-lg p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold">{template.title}</h3>
          <p className="text-sm text-muted-foreground">{template.duration_min} minutes</p>
        </div>
        <Button onClick={onSelect}>Start Meeting</Button>
      </div>
      
      <p className="text-muted-foreground">{template.description}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <h4 className="font-medium mb-2">Agenda</h4>
          <ul className="space-y-1">
            {template.agenda.map((item, index) => (
              <li key={index} className="text-muted-foreground">
                {index + 1}. {item}
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="font-medium mb-2">Inputs</h4>
          <ul className="space-y-1">
            {template.inputs.map((input, index) => (
              <li key={index} className="text-muted-foreground">• {input}</li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="font-medium mb-2">Outputs</h4>
          <ul className="space-y-1">
            {template.outputs.map((output, index) => (
              <li key={index} className="text-muted-foreground">• {output}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
