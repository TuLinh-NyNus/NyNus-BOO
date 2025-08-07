/**
 * Checkbox Component
 * Simple checkbox component cho admin interface
 *
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React from "react";
import { cn } from "@/lib/utils";

/**
 * Props for Checkbox component
 */
interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
  "aria-label"?: string;
}

/**
 * Checkbox Component
 * Simple checkbox với proper accessibility
 */
export function Checkbox({
  checked = false,
  onCheckedChange,
  disabled = false,
  className,
  id,
  "aria-label": ariaLabel,
}: CheckboxProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onCheckedChange) {
      onCheckedChange(event.target.checked);
    }
  };

  return (
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={handleChange}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        "h-4 w-4 rounded border border-gray-300 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50",
        className
      )}
    />
  );
}
