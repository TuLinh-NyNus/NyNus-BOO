/**
 * Filter Demo Component
 * Component demo để test comprehensive question filters
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Badge } from "@/components/ui/display/badge";
import { Button } from "@/components/ui/form/button";
import { 
  Filter, 
  CheckCircle, 
  AlertCircle, 
  Info,
  RefreshCw
} from "lucide-react";

import { ComprehensiveQuestionFilters } from "./comprehensive-question-filters";
import { useQuestionFiltersStore } from "@/lib/stores/question-filters";
import { QuestionFilters } from "@/lib/types/question";

/**
 * Filter Demo Component
 * Hiển thị comprehensive filters với real-time feedback
 */
export function FilterDemo() {
  const { filters, resetFilters } = useQuestionFiltersStore();

  /**
   * Handle filter changes
   */
  const handleFiltersChange = (newFilters: QuestionFilters) => {
    console.log('Filters changed:', newFilters);
  };

  /**
   * Get filter summary
   */
  const getFilterSummary = () => {
    const activeFilters = [];
    
    if (filters.keyword) activeFilters.push(`Keyword: "${filters.keyword}"`);
    if (filters.type) activeFilters.push(`Type: ${filters.type}`);
    if (filters.status) activeFilters.push(`Status: ${filters.status}`);
    if (filters.difficulty) activeFilters.push(`Difficulty: ${filters.difficulty}`);
    if (filters.grade?.length) activeFilters.push(`Grade: ${filters.grade.join(', ')}`);
    if (filters.subject?.length) activeFilters.push(`Subject: ${filters.subject.join(', ')}`);
    if (filters.chapter?.length) activeFilters.push(`Chapter: ${filters.chapter.join(', ')}`);
    if (filters.level?.length) activeFilters.push(`Level: ${filters.level.join(', ')}`);
    if (filters.creator?.length) activeFilters.push(`Creator: ${filters.creator.join(', ')}`);
    if (filters.source?.length) activeFilters.push(`Source: ${filters.source.join(', ')}`);
    if (filters.tags?.length) activeFilters.push(`Tags: ${filters.tags.join(', ')}`);
    if (filters.hasAnswers !== undefined) activeFilters.push(`Has Answers: ${filters.hasAnswers}`);
    if (filters.hasSolution !== undefined) activeFilters.push(`Has Solution: ${filters.hasSolution}`);
    if (filters.hasImages !== undefined) activeFilters.push(`Has Images: ${filters.hasImages}`);
    if (filters.usageCount) {
      const usage = [];
      if (filters.usageCount.min !== undefined) usage.push(`min: ${filters.usageCount.min}`);
      if (filters.usageCount.max !== undefined) usage.push(`max: ${filters.usageCount.max}`);
      if (usage.length) activeFilters.push(`Usage Count: ${usage.join(', ')}`);
    }

    return activeFilters;
  };

  const filterSummary = getFilterSummary();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Comprehensive Question Filters Demo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Basic Filters</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Advanced Filters</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">URL Sync</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Debounced Search</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comprehensive Filters */}
      <ComprehensiveQuestionFilters
        onFiltersChange={handleFiltersChange}
        resultCount={1250}
        isLoading={false}
      />

      {/* Filter Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Current Filter State
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reset All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filterSummary.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {filterSummary.length} active filter{filterSummary.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              <div className="grid gap-2">
                {filterSummary.map((filter, index) => (
                  <div key={index} className="text-sm text-muted-foreground">
                    • {filter}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">No active filters</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Raw Filter Object */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Raw Filter Object (Debug)</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-60">
            {JSON.stringify(filters, null, 2)}
          </pre>
        </CardContent>
      </Card>

      {/* Feature Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Feature Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>QuestionCode filters (grade, subject, chapter, level)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Question type filters</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Content search with debouncing</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Usage count range filters</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Media filters (images, solutions, answers)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Tags with autocomplete</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Status and creator filters</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Collapsible sections</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>URL params state management</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Reset functionality</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Performance optimized</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Mobile responsive</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
