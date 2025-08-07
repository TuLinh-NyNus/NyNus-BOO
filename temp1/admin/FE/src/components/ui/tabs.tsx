"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as React from "react";

import { cn } from "@/lib/utils";
import { useAccessibleTabs, useAriaLive } from "@/hooks/use-accessibility";

interface TabsProps extends React.ComponentProps<typeof TabsPrimitive.Root> {
  /** Number of tabs for keyboard navigation */
  tabCount?: number;
  /** Whether to announce tab changes */
  announceChanges?: boolean;
}

function Tabs({ className, tabCount = 0, announceChanges = true, ...props }: TabsProps) {
  const { announce } = useAriaLive();

  const handleValueChange = (value: string) => {
    props.onValueChange?.(value);

    if (announceChanges) {
      announce(`Đã chuyển sang tab ${value}`, "polite");
    }
  };

  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      onValueChange={handleValueChange}
      {...props}
    />
  );
}

interface TabsListProps extends React.ComponentProps<typeof TabsPrimitive.List> {
  /** Number of tabs for keyboard navigation */
  tabCount?: number;
}

function TabsList({ className, tabCount = 0, ...props }: TabsListProps) {
  const { handleTabKeyDown } = useAccessibleTabs();
  const tabRefs = React.useRef<(HTMLElement | null)[]>([]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    handleTabKeyDown(event, tabRefs.current.filter(Boolean) as HTMLElement[]);
  };

  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
        className
      )}
      onKeyDown={handleKeyDown}
      role="tablist"
      aria-orientation="horizontal"
      {...props}
    />
  );
}

interface TabsTriggerProps extends React.ComponentProps<typeof TabsPrimitive.Trigger> {
  /** Tab index for keyboard navigation */
  tabIndex?: number;
}

function TabsTrigger({ className, tabIndex, ...props }: TabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      role="tab"
      tabIndex={tabIndex}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
