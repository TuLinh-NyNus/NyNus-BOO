'use client';

import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

const EnhancedCheckbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      // Base styling
      'peer h-4 w-4 shrink-0 rounded-sm border-2 ring-offset-background',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      // Light theme
      'border-slate-300 bg-white',
      'data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600',
      'data-[state=checked]:text-white',
      // Dark theme
      'dark:border-slate-600 dark:bg-slate-800',
      'dark:data-[state=checked]:bg-blue-500 dark:data-[state=checked]:border-blue-500',
      'dark:data-[state=checked]:text-white',
      // Hover states
      'hover:border-slate-400 dark:hover:border-slate-500',
      // Transition
      'transition-all duration-200',
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn(
        'flex items-center justify-center text-current',
        // Ensure icon is visible
        'data-[state=checked]:opacity-100 opacity-0',
        'transition-opacity duration-200'
      )}
    >
      <Check className="h-3.5 w-3.5 font-bold stroke-[3]" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
EnhancedCheckbox.displayName = CheckboxPrimitive.Root.displayName;

export { EnhancedCheckbox };
