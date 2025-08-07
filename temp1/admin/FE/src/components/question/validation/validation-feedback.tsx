"use client";

import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, AlertTriangle, ChevronDown } from "lucide-react";

/**
 * Validation Result Interface
 */
interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number;
  maxScore: number;
}

/**
 * Props for ValidationFeedback
 */
interface ValidationFeedbackProps {
  result: ValidationResult;
  onRetry?: () => void;
  className?: string;
}

/**
 * Validation Feedback Component
 * Displays validation results for questions with detailed feedback
 */
export function ValidationFeedback({ result, onRetry, className = "" }: ValidationFeedbackProps) {
  const { isValid, errors, warnings, score, maxScore } = result;
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isValid ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600" />
          )}
          Validation Results
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Validation Score</span>
            <span>
              {score}/{maxScore}
            </span>
          </div>
          <Progress value={percentage} className="w-full" />
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <Badge variant={isValid ? "default" : "destructive"}>
            {isValid ? "Valid" : "Invalid"}
          </Badge>
          {warnings.length > 0 && (
            <Badge variant="secondary">
              {warnings.length} Warning{warnings.length !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  {errors.length} Error{errors.length !== 1 ? "s" : ""}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-2">
              {errors.map((error, index) => (
                <Alert key={index} variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Warnings */}
        {warnings.length > 0 && (
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  {warnings.length} Warning{warnings.length !== 1 ? "s" : ""}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-2">
              {warnings.map((warning, index) => (
                <Alert key={index}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{warning}</AlertDescription>
                </Alert>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Retry Button */}
        {onRetry && (
          <Button onClick={onRetry} className="w-full" variant="outline">
            Retry Validation
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default ValidationFeedback;
