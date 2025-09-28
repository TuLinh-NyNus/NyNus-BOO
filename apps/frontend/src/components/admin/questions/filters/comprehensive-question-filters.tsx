/**
 * Comprehensive Question Filters Component
 * Advanced filtering system cho Question Management UI
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Button } from "@/components/ui/form/button";
import { Label } from "@/components/ui/form/label";
import { Badge } from "@/components/ui/display/badge";
import { Separator } from "@/components/ui/display/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/layout/collapsible";
import {
  Filter,
  ChevronDown,
  ChevronUp,
  X,
  RotateCcw,
  Settings,
  Bookmark
} from "lucide-react";

// Import filter components
import { QuestionCodeFilters } from "./question-code-filters";
import { QuestionMetadataFilters } from "./question-metadata-filters";
import { QuestionContentFilters } from "./question-content-filters";
import { QuestionUsageFilters } from "./question-usage-filters";
import { QuestionSearchFilters } from "./question-search-filters";
import { FilterPresets } from "./filter-presets";
// TODO: FilterChips sẽ được sử dụng trong tương lai
// import { FilterChips } from "./filter-chips";
import { SmartFilterInteractions } from "./smart-filter-interactions";
import { FilterValidationUI } from "./filter-validation-ui";
import { FilterHelpSystem } from "./filter-help-system";

// Import store và types
import { useQuestionFiltersStore } from "@/lib/stores/question-filters";
import { QuestionFilters } from "@/lib/types/question";
import { cn } from "@/lib/utils";

// ===== INTERFACES =====

interface ComprehensiveQuestionFiltersProps {
  onFiltersChange?: (filters: QuestionFilters) => void;
  resultCount?: number;
  isLoading?: boolean;
  className?: string;
}

// ===== COMPONENT =====

/**
 * Comprehensive Question Filters Component
 * Main filtering interface với progressive disclosure và advanced features
 */
