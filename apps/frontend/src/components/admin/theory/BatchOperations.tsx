/**
 * Enhanced Batch Operations Component
 * Real implementation thay thế mock BulkOperations
 */

'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/display/separator';
import {
  RefreshCw,
  HardDrive,
  CheckCircle,
  Upload,
  Download,
  FileText,
  Zap,
  Settings,
  AlertTriangle
} from 'lucide-react';

import { ProgressTracker } from './ProgressTracker';
import { batchOperationsService } from './services/batch-operations.service';
import type { 
  BulkOperationType, 
  BulkOperationRequest, 
  BulkOperationResult 
} from '@/lib/types/admin/theory';
import type { BatchOperationProgress } from './services/batch-operations.service';

// ===== INTERFACES =====

interface BatchOperationsProps {
  /** Callback khi operation hoàn thành */
  onOperationComplete?: (result: BulkOperationResult) => void;
  /** Show advanced options */
  showAdvancedOptions?: boolean;
}

interface OperationConfig {
  id: BulkOperationType;
  label: string;
  description: string;
  icon: React.ReactNode;
  variant: 'default' | 'outline' | 'destructive';
  requiresConfirmation: boolean;
}

// ===== OPERATION CONFIGURATIONS =====

const OPERATION_CONFIGS: OperationConfig[] = [
  {
    id: 'parse_all',
    label: 'Parse All Files',
    description: 'Parse tất cả LaTeX files và generate metadata',
    icon: <RefreshCw className="h-4 w-4" />,
    variant: 'default',
    requiresConfirmation: true
  },
  {
    id: 'validate_syntax',
    label: 'Validate Syntax',
    description: 'Kiểm tra syntax errors trong LaTeX files',
    icon: <CheckCircle className="h-4 w-4" />,
    variant: 'outline',
    requiresConfirmation: false
  },
  {
    id: 'generate_backup',
    label: 'Generate Backup',
    description: 'Tạo backup cho tất cả theory content',
    icon: <Upload className="h-4 w-4" />,
    variant: 'outline',
    requiresConfirmation: true
  },
  {
    id: 'export_content',
    label: 'Export Content',
    description: 'Export parsed content sang multiple formats',
    icon: <Download className="h-4 w-4" />,
    variant: 'outline',
    requiresConfirmation: false
  },
  {
    id: 'refresh_cache',
    label: 'Refresh Cache',
    description: 'Clear và rebuild theory content cache',
    icon: <HardDrive className="h-4 w-4" />,
    variant: 'outline',
    requiresConfirmation: false
  }
];

// ===== MAIN COMPONENT =====

/**
 * Enhanced Batch Operations Component
 * Real batch processing với progress tracking
 */
export function BatchOperations({ 
  onOperationComplete,
  showAdvancedOptions = false 
}: BatchOperationsProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [currentOperation, setCurrentOperation] = useState<BulkOperationType | null>(null);
  const [progress, setProgress] = useState<BatchOperationProgress | null>(null);
  const [result, setResult] = useState<BulkOperationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ===== OPERATION HANDLERS =====

  const handleOperation = useCallback(async (operationType: BulkOperationType) => {
    if (isRunning) {
      return;
    }

    const config = OPERATION_CONFIGS.find(op => op.id === operationType);
    
    // Confirmation cho operations quan trọng
    if (config?.requiresConfirmation) {
      const confirmed = window.confirm(
        `Bạn có chắc muốn thực hiện "${config.label}"?\n\n${config.description}`
      );
      if (!confirmed) {
        return;
      }
    }

    setIsRunning(true);
    setCurrentOperation(operationType);
    setProgress(null);
    setResult(null);
    setError(null);

    try {
      // Subscribe to progress updates
      const unsubscribe = batchOperationsService.onProgress((progressData) => {
        setProgress(progressData);
      });

      // Create operation request
      const request: BulkOperationRequest = {
        type: operationType,
        options: {
          forceReparse: true,
          includeBackup: true,
          exportFormat: 'json'
        }
      };

      // Execute operation
      const operationResult = await batchOperationsService.executeBatchOperation(request);
      
      // Cleanup
      unsubscribe();
      
      // Set result
      setResult(operationResult);
      setProgress(null);
      
      // Callback
      onOperationComplete?.(operationResult);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Batch operation failed:', err);
    } finally {
      setIsRunning(false);
      setCurrentOperation(null);
    }
  }, [isRunning, onOperationComplete]);

  const handleCancel = useCallback(() => {
    // TODO: Implement operation cancellation
    console.log('Cancel operation requested');
  }, []);

  const handleDownload = useCallback((downloadResult: BulkOperationResult) => {
    if (downloadResult.outputPath) {
      // TODO: Implement file download
      console.log('Download requested:', downloadResult.outputPath);
      
      // Simulate download
      const link = document.createElement('a');
      link.href = '#';
      link.download = downloadResult.outputPath.split('/').pop() || 'download';
      link.click();
    }
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  // ===== RENDER =====

  return (
    <div className="space-y-6">
      {/* Main Operations Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Batch Operations
              </CardTitle>
              <CardDescription>
                Thực hiện operations trên nhiều files cùng lúc với real-time progress tracking
              </CardDescription>
            </div>
            {result && (
              <Button variant="outline" size="sm" onClick={clearResult}>
                Clear Result
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Operation Failed</span>
              </div>
              <div className="text-sm text-red-600 mt-1">{error}</div>
            </div>
          )}

          {/* Operations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {OPERATION_CONFIGS.map((config) => (
              <Button
                key={config.id}
                variant={config.variant}
                onClick={() => handleOperation(config.id)}
                disabled={isRunning}
                className="h-auto p-4 flex flex-col items-start gap-2"
              >
                <div className="flex items-center gap-2 w-full">
                  {isRunning && currentOperation === config.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                  ) : (
                    config.icon
                  )}
                  <span className="font-medium">{config.label}</span>
                </div>
                <span className="text-xs text-left opacity-70">
                  {config.description}
                </span>
              </Button>
            ))}
          </div>

          {/* Advanced Options */}
          {showAdvancedOptions && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Advanced Options
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleOperation('parse_grade')}
                    disabled={isRunning}
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Parse by Grade
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Status Badge */}
          {isRunning && currentOperation && (
            <div className="flex items-center gap-2">
              <Badge variant="default" className="animate-pulse">
                Running: {OPERATION_CONFIGS.find(op => op.id === currentOperation)?.label}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress Tracker */}
      <ProgressTracker
        progress={progress}
        result={result}
        isRunning={isRunning}
        onCancel={handleCancel}
        onDownload={handleDownload}
        showDetails={true}
      />
    </div>
  );
}

export default BatchOperations;
