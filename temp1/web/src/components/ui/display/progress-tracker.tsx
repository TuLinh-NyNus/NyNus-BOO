/**
 * Progress Tracker Component
 * 
 * Component theo dõi tiến trình cho các thao tác multi-step
 */

'use client';

import { CheckCircle2, Circle, AlertCircle, Clock, X } from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { Button, Progress } from '@/components/ui';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/display/card";
import { cn } from '@/lib/utils';

export interface ProgressStep {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error' | 'skipped';
  progress?: number;
  errorMessage?: string;
  duration?: number;
  estimatedDuration?: number;
}

export interface ProgressTrackerProps {
  steps: ProgressStep[];
  currentStepId?: string;
  title?: string;
  description?: string;
  showProgress?: boolean;
  showStepDetails?: boolean;
  allowCancel?: boolean;
  onCancel?: () => void;
  onStepClick?: (stepId: string) => void;
  className?: string;
}

/**
 * Progress Tracker Component
 */
export function ProgressTracker({
  steps,
  currentStepId,
  title = 'Tiến trình xử lý',
  description,
  showProgress = true,
  showStepDetails = true,
  allowCancel = false,
  onCancel,
  onStepClick,
  className
}: ProgressTrackerProps): JSX.Element {
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);

  // Update elapsed time
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Date.now() - startTime);
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  // Calculate overall progress
  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const totalSteps = steps.length;
  const overallProgress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  // Get current step
  const currentStep = currentStepId ? steps.find(step => step.id === currentStepId) : null;
  const currentStepIndex = currentStep ? steps.indexOf(currentStep) : -1;

  // Calculate estimated time remaining
  const completedDuration = steps
    .filter(step => step.status === 'completed')
    .reduce((total, step) => total + (step.duration || 0), 0);
  
  const estimatedTotal = steps.reduce((total, step) => total + (step.estimatedDuration || 1000), 0);
  const estimatedRemaining = Math.max(0, estimatedTotal - completedDuration);

  // Format time
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className={cn('w-full max-w-2xl', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          
          {allowCancel && onCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Overall Progress */}
        {showProgress && (
          <div className="space-y-2 mt-4">
            <div className="flex items-center justify-between text-sm">
              <span>Tiến trình tổng thể</span>
              <span>{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{completedSteps}/{totalSteps} bước hoàn thành</span>
              <div className="flex items-center gap-4">
                <span>Đã trôi qua: {formatTime(elapsedTime)}</span>
                {estimatedRemaining > 0 && (
                  <span>Còn lại: ~{formatTime(estimatedRemaining)}</span>
                )}
              </div>
            </div>
          </div>
        )}
      </CardHeader>

      {/* Step Details */}
      {showStepDetails && (
        <CardContent className="space-y-3">
          {steps.map((step, index) => {
            const isActive = step.id === currentStepId;
            const isClickable = onStepClick && (step.status === 'completed' || step.status === 'error');

            return (
              <div
                key={step.id}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg border transition-colors',
                  isActive && 'bg-blue-50 border-blue-200',
                  step.status === 'completed' && 'bg-green-50 border-green-200',
                  step.status === 'error' && 'bg-red-50 border-red-200',
                  step.status === 'pending' && 'bg-gray-50 border-gray-200',
                  isClickable && 'cursor-pointer hover:bg-opacity-80'
                )}
                onClick={() => isClickable && onStepClick?.(step.id)}
              >
                {/* Step Icon */}
                <div className="flex-shrink-0 mt-0.5">
                  {step.status === 'completed' && (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  )}
                  {step.status === 'in-progress' && (
                    <div className="h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  )}
                  {step.status === 'error' && (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  {step.status === 'pending' && (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                  {step.status === 'skipped' && (
                    <Circle className="h-5 w-5 text-yellow-500" />
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className={cn(
                      'font-medium text-sm',
                      isActive && 'text-blue-700',
                      step.status === 'completed' && 'text-green-700',
                      step.status === 'error' && 'text-red-700',
                      step.status === 'pending' && 'text-gray-600'
                    )}>
                      {step.title}
                    </h4>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {step.status === 'in-progress' && step.progress !== undefined && (
                        <span>{Math.round(step.progress)}%</span>
                      )}
                      {step.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(step.duration)}
                        </span>
                      )}
                    </div>
                  </div>

                  {step.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {step.description}
                    </p>
                  )}

                  {step.status === 'error' && step.errorMessage && (
                    <p className="text-xs text-red-600 mt-1">
                      Lỗi: {step.errorMessage}
                    </p>
                  )}

                  {/* Step Progress Bar */}
                  {step.status === 'in-progress' && step.progress !== undefined && (
                    <Progress 
                      value={step.progress} 
                      className="h-1 mt-2"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      )}
    </Card>
  );
}

/**
 * Compact Progress Tracker for smaller spaces
 */
export function CompactProgressTracker({
  steps,
  currentStepId,
  className
}: {
  steps: ProgressStep[];
  currentStepId?: string;
  className?: string;
}): JSX.Element {
  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const totalSteps = steps.length;
  const currentStep = currentStepId ? steps.find(step => step.id === currentStepId) : null;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Step Indicators */}
      <div className="flex items-center gap-1">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={cn(
              'w-2 h-2 rounded-full transition-colors',
              step.status === 'completed' && 'bg-green-500',
              step.status === 'in-progress' && 'bg-blue-500',
              step.status === 'error' && 'bg-red-500',
              step.status === 'pending' && 'bg-gray-300'
            )}
          />
        ))}
      </div>

      {/* Current Step Info */}
      {currentStep && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">
            {completedSteps}/{totalSteps}
          </span>
          <span className="font-medium truncate max-w-32">
            {currentStep.title}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Hook để quản lý progress steps
 */
export function useProgressTracker(initialSteps: Omit<ProgressStep, 'status'>[]):  {
  steps: ProgressStep[];
  currentStepId: string | null;
  updateStep: (stepId: string, updates: Partial<ProgressStep>) => void;
  startStep: (stepId: string) => void;
  completeStep: (stepId: string) => void;
  errorStep: (stepId: string, errorMessage: string) => void;
  skipStep: (stepId: string) => void;
  updateProgress: (stepId: string, progress: number) => void;
  reset: () => void;
} {
  const [steps, setSteps] = useState<ProgressStep[]>(
    initialSteps.map(step => ({ ...step, status: 'pending' as const }))
  );
  const [currentStepId, setCurrentStepId] = useState<string | null>(null);

  const updateStep = (stepId: string, updates: Partial<ProgressStep>) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ));
  };

  const startStep = (stepId: string) => {
    setCurrentStepId(stepId);
    updateStep(stepId, { status: 'in-progress' });
  };

  const completeStep = (stepId: string, duration?: number) => {
    updateStep(stepId, { 
      status: 'completed', 
      progress: 100,
      duration 
    });
  };

  const errorStep = (stepId: string, errorMessage: string) => {
    updateStep(stepId, { 
      status: 'error', 
      errorMessage 
    });
  };

  const skipStep = (stepId: string) => {
    updateStep(stepId, { status: 'skipped' });
  };

  const updateProgress = (stepId: string, progress: number) => {
    updateStep(stepId, { progress });
  };

  const reset = () => {
    setSteps(prev => prev.map(step => ({ 
      ...step, 
      status: 'pending' as const,
      progress: undefined,
      errorMessage: undefined,
      duration: undefined
    })));
    setCurrentStepId(null);
  };

  return {
    steps,
    currentStepId,
    updateStep,
    startStep,
    completeStep,
    errorStep,
    skipStep,
    updateProgress,
    reset
  };
}
