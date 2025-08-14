/**
 * Enhanced Question List Demo Page
 * Demo page để test EnhancedQuestionList component với virtual scrolling
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Separator,
} from "@/components/ui";
import { 
  RefreshCw, 
  Settings, 
  Monitor,
  Smartphone,
  Tablet,
  List,
  Grid
} from "lucide-react";

// Import enhanced components
import { EnhancedQuestionList, QuestionListViewMode, QuestionListLayout } from "@/components/admin/questions/list";
import { useQuestionList } from "@/hooks";

// Import types
// import { Question } from "@/lib/types/question";

// ===== DEMO COMPONENT =====

export default function EnhancedQuestionListDemoPage() {
  // ===== STATE =====
  
  const [demoSettings, setDemoSettings] = useState({
    enableVirtualScrolling: true,
    virtualScrollingThreshold: 100,
    containerHeight: 600,
    showBulkActions: true,
    showActions: true,
    showPreview: true,
  });
  
  const [forcedViewMode, setForcedViewMode] = useState<QuestionListViewMode | undefined>(undefined);
  const [forcedLayout, setForcedLayout] = useState<QuestionListLayout | undefined>(undefined);
  
  // ===== HOOKS =====

  const {
    questions,
    pagination,
    isLoading: originalIsLoading,
    viewMode,
    layout,
    selectedQuestions,
    performanceMetrics,
    refetch,
    setPage,
    setPageSize,
    setViewMode,
    setLayout,
    setSelectedQuestions,
    selectAll,
    selectNone,
    hasActiveFilters: _hasActiveFilters,
    activeFilterCount: _activeFilterCount,
  } = useQuestionList({
    autoFetch: true,
    initialViewMode: forcedViewMode,
    initialLayout: forcedLayout,
    enableVirtualScrolling: demoSettings.enableVirtualScrolling,
    virtualScrollingThreshold: demoSettings.virtualScrollingThreshold,
    onViewModeChange: (mode) => {
      console.log('View mode changed:', mode);
    },
    onLayoutChange: (newLayout) => {
      console.log('Layout changed:', newLayout);
    },
  });

  // ===== DEMO FIXES =====

  // Fix 1: Override loading state với timeout fallback
  const [isLoadingOverride, setIsLoadingOverride] = useState(true);

  useEffect(() => {
    // Auto-disable loading sau 3 giây hoặc khi có data
    const timeout = setTimeout(() => {
      console.log('[DEMO FIX] Loading timeout - forcing false');
      setIsLoadingOverride(false);
    }, 3000);

    // Disable loading khi có data
    if (questions.length > 0) {
      setIsLoadingOverride(false);
      clearTimeout(timeout);
    }

    return () => clearTimeout(timeout);
  }, [questions.length]);

  // Use override loading state for demo
  const isLoading = isLoadingOverride && originalIsLoading;
  
  // ===== HANDLERS =====
  
  /**
   * Handle question actions
   */
  const handleQuestionEdit = (questionId: string) => {
    console.log('Edit question:', questionId);
  };
  
  const handleQuestionDelete = (questionId: string) => {
    console.log('Delete question:', questionId);
  };
  
  const handleQuestionView = (questionId: string) => {
    console.log('View question:', questionId);
  };
  
  const handleQuestionDuplicate = (questionId: string) => {
    console.log('Duplicate question:', questionId);
  };
  
  /**
   * Handle pagination
   */
  const handlePaginationChange = (page: number, pageSize: number) => {
    setPage(page);
    setPageSize(pageSize);
  };
  
  /**
   * Handle demo settings
   */
  const toggleVirtualScrolling = () => {
    setDemoSettings(prev => ({
      ...prev,
      enableVirtualScrolling: !prev.enableVirtualScrolling
    }));
  };
  
  const handleViewModeChange = (mode: QuestionListViewMode) => {
    setForcedViewMode(mode);
    setViewMode(mode);
  };
  
  const handleLayoutChange = (newLayout: QuestionListLayout) => {
    setForcedLayout(newLayout);
    setLayout(newLayout);
  };
  
  // ===== RENDER =====
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Enhanced Question List Demo</h1>
          <p className="text-muted-foreground mt-1">
            Test enhanced question list với virtual scrolling và responsive design
          </p>
        </div>
        <Button onClick={refetch} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>
      
      {/* Demo Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Demo Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* View Mode Controls */}
          <div>
            <h4 className="font-medium mb-2">View Mode</h4>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleViewModeChange('table')}
              >
                <List className="h-4 w-4 mr-1" />
                Table
              </Button>
              <Button
                variant={viewMode === 'cards' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleViewModeChange('cards')}
              >
                <Grid className="h-4 w-4 mr-1" />
                Cards
              </Button>
              <Button
                variant={viewMode === 'virtual' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleViewModeChange('virtual')}
              >
                <Monitor className="h-4 w-4 mr-1" />
                Virtual
              </Button>
            </div>
          </div>
          
          {/* Layout Controls */}
          <div>
            <h4 className="font-medium mb-2">Layout Simulation</h4>
            <div className="flex gap-2">
              <Button
                variant={layout === 'desktop' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleLayoutChange('desktop')}
              >
                <Monitor className="h-4 w-4 mr-1" />
                Desktop
              </Button>
              <Button
                variant={layout === 'tablet' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleLayoutChange('tablet')}
              >
                <Tablet className="h-4 w-4 mr-1" />
                Tablet
              </Button>
              <Button
                variant={layout === 'mobile' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleLayoutChange('mobile')}
              >
                <Smartphone className="h-4 w-4 mr-1" />
                Mobile
              </Button>
            </div>
          </div>
          
          {/* Virtual Scrolling Toggle */}
          <div>
            <h4 className="font-medium mb-2">Virtual Scrolling</h4>
            <Button
              variant={demoSettings.enableVirtualScrolling ? 'default' : 'outline'}
              size="sm"
              onClick={toggleVirtualScrolling}
            >
              {demoSettings.enableVirtualScrolling ? 'Enabled' : 'Disabled'}
            </Button>
          </div>
          
          {/* Selection Controls */}
          <div>
            <h4 className="font-medium mb-2">Selection Controls</h4>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={selectAll}>
                Select All
              </Button>
              <Button size="sm" variant="outline" onClick={selectNone}>
                Select None
              </Button>
              <Badge variant="secondary">
                {selectedQuestions.length} selected
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Status Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Questions:</span>
              <span className="ml-2 font-medium">{questions.length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">View Mode:</span>
              <span className="ml-2 font-medium capitalize">{viewMode}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Layout:</span>
              <span className="ml-2 font-medium capitalize">{layout}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Performance:</span>
              <span className="ml-2 font-medium">
                {performanceMetrics.renderTime.toFixed(1)}ms
              </span>
            </div>
          </div>
          
          {performanceMetrics.shouldUseVirtualScrolling && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>Performance Tip:</strong> {performanceMetrics.recommendation}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Separator />
      
      {/* Enhanced Question List */}
      <EnhancedQuestionList
        questions={questions}
        loading={isLoading}
        selectedQuestions={selectedQuestions}
        onSelectionChange={setSelectedQuestions}
        onQuestionEdit={handleQuestionEdit}
        onQuestionDelete={handleQuestionDelete}
        onQuestionView={handleQuestionView}
        onQuestionDuplicate={handleQuestionDuplicate}
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
        userRole="ADMIN"
        showBulkActions={demoSettings.showBulkActions}
        showActions={demoSettings.showActions}
        showPreview={demoSettings.showPreview}
        viewMode={forcedViewMode}
        onViewModeChange={setViewMode}
        layout={forcedLayout}
        onLayoutChange={setLayout}
        containerHeight={demoSettings.containerHeight}
        enableVirtualScrolling={demoSettings.enableVirtualScrolling}
        virtualScrollingThreshold={demoSettings.virtualScrollingThreshold}
        onRefresh={refetch}
        className="enhanced-list-demo"
      />
    </div>
  );
}
