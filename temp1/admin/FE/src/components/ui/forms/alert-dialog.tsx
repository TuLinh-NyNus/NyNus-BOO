/**
 * Alert Dialog Components
 * Simple alert dialog components cho admin interface
 *
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, createContext, useContext } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

/**
 * Alert Dialog Context
 */
interface AlertDialogContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const AlertDialogContext = createContext<AlertDialogContextType | null>(null);

/**
 * Alert Dialog Root Component
 */
interface AlertDialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AlertDialog({ children, open: controlledOpen, onOpenChange }: AlertDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  return (
    <AlertDialogContext.Provider value={{ open, setOpen }}>{children}</AlertDialogContext.Provider>
  );
}

/**
 * Alert Dialog Trigger
 */
interface AlertDialogTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

export function AlertDialogTrigger({ children, asChild }: AlertDialogTriggerProps) {
  const context = useContext(AlertDialogContext);
  if (!context) throw new Error("AlertDialogTrigger must be used within AlertDialog");

  const { setOpen } = context;

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: () => setOpen(true),
    } as any);
  }

  return <button onClick={() => setOpen(true)}>{children}</button>;
}

/**
 * Alert Dialog Content
 */
interface AlertDialogContentProps {
  children: React.ReactNode;
  className?: string;
}

export function AlertDialogContent({ children, className }: AlertDialogContentProps) {
  const context = useContext(AlertDialogContext);
  if (!context) throw new Error("AlertDialogContent must be used within AlertDialog");

  const { open, setOpen } = context;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={() => setOpen(false)} />

      {/* Dialog */}
      <div
        className={cn("relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6", className)}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Alert Dialog Header
 */
interface AlertDialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function AlertDialogHeader({ children, className }: AlertDialogHeaderProps) {
  return <div className={cn("space-y-2 mb-4", className)}>{children}</div>;
}

/**
 * Alert Dialog Title
 */
interface AlertDialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function AlertDialogTitle({ children, className }: AlertDialogTitleProps) {
  return <h2 className={cn("text-lg font-semibold", className)}>{children}</h2>;
}

/**
 * Alert Dialog Description
 */
interface AlertDialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function AlertDialogDescription({ children, className }: AlertDialogDescriptionProps) {
  return <p className={cn("text-sm text-muted-foreground", className)}>{children}</p>;
}

/**
 * Alert Dialog Footer
 */
interface AlertDialogFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function AlertDialogFooter({ children, className }: AlertDialogFooterProps) {
  return <div className={cn("flex justify-end gap-2 mt-6", className)}>{children}</div>;
}

/**
 * Alert Dialog Cancel Button
 */
interface AlertDialogCancelProps {
  children: React.ReactNode;
  onClick?: () => void;
}

export function AlertDialogCancel({ children, onClick }: AlertDialogCancelProps) {
  const context = useContext(AlertDialogContext);
  if (!context) throw new Error("AlertDialogCancel must be used within AlertDialog");

  const { setOpen } = context;

  const handleClick = () => {
    if (onClick) onClick();
    setOpen(false);
  };

  return (
    <Button variant="outline" onClick={handleClick}>
      {children}
    </Button>
  );
}

/**
 * Alert Dialog Action Button
 */
interface AlertDialogActionProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function AlertDialogAction({ children, onClick, className }: AlertDialogActionProps) {
  const context = useContext(AlertDialogContext);
  if (!context) throw new Error("AlertDialogAction must be used within AlertDialog");

  const { setOpen } = context;

  const handleClick = () => {
    if (onClick) onClick();
    setOpen(false);
  };

  return (
    <Button onClick={handleClick} className={className}>
      {children}
    </Button>
  );
}
