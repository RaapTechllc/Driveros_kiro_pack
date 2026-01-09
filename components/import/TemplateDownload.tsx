import { generateTemplateCSV } from '@/lib/csv-import'
import { Button } from '@/components/ui/Button'

interface TemplateDownloadProps {
  type: 'actions' | 'goals'
  onDownload: () => void
}

export function TemplateDownload({ type, onDownload }: TemplateDownloadProps) {
  const handleDownload = () => {
    const csvContent = generateTemplateCSV(type)
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${type}-template.csv`
    a.click()
    URL.revokeObjectURL(url)
    onDownload()
  }

  const templateInfo = {
    actions: {
      title: 'Actions Template',
      description: 'Template for importing actions with required fields and examples',
      fields: [
        'title (required) - Action description',
        'why (required) - One sentence explanation',
        'owner_role (required) - Owner, Ops, Sales, or Finance',
        'engine (required) - Leadership, Operations, Marketing & Sales, Finance, or Personnel',
        'eta_days (required) - Number of days to complete (1-365)',
        'status (required) - todo, doing, or done',
        'due_date (optional) - YYYY-MM-DD format'
      ]
    },
    goals: {
      title: 'Goals Template',
      description: 'Template for importing goals with North Star and department goals',
      fields: [
        'level (required) - north_star or department',
        'department (optional) - Ops, Sales/Marketing, or Finance (for department goals)',
        'title (required) - Goal description',
        'metric (optional) - Measurement description',
        'current (optional) - Current value (number)',
        'target (optional) - Target value (number)',
        'due_date (optional) - YYYY-MM-DD format',
        'alignment_statement (required for department goals) - How this supports North Star'
      ]
    }
  }

  const info = templateInfo[type]

  return (
    <div className="bg-secondary p-6 rounded-lg space-y-4">
      <div>
        <h3 className="text-lg font-semibold">{info.title}</h3>
        <p className="text-sm text-muted-foreground">{info.description}</p>
      </div>

      <div>
        <h4 className="font-medium mb-2">Required Fields:</h4>
        <ul className="text-sm space-y-1">
          {info.fields.map((field, index) => (
            <li key={index} className="text-muted-foreground">• {field}</li>
          ))}
        </ul>
      </div>

      <Button onClick={handleDownload} variant="outline">
        Download Template
      </Button>
    </div>
  )
}
