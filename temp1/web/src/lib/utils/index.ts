import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Re-export utilities
export * from '@/lib/utils/logger';
export * from '@/lib/utils/mapid-decoder';
export * from '@/lib/utils/question-answer-extractor';
export * from '@/lib/utils/latex-parser';
export * from '@/lib/utils/latex-parser-brackets';
export * from '@/lib/utils/log-cache';
