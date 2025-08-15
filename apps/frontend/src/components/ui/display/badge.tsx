'use client';

import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80 dark:bg-[var(--color-badge-default)] dark:text-[var(--color-badge-default-foreground)]",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 dark:bg-[var(--color-badge-secondary)] dark:text-[var(--color-badge-secondary-foreground)]",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 dark:bg-[var(--color-badge-error)] dark:text-[var(--color-badge-error-foreground)]",
        success:
          "border-transparent bg-green-100 text-green-800 hover:bg-green-200 dark:bg-[var(--color-badge-success)] dark:text-[var(--color-badge-success-foreground)]",
        warning:
          "border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-[var(--color-badge-warning)] dark:text-[var(--color-badge-warning-foreground)]",
        outline: "text-foreground border-border hover:bg-accent hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  variant?: "default" | "secondary" | "destructive" | "success" | "warning" | "outline";
}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants } 

