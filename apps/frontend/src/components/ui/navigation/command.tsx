/**
 * Command Component
 * Simple command palette implementation
 */

"use client";

import React from "react";

/**
 * Command Root Component
 */
interface CommandProps {
  children: React.ReactNode;
  className?: string;
}

export function Command({ children, className = "" }: CommandProps) {
  return (
    <div className={`bg-white border rounded-lg shadow-lg ${className}`}>
      {children}
    </div>
  );
}

/**
 * Command Input Component
 */
interface CommandInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function CommandInput({ 
  placeholder, 
  value, 
  onChange, 
  className = "" 
}: CommandInputProps) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className={`w-full p-3 border-b border-gray-200 outline-none ${className}`}
    />
  );
}

/**
 * Command List Component
 */
interface CommandListProps {
  children: React.ReactNode;
  className?: string;
}

export function CommandList({ children, className = "" }: CommandListProps) {
  return (
    <div className={`max-h-64 overflow-y-auto ${className}`}>
      {children}
    </div>
  );
}

/**
 * Command Group Component
 */
interface CommandGroupProps {
  heading?: string;
  children: React.ReactNode;
  className?: string;
}

export function CommandGroup({ heading, children, className = "" }: CommandGroupProps) {
  return (
    <div className={className}>
      {heading && (
        <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
          {heading}
        </div>
      )}
      {children}
    </div>
  );
}

/**
 * Command Item Component
 */
interface CommandItemProps {
  children: React.ReactNode;
  onSelect?: () => void;
  className?: string;
}

export function CommandItem({ children, onSelect, className = "" }: CommandItemProps) {
  return (
    <div
      onClick={onSelect}
      className={`px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * Command Empty Component
 */
interface CommandEmptyProps {
  children: React.ReactNode;
  className?: string;
}

export function CommandEmpty({ children, className = "" }: CommandEmptyProps) {
  return (
    <div className={`px-3 py-8 text-center text-gray-500 ${className}`}>
      {children}
    </div>
  );
}
