import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { useForm, useFieldArray, UseFormReturn } from 'react-hook-form';

import logger from '@/lib/utils/logger';
import {
  createQuestionFormSchema,
  getDefaultQuestionValues,
  type CreateQuestionFormValues,
  type QuestionType
} from '@/lib/validation/question-schemas';

/**
 * Custom hook for managing question form state and operations
 * 
 * Extracts form state management logic from question-form.tsx
 * Provides centralized form operations, field arrays, and state management
 * 
 * @param initialData - Initial form data for editing
 * @returns Form state, operations, and handlers
 */

export interface UseQuestionFormProps {
  initialData?: Partial<CreateQuestionFormValues>;
  onSave?: (data: CreateQuestionFormValues) => void;
}

export interface UseQuestionFormReturn {
  // Form instance và state
  form: UseFormReturn<CreateQuestionFormValues>;
  questionType: QuestionType;
  isSubmitting: boolean;
  submitError: string | null;
  
  // Field arrays for dynamic fields
  optionFields: Array<{ id: string; value: string }>;
  correctAnswerFields: Array<{ id: string; value: number }>;
  
  // Form operations
  addOption: () => void;
  removeOption: (index: number) => void;
  addcorrectAnswer: (index: number) => void;
  removecorrectAnswerByIndex: (answerIndex: number) => void;
  
  // Form submission
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  resetForm: () => void;
  
  // Form validation state
  isValid: boolean;
  errors: any;
}

export function useQuestionForm({ 
  initialData, 
  onSave 
}: UseQuestionFormProps): UseQuestionFormReturn {
  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Initialize form with React Hook Form
  const form = useForm<CreateQuestionFormValues>({
    resolver: zodResolver(createQuestionFormSchema),
    defaultValues: initialData || getDefaultQuestionValues('MC'),
  });

  const {
    control,
    handleSubmit: rhfHandleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid }
  } = form;

  // Watch question type to update form fields dynamically - aligned with Prisma schema
  const questionType = watch('type');

  // Field array for options (MC and MA questions) - aligned with Prisma schema
  const {
    fields: optionFields,
    append: appendOption,
    remove: removeOption
  } = useFieldArray({
    control,
    name: 'options' as any,
  });

  // Field array for correct answers (MA questions) - aligned with Prisma schema
  const {
    fields: correctAnswerFields,
    append: appendcorrectAnswer,
    remove: removecorrectAnswer
  } = useFieldArray({
    control,
    name: 'correctAnswers' as any,
  });

  // Field arrays are now enabled with PascalCase field names

  // Update form when question type changes - Updated to PascalCase
  useEffect(() => {
    const defaultValues = getDefaultQuestionValues(questionType);
    Object.entries(defaultValues).forEach(([key, value]) => {
      if (key !== 'Type') {
        setValue(key as keyof CreateQuestionFormValues, value as any);
      }
    });
  }, [questionType, setValue]);

  // Form submission handler
  const onSubmit = async (data: CreateQuestionFormValues): Promise<void> => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      logger.info('Question form submitted with data:', data);

      // Call the onSave callback with validated data
      await onSave?.(data);

    } catch (error) {
      logger.error('Error submitting question form:', error);
      setSubmitError(error instanceof Error ? error.message : 'Đã xảy ra lỗi khi lưu câu hỏi');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Form operations - Updated to use PascalCase field arrays
  const addOption = (): void => {
    appendOption('');
  };

  const removeOptionByIndex = (index: number): void => {
    removeOption(index);
  };

  const addcorrectAnswer = (index: number): void => {
    const currentAnswers = watch('correctAnswers') || [];
    if (!currentAnswers.includes(index)) {
      appendcorrectAnswer(index);
    }
  };

  const removecorrectAnswerByIndex = (answerIndex: number): void => {
    const currentAnswers = watch('correctAnswers') || [];
    const indexToRemove = currentAnswers.findIndex(answer => answer === answerIndex);
    if (indexToRemove !== -1) {
      removecorrectAnswer(indexToRemove);
    }
  };

  const resetForm = (): void => {
    reset(initialData || getDefaultQuestionValues('MC'));
    setSubmitError(null);
    setIsSubmitting(false);
  };

  const handleSubmit = rhfHandleSubmit(onSubmit);

  return {
    // Form instance và state
    form,
    questionType,
    isSubmitting,
    submitError,
    
    // Field arrays
    optionFields,
    correctAnswerFields,
    
    // Form operations
    addOption,
    removeOption: removeOptionByIndex,
    addcorrectAnswer,
    removecorrectAnswerByIndex,
    
    // Form submission
    handleSubmit,
    resetForm,
    
    // Form validation state
    isValid,
    errors,
  };
}
