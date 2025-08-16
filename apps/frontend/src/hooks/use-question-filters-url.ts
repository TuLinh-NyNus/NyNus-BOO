/**
 * Question Filters URL Hook
 * Hook để sync question filters với URL params
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { QuestionType, QuestionStatus, QuestionDifficulty } from '@/lib/types/question';
import { useQuestionFiltersStore } from '@/lib/stores/question-filters';
import { QuestionFilters } from '@/lib/types/question';

/**
 * Hook để sync filters với URL params
 */
export function useQuestionFiltersUrl() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { filters, setFilters } = useQuestionFiltersStore();

  // Load filters từ URL khi component mount
  useEffect(() => {
    const urlFilters: Partial<QuestionFilters> = {};

    // Parse URL params
    const keyword = searchParams.get('keyword');
    if (keyword) urlFilters.keyword = keyword;

    const type = searchParams.get('type');
    if (type) urlFilters.type = type as QuestionType;

    const status = searchParams.get('status');
    if (status) urlFilters.status = status as QuestionStatus;

    const difficulty = searchParams.get('difficulty');
    if (difficulty) urlFilters.difficulty = difficulty as QuestionDifficulty;

    const grade = searchParams.getAll('grade');
    if (grade.length) urlFilters.grade = grade;

    const subject = searchParams.getAll('subject');
    if (subject.length) urlFilters.subject = subject;

    const chapter = searchParams.getAll('chapter');
    if (chapter.length) urlFilters.chapter = chapter;

    const level = searchParams.getAll('level');
    if (level.length) urlFilters.level = level;

    const creator = searchParams.getAll('creator');
    if (creator.length) urlFilters.creator = creator;

    const source = searchParams.getAll('source');
    if (source.length) urlFilters.source = source;

    const tags = searchParams.getAll('tags');
    if (tags.length) urlFilters.tags = tags;

    const hasAnswers = searchParams.get('hasAnswers');
    if (hasAnswers !== null) urlFilters.hasAnswers = hasAnswers === 'true';

    const hasSolution = searchParams.get('hasSolution');
    if (hasSolution !== null) urlFilters.hasSolution = hasSolution === 'true';

    const hasImages = searchParams.get('hasImages');
    if (hasImages !== null) urlFilters.hasImages = hasImages === 'true';

    const usageMin = searchParams.get('usageMin');
    const usageMax = searchParams.get('usageMax');
    if (usageMin || usageMax) {
      urlFilters.usageCount = {
        min: usageMin ? parseInt(usageMin) : undefined,
        max: usageMax ? parseInt(usageMax) : undefined
      };
    }

    // Set filters nếu có data từ URL
    if (Object.keys(urlFilters).length > 0) {
      setFilters(urlFilters);
    }
  }, [searchParams, setFilters]);

  // Update URL khi filters thay đổi
  useEffect(() => {
    const params = new URLSearchParams();

    // Add filters to URL params
    if (filters.keyword) params.set('keyword', filters.keyword);
    if (filters.type) params.set('type', String(filters.type));
    if (filters.status) params.set('status', String(filters.status));
    if (filters.difficulty) params.set('difficulty', String(filters.difficulty));

    if (filters.grade?.length) {
      filters.grade.forEach(g => params.append('grade', g));
    }

    if (filters.subject?.length) {
      filters.subject.forEach(s => params.append('subject', s));
    }

    if (filters.chapter?.length) {
      filters.chapter.forEach(c => params.append('chapter', c));
    }

    if (filters.level?.length) {
      filters.level.forEach(l => params.append('level', l));
    }

    if (filters.creator?.length) {
      filters.creator.forEach(c => params.append('creator', c));
    }

    if (filters.source?.length) {
      filters.source.forEach(s => params.append('source', s));
    }

    if (filters.tags?.length) {
      filters.tags.forEach(t => params.append('tags', t));
    }

    if (filters.hasAnswers !== undefined) {
      params.set('hasAnswers', String(filters.hasAnswers));
    }

    if (filters.hasSolution !== undefined) {
      params.set('hasSolution', String(filters.hasSolution));
    }

    if (filters.hasImages !== undefined) {
      params.set('hasImages', String(filters.hasImages));
    }

    if (filters.usageCount?.min !== undefined) {
      params.set('usageMin', String(filters.usageCount.min));
    }

    if (filters.usageCount?.max !== undefined) {
      params.set('usageMax', String(filters.usageCount.max));
    }

    // Update URL without triggering navigation
    const newUrl = params.toString() ? `?${params.toString()}` : '';
    const currentUrl = window.location.search;
    
    if (newUrl !== currentUrl) {
      router.replace(newUrl, { scroll: false });
    }
  }, [filters, router]);

  return {
    filters,
    setFilters
  };
}
