import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'imported' | 'generated' | 'secondary' | 'outline'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-primary text-primary-foreground',
    imported: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    generated: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    secondary: 'bg-secondary text-secondary-foreground',
    outline: 'border border-input bg-background text-foreground'
  }

  return (
    <span className={cn(
      'inline-flex items-center px-2 py-1 text-xs font-medium rounded-full',
      variants[variant],
      className
    )}>
      {children}
    </span>
  )
}
