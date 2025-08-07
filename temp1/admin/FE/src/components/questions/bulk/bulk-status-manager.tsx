/**
 * Bulk Status Manager Component
 *
 * Enhanced bulk status management với advanced workflow capabilities
 * Provides conditional transitions, validation, và progress tracking
 *
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Label,
  Textarea,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Progress,
  Alert,
  AlertDescription,
  Checkbox,
  Input,
  Separator,
} from "@/components/ui";
import {
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Loader2,
  Filter,
  Plus,
  Trash2,
  Eye,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

/**
 * Question status enum
 */
type QuestionStatus = "PENDING" | "ACTIVE" | "INACTIVE" | "ARCHIVED";

/**
 * Status transition condition interface
 */
interface StatusCondition {
  field: "status" | "usageCount" | "creator" | "createdAt";
  operator: "equals" | "not_equals" | "greater_than" | "less_than" | "in" | "not_in";
  value: any;
}

/**
 * Bulk status operation result
 */
interface BulkStatusResult {
  jobId: string;
  totalQuestions: number;
  processedQuestions: number;
  successfulTransitions: number;
  failedTransitions: number;
  skippedQuestions: number;
  results: Array<{
    questionId: string;
    questionCode?: string;
    success: boolean;
    oldStatus?: QuestionStatus;
    newStatus?: QuestionStatus;
    error?: string;
    skipped?: boolean;
    skipReason?: string;
  }>;
  summary: {
    fromStatus: Record<string, number>;
    toStatus: Record<string, number>;
    errors: Record<string, number>;
  };
  processingTimeMs: number;
  canRollback: boolean;
}

/**
 * Component props
 */
interface BulkStatusManagerProps {
  selectedQuestions: string[];
  onStatusChanged: () => void;
  className?: string;
}

/**
 * Bulk Status Manager Component
 */
