/**
 * Classification Chips (Type/Difficulty/Grade/Subject)
 * Nhóm chip phân loại gọn, bấm 1 phát áp dụng filter
 */

'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface Chip {
  key: string;
  label: string;
  colorClass: string;
  onClick: () => void;
}

interface ClassificationChipsProps {
  className?: string;
}

export function ClassificationChips({ className }: ClassificationChipsProps) {
  const chips = useMemo<Chip[]>(() => {
    // TODO: Lấy counts thật từ filterSummary. Tạm thời chỉ điều hướng filter.
    const mk = (key: string, label: string, qs: Record<string, string>, colorClass: string): Chip => ({
      key,
      label,
      colorClass,
      onClick: () => {
        const url = new URL(window.location.origin + '/questions/browse');
        Object.entries(qs).forEach(([k, v]) => url.searchParams.set(k, v));
        window.location.href = url.toString();
      }
    });

    return [
      // Types
      mk('type-mc', 'Trắc nghiệm', { type: 'MC' }, 'bg-indigo-100 text-indigo-800 border-indigo-200'),
      mk('type-tf', 'Đúng/Sai', { type: 'TF' }, 'bg-indigo-100 text-indigo-800 border-indigo-200'),
      mk('type-sa', 'Tự luận ngắn', { type: 'SA' }, 'bg-indigo-100 text-indigo-800 border-indigo-200'),
      mk('type-es', 'Tự luận', { type: 'ES' }, 'bg-indigo-100 text-indigo-800 border-indigo-200'),

      // Difficulty
      mk('diff-easy', 'Dễ', { difficulty: 'EASY' }, 'bg-red-100 text-red-800 border-red-200'),
      mk('diff-medium', 'Trung bình', { difficulty: 'MEDIUM' }, 'bg-red-100 text-red-800 border-red-200'),
      mk('diff-hard', 'Khó', { difficulty: 'HARD' }, 'bg-red-100 text-red-800 border-red-200'),

      // Grade
      mk('grade-10', 'Lớp 10', { grade: 'lop-10' }, 'bg-orange-100 text-orange-800 border-orange-200'),
      mk('grade-11', 'Lớp 11', { grade: 'lop-11' }, 'bg-orange-100 text-orange-800 border-orange-200'),
      mk('grade-12', 'Lớp 12', { grade: 'lop-12' }, 'bg-orange-100 text-orange-800 border-orange-200'),

      // Subject (ví dụ demo)
      mk('subject-toan', 'Toán', { subject: 'toan-12' }, 'bg-purple-100 text-purple-800 border-purple-200')
    ];
  }, []);

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {chips.map((chip) => (
        <button
          key={chip.key}
          onClick={chip.onClick}
          className={cn('rounded-full border px-3 py-1.5 text-xs font-medium shadow-sm hover:opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-ring))] dark:border-[hsl(var(--color-border))]', chip.colorClass)}
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}

export default ClassificationChips;
