/**
 * Card Component
 * Component card cơ bản
 */

"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { useAriaAttributes, useAriaLive } from "@/hooks/use-accessibility";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether card is interactive/clickable */
  interactive?: boolean;
  /** Whether card is selected */
  selected?: boolean;
  /** Whether card is disabled */
  disabled?: boolean;
  /** ARIA label for interactive cards */
  ariaLabel?: string;
  /** ARIA description */
  ariaDescription?: string;
  /** Whether to announce selection changes */
  announceChanges?: boolean;
  /** Card variant */
  variant?: "default" | "outline" | "ghost";
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      interactive = false,
      selected = false,
      disabled = false,
      ariaLabel,
      ariaDescription,
      announceChanges = false,
      variant = "default",
      onClick,
      onKeyDown,
      children,
      ...props
    },
    ref
  ) => {
    const { generateId } = useAriaAttributes();
    const { announce } = useAriaLive();

    const cardId = generateId("card");
    const descId = ariaDescription ? generateId("card-desc") : undefined;

    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) return;

      onClick?.(event);

      if (announceChanges && interactive) {
        announce(selected ? "Thẻ đã được chọn" : "Thẻ đã bỏ chọn", "polite");
      }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;

      onKeyDown?.(event);

      if (interactive && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        handleClick(event as any);
      }
    };

    const variantClasses = {
      default: "rounded-lg border bg-card text-card-foreground shadow-sm",
      outline: "rounded-lg border-2 bg-transparent text-card-foreground",
      ghost: "rounded-lg bg-transparent text-card-foreground",
    };

    return (
      <>
        <div
          id={cardId}
          ref={ref}
          className={cn(
            variantClasses[variant],
            interactive && [
              "cursor-pointer transition-colors duration-200",
              "hover:bg-accent hover:text-accent-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              selected && "bg-primary/10 border-primary",
              disabled && "cursor-not-allowed opacity-50",
            ],
            className
          )}
          onClick={interactive ? handleClick : onClick}
          onKeyDown={interactive ? handleKeyDown : onKeyDown}
          tabIndex={interactive && !disabled ? 0 : undefined}
          role={interactive ? "button" : undefined}
          aria-label={ariaLabel}
          aria-describedby={descId}
          aria-selected={interactive ? selected : undefined}
          aria-disabled={disabled}
          {...props}
        >
          {children}
        </div>

        {ariaDescription && (
          <div id={descId} className="sr-only">
            {ariaDescription}
          </div>
        )}
      </>
    );
  }
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-2xl font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  )
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
