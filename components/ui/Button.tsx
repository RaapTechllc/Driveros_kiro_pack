import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-bold tracking-wide ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-orange-600 to-orange-500 text-white hover:from-orange-500 hover:to-yellow-500 shadow-[0_0_20px_rgba(255,71,19,0.3)] hover:shadow-[0_0_30px_rgba(255,71,19,0.5)]",
        destructive:
          "bg-red-600 text-white hover:bg-red-700",
        outline:
          "border-2 border-gray-800 dark:border-gray-700 bg-transparent hover:border-primary hover:bg-primary/10 transition-all",
        secondary:
          "bg-gray-800 dark:bg-gray-700 text-white hover:bg-gray-700 dark:hover:bg-gray-600",
        ghost: "hover:bg-gray-800/50 dark:hover:bg-gray-700/50 hover:text-white",
        link: "text-primary underline-offset-4 hover:underline",
        racing: "relative overflow-hidden bg-black border-2 border-primary text-primary hover:text-white before:absolute before:inset-0 before:bg-gradient-to-r before:from-orange-600 before:to-yellow-500 before:translate-x-[-100%] hover:before:translate-x-0 before:transition-transform before:duration-300",
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
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
