import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-bold tracking-wide ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 transform-gpu",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-orange-600 to-orange-500 text-white hover:from-orange-500 hover:to-yellow-500 shadow-[0_0_20px_rgba(255,71,19,0.3)] hover:shadow-[0_0_30px_rgba(255,71,19,0.5)] active:shadow-[0_0_15px_rgba(255,71,19,0.6)]",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
        outline:
          "border-2 border-gray-800 dark:border-gray-700 bg-transparent hover:border-primary hover:bg-primary/10 transition-all active:bg-primary/20",
        secondary:
          "bg-gray-800 dark:bg-gray-700 text-white hover:bg-gray-700 dark:hover:bg-gray-600 active:bg-gray-900",
        ghost: "hover:bg-gray-800/50 dark:hover:bg-gray-700/50 hover:text-white active:bg-gray-800/70",
        link: "text-primary underline-offset-4 hover:underline active:text-primary/80",
        racing: "relative overflow-hidden bg-black border-2 border-primary text-primary hover:text-white before:absolute before:inset-0 before:bg-gradient-to-r before:from-orange-600 before:to-yellow-500 before:translate-x-[-100%] hover:before:translate-x-0 before:transition-transform before:duration-300 active:before:translate-x-[10%]",
      },
      size: {
        default: "h-11 px-6 py-3",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-14 rounded-xl px-10 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  success?: boolean
  error?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, success, error, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    // Determine the current state classes
    const stateClasses = React.useMemo(() => {
      if (success) return "bg-green-600 hover:bg-green-600 shadow-[0_0_20px_rgba(34,197,94,0.4)]"
      if (error) return "bg-red-600 hover:bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.4)]"
      return ""
    }, [success, error])
    
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size }),
          stateClasses,
          loading && "cursor-wait",
          className
        )}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {success && (
          <svg
            className="-ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
        {error && (
          <svg
            className="-ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        )}
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
