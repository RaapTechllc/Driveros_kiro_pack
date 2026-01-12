import { Sparkles } from 'lucide-react'

interface AIBadgeProps {
  confidence?: number
  variant?: 'default' | 'compact'
  label?: string
}

export function AIBadge({ confidence = 94, variant = 'default', label = 'AI-Powered' }: AIBadgeProps) {
  if (variant === 'compact') {
    return (
      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
        <Sparkles className="w-3 h-3 text-purple-500" />
        <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
          AI
        </span>
      </div>
    )
  }

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
      <Sparkles className="w-4 h-4 text-purple-500 animate-pulse" />
      <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
        {label}
      </span>
      {confidence && (
        <>
          <span className="text-purple-300">•</span>
          <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
            {confidence}% confidence
          </span>
        </>
      )}
    </div>
  )
}
