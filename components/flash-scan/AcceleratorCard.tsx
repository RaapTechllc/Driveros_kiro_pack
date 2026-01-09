interface AcceleratorCardProps {
  kpi: string
  notes: string
}

export function AcceleratorCard({ kpi, notes }: AcceleratorCardProps) {
  return (
    <div className="bg-primary text-primary-foreground p-6 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Weekly Accelerator</h3>
      <div className="text-2xl font-bold mb-2">{kpi}</div>
      <p className="text-sm opacity-90">{notes}</p>
    </div>
  )
}
