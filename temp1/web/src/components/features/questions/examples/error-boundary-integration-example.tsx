'use client';

import React, { useState } from 'react';

import { Button } from '@/components/ui/form/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/display/card';

import {
  QuestionFormErrorBoundary,
  QuestionSearchErrorBoundary,
  QuestionDisplayErrorBoundary,
  LaTeXErrorBoundary,
  MapIDErrorBoundary,
  useQuestionErrorHandler,
  createQuestionErrorContext
} from '../error-boundaries';

/**
 * Comprehensive example showing how to integrate error boundaries
 * with question components in different scenarios
 */
export function ErrorBoundaryIntegrationExample() {
  const [activeDemo, setActiveDemo] = useState<string>('form');

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Error Boundary Integration Examples</CardTitle>
          <CardDescription>
            Comprehensive examples showing how to use question error boundaries
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="flex gap-2 mb-6">
            <Button
              variant={activeDemo === 'form' ? 'default' : 'outline'}
              onClick={() => setActiveDemo('form')}
              size="sm"
            >
              Form Errors
            </Button>
            <Button
              variant={activeDemo === 'search' ? 'default' : 'outline'}
              onClick={() => setActiveDemo('search')}
              size="sm"
            >
              Search Errors
            </Button>
            <Button
              variant={activeDemo === 'display' ? 'default' : 'outline'}
              onClick={() => setActiveDemo('display')}
              size="sm"
            >
              Display Errors
            </Button>
            <Button
              variant={activeDemo === 'latex' ? 'default' : 'outline'}
              onClick={() => setActiveDemo('latex')}
              size="sm"
            >
              LaTeX Errors
            </Button>
            <Button
              variant={activeDemo === 'mapid' ? 'default' : 'outline'}
              onClick={() => setActiveDemo('mapid')}
              size="sm"
            >
              MapID Errors
            </Button>
            <Button
              variant={activeDemo === 'hook' ? 'default' : 'outline'}
              onClick={() => setActiveDemo('hook')}
              size="sm"
            >
              Error Hook
            </Button>
          </div>

          {activeDemo === 'form' && <FormErrorExample />}
          {activeDemo === 'search' && <SearchErrorExample />}
          {activeDemo === 'display' && <DisplayErrorExample />}
          {activeDemo === 'latex' && <LaTeXErrorExample />}
          {activeDemo === 'mapid' && <MapIDErrorExample />}
          {activeDemo === 'hook' && <ErrorHookExample />}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Form Error Example
 */
function FormErrorExample() {
  const [shouldError, setShouldError] = useState(false);

  const FormComponent = () => {
    if (shouldError) {
      throw new Error('Simulated form submission error');
    }
    
    return (
      <div className="p-4 border rounded">
        <h3 className="font-semibold mb-2">Question Form</h3>
        <p className="text-sm text-gray-600 mb-4">
          This form is wrapped with QuestionFormErrorBoundary
        </p>
        <Button
          onClick={() => setShouldError(true)}
          variant="destructive"
          size="sm"
        >
          Trigger Form Error
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Form Error Boundary Example</h3>
      <QuestionFormErrorBoundary onRetry={() => setShouldError(false)}>
        <FormComponent />
      </QuestionFormErrorBoundary>
    </div>
  );
}

/**
 * Search Error Example
 */
function SearchErrorExample() {
  const [shouldError, setShouldError] = useState(false);

  const SearchComponent = () => {
    if (shouldError) {
      throw new Error('Simulated search error');
    }
    
    return (
      <div className="p-4 border rounded">
        <h3 className="font-semibold mb-2">Question Search</h3>
        <p className="text-sm text-gray-600 mb-4">
          This search is wrapped with QuestionSearchErrorBoundary
        </p>
        <Button
          onClick={() => setShouldError(true)}
          variant="destructive"
          size="sm"
        >
          Trigger Search Error
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Search Error Boundary Example</h3>
      <QuestionSearchErrorBoundary onRetry={() => setShouldError(false)}>
        <SearchComponent />
      </QuestionSearchErrorBoundary>
    </div>
  );
}

/**
 * Display Error Example
 */
function DisplayErrorExample() {
  const [shouldError, setShouldError] = useState(false);

  const DisplayComponent = () => {
    if (shouldError) {
      throw new Error('Simulated display error');
    }
    
    return (
      <div className="p-4 border rounded">
        <h3 className="font-semibold mb-2">Question Display</h3>
        <p className="text-sm text-gray-600 mb-4">
          This display is wrapped with QuestionDisplayErrorBoundary
        </p>
        <Button
          onClick={() => setShouldError(true)}
          variant="destructive"
          size="sm"
        >
          Trigger Display Error
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Display Error Boundary Example</h3>
      <QuestionDisplayErrorBoundary 
        questionId="example-123"
        onRetry={() => setShouldError(false)}
      >
        <DisplayComponent />
      </QuestionDisplayErrorBoundary>
    </div>
  );
}

/**
 * LaTeX Error Example
 */
function LaTeXErrorExample() {
  const [shouldError, setShouldError] = useState(false);

  const LaTeXComponent = () => {
    if (shouldError) {
      throw new Error('Simulated LaTeX processing error');
    }
    
    return (
      <div className="p-4 border rounded">
        <h3 className="font-semibold mb-2">LaTeX Processing</h3>
        <p className="text-sm text-gray-600 mb-4">
          This LaTeX processor is wrapped with LaTeXErrorBoundary
        </p>
        <Button
          onClick={() => setShouldError(true)}
          variant="destructive"
          size="sm"
        >
          Trigger LaTeX Error
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">LaTeX Error Boundary Example</h3>
      <LaTeXErrorBoundary onRetry={() => setShouldError(false)}>
        <LaTeXComponent />
      </LaTeXErrorBoundary>
    </div>
  );
}

/**
 * MapID Error Example
 */
function MapIDErrorExample() {
  const [shouldError, setShouldError] = useState(false);

  const MapIDComponent = () => {
    if (shouldError) {
      throw new Error('Simulated MapID decoding error');
    }
    
    return (
      <div className="p-4 border rounded">
        <h3 className="font-semibold mb-2">MapID Processing</h3>
        <p className="text-sm text-gray-600 mb-4">
          This MapID processor is wrapped with MapIDErrorBoundary
        </p>
        <Button
          onClick={() => setShouldError(true)}
          variant="destructive"
          size="sm"
        >
          Trigger MapID Error
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">MapID Error Boundary Example</h3>
      <MapIDErrorBoundary 
        mapId="example-mapid-123"
        onRetry={() => setShouldError(false)}
      >
        <MapIDComponent />
      </MapIDErrorBoundary>
    </div>
  );
}

/**
 * Error Hook Example
 */
function ErrorHookExample() {
  const { 
    hasError, 
    error, 
    canRetry, 
    handleError, 
    retry, 
    resetError,
    wrapAsync 
  } = useQuestionErrorHandler({
    maxRetries: 3,
    enableReporting: true,
    onError: (error, context) => {
      console.log('Error handled by hook:', error.message, context);
    }
  });

  const simulateAsyncError = wrapAsync(
    async () => {
      throw new Error('Simulated async operation error');
    },
    createQuestionErrorContext.form('example-question-id')
  );

  const simulateSuccess = wrapAsync(
    async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return 'Operation successful!';
    },
    createQuestionErrorContext.form('example-question-id')
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Error Handler Hook Example</h3>
      
      <div className="p-4 border rounded space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={simulateAsyncError}
            variant="destructive"
            size="sm"
          >
            Trigger Async Error
          </Button>
          <Button
            onClick={simulateSuccess}
            variant="default"
            size="sm"
          >
            Simulate Success
          </Button>
          {hasError && canRetry && (
            <Button
              onClick={retry}
              variant="outline"
              size="sm"
            >
              Retry ({3 - (error as any)?.retryCount || 0} left)
            </Button>
          )}
          {hasError && (
            <Button
              onClick={resetError}
              variant="ghost"
              size="sm"
            >
              Reset
            </Button>
          )}
        </div>

        {hasError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-red-800 font-medium">Error occurred:</p>
            <p className="text-red-600 text-sm">{error?.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
