import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  success?: boolean
  showCount?: boolean
  maxLength?: number
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, success, showCount, maxLength, ...props }, ref) => {
    const [value, setValue] = React.useState(props.defaultValue || '')
    const [isFocused, setIsFocused] = React.useState(false)
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value)
      props.onChange?.(e)
    }
    
    const currentLength = String(value).length
    const isNearLimit = maxLength && currentLength > maxLength * 0.8
    
    return (
      <div className="relative">
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50",
            // Focus states with racing orange glow
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:border-orange-500",
            // Success state
            success && "border-green-500 focus-visible:ring-green-500 focus-visible:border-green-500",
            // Error state with shake animation
            error && "border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500 animate-shake",
            // Enhanced focus glow
            isFocused && "shadow-[0_0_0_3px_rgba(255,71,19,0.1)]",
            className
          )}
          ref={ref}
          value={value}
          onChange={handleChange}
          onFocus={(e) => {
            setIsFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setIsFocused(false)
            props.onBlur?.(e)
          }}
          maxLength={maxLength}
          {...props}
        />
        
        {/* Success checkmark */}
        {success && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 animate-slide-in">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        
        {/* Error icon */}
        {error && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )}
        
        {/* Character counter */}
        {showCount && maxLength && (
          <div className="absolute right-3 -bottom-5 text-xs text-muted-foreground">
            <span className={cn(
              "transition-colors duration-200",
              isNearLimit && "text-orange-500 font-medium",
              currentLength >= maxLength && "text-red-500 font-bold"
            )}>
              {currentLength}/{maxLength}
            </span>
          </div>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