export function ComprehensiveQuestionFilters({
  onFiltersChange,
  resultCount = 0,
  isLoading = false,
  className = ""
}: ComprehensiveQuestionFiltersProps) {
  // Store state
  const {
    filters,
    isAdvancedMode,
    isFilterPanelOpen,
    activePresetId,
    presets,
    resetFilters,
    resetFilterCategory,
    toggleAdvancedMode,
    toggleFilterPanel,
    setResultCount
  } = useQuestionFiltersStore();

  // Local UI state cho progressive disclosure
  const [expandedSections, setExpandedSections] = useState({
    questionCode: true,    // Primary filters - always visible
    metadata: false,       // Secondary filters - expandable
    content: false,        // Advanced filters - collapsible
    usage: false,          // Advanced filters - collapsible
    search: false          // Advanced filters - collapsible
  });

  // Toggle section expansion
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Auto-expand sections khi có active filters
  React.useEffect(() => {
    const hasMetadataFilters = Boolean(
      filters.type?.length || filters.status?.length ||
      filters.difficulty?.length || filters.creator?.length
    );
    const hasContentFilters = Boolean(
      filters.source?.length || filters.tags?.length || filters.subcount ||
      filters.hasAnswers !== undefined || filters.hasSolution !== undefined || filters.hasImages !== undefined
    );
    const hasUsageFilters = Boolean(
      filters.usageCount || filters.feedback || filters.dateRange
    );
    const hasSearchFilters = Boolean(
      filters.keyword || filters.solutionKeyword || filters.latexKeyword || filters.globalSearch
    );

    setExpandedSections(prev => ({
      ...prev,
      metadata: prev.metadata || hasMetadataFilters,
      content: prev.content || hasContentFilters,
      usage: prev.usage || hasUsageFilters,
      search: prev.search || hasSearchFilters
    }));
  }, [filters]);

  // Update result count when it changes
  React.useEffect(() => {
    setResultCount(resultCount);
  }, [resultCount, setResultCount]);

  // Notify parent of filter changes
  React.useEffect(() => {
    onFiltersChange?.(filters);
  }, [filters, onFiltersChange]);



  /**
   * Get active filter count
   */
  const getActiveFilterCount = useMemo(() => {
    let count = 0;
    
    // QuestionCode filters
    if (filters.grade?.length) count++;
    if (filters.subject?.length) count++;
    if (filters.chapter?.length) count++;
    if (filters.level?.length) count++;
    if (filters.lesson?.length) count++;
    if (filters.form?.length) count++;
    if (filters.format?.length) count++;
    
    // Metadata filters
    if (filters.type?.length) count++;
    if (filters.status?.length) count++;
    if (filters.difficulty?.length) count++;
    if (filters.creator?.length) count++;
    
    // Content filters
    if (filters.source?.length) count++;
    if (filters.tags?.length) count++;
    if (filters.subcount) count++;
    if (filters.hasAnswers !== undefined) count++;
    if (filters.hasSolution !== undefined) count++;
    if (filters.hasImages !== undefined) count++;
    
    // Usage filters
    if (filters.usageCount) count++;
    if (filters.feedback) count++;
    if (filters.dateRange) count++;
    
    // Search filters
    if (filters.keyword) count++;
    if (filters.solutionKeyword) count++;
    if (filters.latexKeyword) count++;
    if (filters.globalSearch) count++;
    
    return count;
  }, [filters]);

  /**
   * Get current preset name
   */
  const currentPresetName = useMemo(() => {
    if (!activePresetId) return null;
    const preset = presets.find(p => p.id === activePresetId);
    return preset?.name || null;
  }, [activePresetId, presets]);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <CardTitle className="text-lg">Bộ lọc câu hỏi</CardTitle>
            {getActiveFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFilterCount} bộ lọc
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Result count */}
            <div className="text-sm text-muted-foreground">
              {isLoading ? (
                <span>Đang tải...</span>
              ) : (
                <span>{resultCount.toLocaleString()} kết quả</span>
              )}
            </div>
            
            {/* Advanced mode toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAdvancedMode}
              className={cn(
                "gap-2",
                isAdvancedMode && "bg-primary/10 border-primary/20"
              )}
            >
              <Settings className="h-4 w-4" />
              {isAdvancedMode ? "Cơ bản" : "Nâng cao"}
            </Button>
            
            {/* Reset all filters */}
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              disabled={getActiveFilterCount === 0}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            
            {/* Collapse toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFilterPanel}
              className="gap-2"
            >
              {isFilterPanelOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        
        {/* Current preset indicator */}
        {currentPresetName && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Bookmark className="h-4 w-4" />
            <span>Preset: {currentPresetName}</span>
          </div>
        )}
      </CardHeader>

      <Collapsible open={isFilterPanelOpen} onOpenChange={toggleFilterPanel}>
        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Filter Presets */}
            <FilterPresets />

            {/* Active Filter Chips */}
            {/* <FilterChips /> */}

            {/* Smart Filter Interactions */}
            <SmartFilterInteractions />

            {/* Filter Validation UI */}
            <FilterValidationUI
              resultCount={resultCount}
              isLoading={isLoading}
              onRetry={() => window.location.reload()}
            />

            {/* Help System */}
            <FilterHelpSystem />

            <Separator />
            
            {/* PRIMARY FILTERS - QuestionCode (Always Visible) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Mã câu hỏi</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => resetFilterCategory('questionCode')}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3 mr-1" />
                  Xóa
                </Button>
              </div>
              <QuestionCodeFilters />
            </div>
            
            <Separator />
            
            {/* SECONDARY FILTERS - Metadata (Expandable) */}
            <Collapsible 
              open={expandedSections.metadata} 
              onOpenChange={() => toggleSection('metadata')}
            >
              <CollapsibleTrigger asChild>
                <div className="w-full flex justify-between items-center p-2 hover:bg-accent rounded-md cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Label className="text-base font-semibold cursor-pointer">
                      Thông tin câu hỏi
                    </Label>
                    {/* Active filters indicator */}
                    {(filters.type?.length || filters.status?.length ||
                      filters.difficulty?.length || filters.creator?.length) && (
                      <Badge variant="secondary" className="text-xs">
                        {[
                          filters.type?.length || 0,
                          filters.status?.length || 0,
                          filters.difficulty?.length || 0,
                          filters.creator?.length || 0
                        ].filter(Boolean).length} active
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        resetFilterCategory('metadata');
                      }}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Xóa
                    </Button>
                    {expandedSections.metadata ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 mt-4">
                <QuestionMetadataFilters />
              </CollapsibleContent>
            </Collapsible>
            
            {/* ADVANCED FILTERS - Only show in advanced mode */}
            {isAdvancedMode && (
              <>
                <Separator />
                
                {/* Content Filters */}
                <Collapsible 
                  open={expandedSections.content} 
                  onOpenChange={() => toggleSection('content')}
                >
                  <CollapsibleTrigger asChild>
                    <div className="w-full flex justify-between items-center p-2 hover:bg-accent rounded-md cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Label className="text-base font-semibold cursor-pointer">
                          Nội dung câu hỏi
                        </Label>
                        {/* Active filters indicator */}
                        {(filters.source?.length || filters.tags?.length || filters.subcount ||
                          filters.hasAnswers !== undefined || filters.hasSolution !== undefined ||
                          filters.hasImages !== undefined) && (
                          <Badge variant="secondary" className="text-xs">
                            {[
                              filters.source?.length || 0,
                              filters.tags?.length || 0,
                              filters.subcount ? 1 : 0,
                              filters.hasAnswers !== undefined ? 1 : 0,
                              filters.hasSolution !== undefined ? 1 : 0,
                              filters.hasImages !== undefined ? 1 : 0
                            ].filter(Boolean).length} active
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            resetFilterCategory('content');
                          }}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Xóa
                        </Button>
                        {expandedSections.content ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 mt-4">
                    <QuestionContentFilters />
                  </CollapsibleContent>
                </Collapsible>
                
                <Separator />
                
                {/* Usage Filters */}
                <Collapsible 
                  open={expandedSections.usage} 
                  onOpenChange={() => toggleSection('usage')}
                >
                  <CollapsibleTrigger asChild>
                    <div className="w-full flex justify-between items-center p-2 hover:bg-accent rounded-md cursor-pointer">
                      <Label className="text-base font-semibold cursor-pointer">
                        Thống kê sử dụng
                      </Label>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            resetFilterCategory('usage');
                          }}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Xóa
                        </Button>
                        {expandedSections.usage ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 mt-4">
                    <QuestionUsageFilters />
                  </CollapsibleContent>
                </Collapsible>
                
                <Separator />
                
                {/* Search Filters */}
                <Collapsible 
                  open={expandedSections.search} 
                  onOpenChange={() => toggleSection('search')}
                >
                  <CollapsibleTrigger asChild>
                    <div className="w-full flex justify-between items-center p-2 hover:bg-accent rounded-md cursor-pointer">
                      <Label className="text-base font-semibold cursor-pointer">
                        Tìm kiếm nâng cao
                      </Label>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            resetFilterCategory('search');
                          }}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Xóa
                        </Button>
                        {expandedSections.search ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 mt-4">
                    <QuestionSearchFilters />
                  </CollapsibleContent>
                </Collapsible>
              </>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export default ComprehensiveQuestionFilters;
