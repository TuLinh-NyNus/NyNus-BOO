'use client';

import React from 'react';

import { QuestionFormErrorBoundary } from '../../error-boundaries';
import { useQuestionErrorHandler, createQuestionErrorContext } from '../../error-boundaries/use-question-error-handler';

import QuestionForm from './question-form';
import QuestionFormTabs from './question-form-tabs';
import QuestionFormLegacy from './question-form-legacy';

/**
 * QuestionForm wrapped with error boundary
 */
export function QuestionFormWithErrorBoundary(props: any) {
  const { handleError, retry, resetError } = useQuestionErrorHandler({
    maxRetries: 3,
    enableReporting: true,
    onError: (error, context) => {
      // Save form data to localStorage on error
      try {
        const formData = sessionStorage.getItem('current_question_form');
        if (formData) {
          localStorage.setItem('question_draft_' + Date.now(), formData);
        }
      } catch (e) {
        console.warn('Could not save form draft:', e);
      }
    }
  });

  const handleRetry = () => {
    retry();
  };

  return (
    <QuestionFormErrorBoundary onRetry={handleRetry}>
      <QuestionForm {...props} />
    </QuestionFormErrorBoundary>
  );
}

/**
 * QuestionFormTabs wrapped with error boundary
 */
export function QuestionFormTabsWithErrorBoundary(props: any) {
  const { handleError, retry } = useQuestionErrorHandler({
    maxRetries: 3,
    enableReporting: true
  });

  const handleRetry = () => {
    retry();
  };

  return (
    <QuestionFormErrorBoundary onRetry={handleRetry}>
      <QuestionFormTabs {...props} />
    </QuestionFormErrorBoundary>
  );
}

/**
 * QuestionFormLegacy wrapped with error boundary
 */
export function QuestionFormLegacyWithErrorBoundary(props: any) {
  const { handleError, retry } = useQuestionErrorHandler({
    maxRetries: 3,
    enableReporting: true
  });

  const handleRetry = () => {
    retry();
  };

  return (
    <QuestionFormErrorBoundary onRetry={handleRetry}>
      <QuestionFormLegacy {...props} />
    </QuestionFormErrorBoundary>
  );
}
