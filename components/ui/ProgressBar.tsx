interface ProgressBarProps {
  progress: number // 0-100
  label?: string
  showPercentage?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'error'
}

export function ProgressBar({ 
  progress, 
  label, 
  showPercentage = true, 
  size = 'md',
  variant = 'default' 
}: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress))
  
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  }
  
  const variantClasses = {
    default: 'bg-primary',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500'
  }
  
  return (
    <div className="w-full space-y-2">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center text-sm">
          {label && <span className="text-muted-foreground">{label}</span>}
          {showPercentage && <span className="font-medium">{Math.round(clampedProgress)}%</span>}
        </div>
      )}
      
      <div className={`w-full bg-muted rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div 
          className={`${sizeClasses[size]} ${variantClasses[variant]} transition-all duration-300 ease-out`}
          style={{ width: `${clampedProgress}%` }}
          role="progressbar"
          aria-valuenow={Math.round(clampedProgress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label || `Progress: ${Math.round(clampedProgress)}%`}
        />
      </div>
    </div>
  )
}