export function BulkStatusManager({
  selectedQuestions,
  onStatusChanged,
  className = "",
}: BulkStatusManagerProps) {
  // State management
  const [isOpen, setIsOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<QuestionStatus>("ACTIVE");
  const [reason, setReason] = useState("");
  const [conditions, setConditions] = useState<StatusCondition[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationResult, setValidationResult] = useState<BulkStatusResult | null>(null);
  const [operationResult, setOperationResult] = useState<BulkStatusResult | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [validateOnly, setValidateOnly] = useState(false);

  // Available status options
  const statusOptions = [
    { value: "PENDING", label: "Pending", description: "Chờ xử lý" },
    { value: "ACTIVE", label: "Active", description: "Đang hoạt động" },
    { value: "INACTIVE", label: "Inactive", description: "Tạm ngưng" },
    { value: "ARCHIVED", label: "Archived", description: "Lưu trữ" },
  ];

  // Condition field options
  const conditionFields = [
    { value: "status", label: "Current Status", type: "enum" },
    { value: "usageCount", label: "Usage Count", type: "number" },
    { value: "creator", label: "Creator", type: "string" },
    { value: "createdAt", label: "Created Date", type: "date" },
  ];

  // Operator options
  const operatorOptions = {
    enum: [
      { value: "equals", label: "Equals" },
      { value: "not_equals", label: "Not Equals" },
      { value: "in", label: "In" },
      { value: "not_in", label: "Not In" },
    ],
    number: [
      { value: "equals", label: "Equals" },
      { value: "not_equals", label: "Not Equals" },
      { value: "greater_than", label: "Greater Than" },
      { value: "less_than", label: "Less Than" },
    ],
    string: [
      { value: "equals", label: "Equals" },
      { value: "not_equals", label: "Not Equals" },
    ],
    date: [
      { value: "greater_than", label: "After" },
      { value: "less_than", label: "Before" },
    ],
  };

  /**
   * Reset form state
   */
  const resetForm = () => {
    setTargetStatus("ACTIVE");
    setReason("");
    setConditions([]);
    setValidationResult(null);
    setOperationResult(null);
    setShowAdvanced(false);
    setValidateOnly(false);
  };

  /**
   * Handle dialog open/close
   */
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetForm();
    }
  };

  /**
   * Add new condition
   */
  const addCondition = () => {
    setConditions([
      ...conditions,
      {
        field: "status",
        operator: "equals",
        value: "",
      },
    ]);
  };

  /**
   * Remove condition
   */
  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  /**
   * Update condition
   */
  const updateCondition = (index: number, updates: Partial<StatusCondition>) => {
    const newConditions = [...conditions];
    newConditions[index] = { ...newConditions[index], ...updates };
    setConditions(newConditions);
  };

  /**
   * Validate bulk status transition
   */
  const validateTransition = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch("/api/admin/questions/bulk/status/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionIds: selectedQuestions,
          targetStatus,
          conditions: conditions.length > 0 ? conditions : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Validation failed");
      }

      const result: BulkStatusResult = await response.json();
      setValidationResult(result);

      toast.success(
        `Validation completed: ${result.successfulTransitions}/${result.totalQuestions} questions can be transitioned`
      );
    } catch (error) {
      toast.error("Validation failed: " + (error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Execute bulk status transition
   */
  const executeTransition = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch("/api/admin/questions/bulk/status/transition", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionIds: selectedQuestions,
          targetStatus,
          reason: reason.trim() || undefined,
          conditions: conditions.length > 0 ? conditions : undefined,
          validateOnly,
        }),
      });

      if (!response.ok) {
        throw new Error("Status transition failed");
      }

      const result: BulkStatusResult = await response.json();
      setOperationResult(result);

      if (validateOnly) {
        toast.success(
          `Validation completed: ${result.successfulTransitions}/${result.totalQuestions} questions can be transitioned`
        );
      } else {
        toast.success(
          `Status transition completed: ${result.successfulTransitions}/${result.totalQuestions} questions updated`
        );
        onStatusChanged();
      }
    } catch (error) {
      toast.error("Operation failed: " + (error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Get status badge
   */
  const getStatusBadge = (status: QuestionStatus) => {
    const variants = {
      PENDING: "bg-yellow-100 text-yellow-800",
      ACTIVE: "bg-green-100 text-green-800",
      INACTIVE: "bg-gray-100 text-gray-800",
      ARCHIVED: "bg-red-100 text-red-800",
    };

    return (
      <Badge className={variants[status]}>
        {statusOptions.find((s) => s.value === status)?.label}
      </Badge>
    );
  };

  /**
   * Render condition input
   */
  const renderConditionValue = (condition: StatusCondition, index: number) => {
    const field = conditionFields.find((f) => f.value === condition.field);

    if (field?.type === "enum" && condition.field === "status") {
      return (
        <Select
          value={condition.value}
          onValueChange={(value) => updateCondition(index, { value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (field?.type === "number") {
      return (
        <Input
          type="number"
          value={condition.value}
          onChange={(e) => updateCondition(index, { value: parseInt(e.target.value) || 0 })}
          placeholder="Enter number"
        />
      );
    }

    if (field?.type === "date") {
      return (
        <Input
          type="date"
          value={condition.value}
          onChange={(e) => updateCondition(index, { value: e.target.value })}
        />
      );
    }

    return (
      <Input
        value={condition.value}
        onChange={(e) => updateCondition(index, { value: e.target.value })}
        placeholder="Enter value"
      />
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={selectedQuestions.length === 0}>
          <Settings className="h-4 w-4 mr-2" />
          Manage Status
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Bulk Status Management
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Selection Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{selectedQuestions.length} questions selected</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="validate-only"
                    checked={validateOnly}
                    onCheckedChange={setValidateOnly}
                  />
                  <Label htmlFor="validate-only" className="text-sm">
                    Validate only (don't execute)
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="target-status">Target Status</Label>
              <Select
                value={targetStatus}
                onValueChange={(value: QuestionStatus) => setTargetStatus(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(option.value as QuestionStatus)}
                        <span className="text-sm text-muted-foreground">{option.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="reason">Reason (Optional)</Label>
              <Input
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for status change"
              />
            </div>
          </div>

          {/* Advanced Conditions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Advanced Conditions</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowAdvanced(!showAdvanced)}>
                  <Filter className="h-4 w-4 mr-2" />
                  {showAdvanced ? "Hide" : "Show"} Conditions
                </Button>
              </div>
            </CardHeader>
            {showAdvanced && (
              <CardContent className="space-y-4">
                {conditions.map((condition, index) => (
                  <div key={index} className="grid grid-cols-4 gap-2 items-end">
                    <div>
                      <Label className="text-xs">Field</Label>
                      <Select
                        value={condition.field}
                        onValueChange={(value: any) => updateCondition(index, { field: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {conditionFields.map((field) => (
                            <SelectItem key={field.value} value={field.value}>
                              {field.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs">Operator</Label>
                      <Select
                        value={condition.operator}
                        onValueChange={(value: any) => updateCondition(index, { operator: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {operatorOptions[
                            conditionFields.find((f) => f.value === condition.field)
                              ?.type as keyof typeof operatorOptions
                          ]?.map((op) => (
                            <SelectItem key={op.value} value={op.value}>
                              {op.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs">Value</Label>
                      {renderConditionValue(condition, index)}
                    </div>

                    <Button variant="ghost" size="sm" onClick={() => removeCondition(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <Button variant="outline" size="sm" onClick={addCondition} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Condition
                </Button>
              </CardContent>
            )}
          </Card>

          {/* Validation Results */}
          {(validationResult || operationResult) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  {operationResult && !validateOnly ? "Operation Results" : "Validation Results"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const result = operationResult || validationResult;
                  if (!result) return null;

                  return (
                    <div className="space-y-4">
                      {/* Summary */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {result.successfulTransitions}
                          </div>
                          <div className="text-sm text-muted-foreground">Successful</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">
                            {result.failedTransitions}
                          </div>
                          <div className="text-sm text-muted-foreground">Failed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-600">
                            {result.skippedQuestions}
                          </div>
                          <div className="text-sm text-muted-foreground">Skipped</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{result.totalQuestions}</div>
                          <div className="text-sm text-muted-foreground">Total</div>
                        </div>
                      </div>

                      {/* Progress */}
                      <Progress
                        value={(result.successfulTransitions / result.totalQuestions) * 100}
                        className="h-2"
                      />

                      {/* Processing Time */}
                      <div className="text-sm text-muted-foreground">
                        Processing time: {result.processingTimeMs}ms
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={validateTransition}
                disabled={isProcessing || selectedQuestions.length === 0}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Eye className="h-4 w-4 mr-2" />
                )}
                Validate
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={executeTransition}
                disabled={isProcessing || selectedQuestions.length === 0}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                {validateOnly ? "Validate" : "Execute"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
