/**
 * Button Component
 * Component button sử dụng class-variance-authority
 */

import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";
import { useAriaAttributes, useAriaLive } from "@/hooks/use-accessibility";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Loading text */
  loadingText?: string;
  /** Whether button is pressed (for toggle buttons) */
  pressed?: boolean;
  /** Whether button controls an expanded element */
  expanded?: boolean;
  /** ID of element controlled by this button */
  controls?: string;
  /** Whether to announce state changes */
  announceChanges?: boolean;
  /** Custom ARIA label */
  ariaLabel?: string;
  /** ARIA description */
  ariaDescription?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      loadingText,
      pressed,
      expanded,
      controls,
      announceChanges = false,
      ariaLabel,
      ariaDescription,
      children,
      onClick,
      disabled,
      ...props
    },
    ref
  ) => {
    const { generateId } = useAriaAttributes();
    const { announce } = useAriaLive();

    const buttonId = generateId("button");
    const descId = ariaDescription ? generateId("button-desc") : undefined;

    const isDisabled = disabled || loading;

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) return;

      onClick?.(event);

      if (announceChanges) {
        if (pressed !== undefined) {
          announce(pressed ? "Đã bỏ chọn" : "Đã chọn", "polite");
        } else if (expanded !== undefined) {
          announce(expanded ? "Đã thu gọn" : "Đã mở rộng", "polite");
        }
      }
    };

    const Comp = asChild ? Slot : "button";

    return (
      <>
        <Comp
          id={buttonId}
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          onClick={handleClick}
          disabled={isDisabled}
          aria-label={ariaLabel}
          aria-describedby={descId}
          aria-pressed={pressed}
          aria-expanded={expanded}
          aria-controls={controls}
          aria-busy={loading}
          {...props}
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
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
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {loadingText || children}
              <span className="sr-only">Đang tải...</span>
            </>
          ) : (
            children
          )}
        </Comp>

        {ariaDescription && (
          <div id={descId} className="sr-only">
            {ariaDescription}
          </div>
        )}
      </>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
