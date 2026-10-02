import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-pill)] text-sm font-bold transition-[transform,box-shadow,background-color,color,border-color] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--color-brand-green)] text-[var(--color-bg-dark)] shadow-[var(--glow-green)] hover:bg-[var(--color-green-hover)] hover:shadow-[var(--glow-green-strong)] hover:-translate-y-0.5 active:translate-y-0",
        // Solid neutral - the second action next to a primary one.
        secondary:
          "bg-white/[0.07] text-[var(--color-text-white)] border border-[var(--color-line-strong)] hover:bg-white/[0.12] hover:border-white/30",
        outline:
          "bg-transparent text-[var(--color-text-white)] border border-[var(--color-line-strong)] hover:border-[var(--color-brand-green)] hover:text-[var(--color-brand-green)]",
        ghost: "bg-transparent hover:bg-[var(--color-card-dark)]",
        // WhatsApp's own green, so the channel is recognisable at a glance.
        whatsapp: "bg-[#25D366] text-[#06210f] hover:bg-[#3ee07a]",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-10 px-4 text-sm",
        lg: "h-12 px-7 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "primary",
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
