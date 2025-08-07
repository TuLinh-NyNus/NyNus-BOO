/**
 * Bulk Delete Manager Component
 *
 * Enhanced delete operations với comprehensive safety features
 * Provides impact analysis, multi-step confirmations, và undo functionality
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
  Separator,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import {
  Trash2,
  AlertTriangle,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  RotateCcw,
  AlertCircle,
  Info,
} from "lucide-react";
import { toast } from "sonner";

/**
 * Delete impact analysis interface
 */
interface DeleteImpactAnalysis {
  questionId: string;
  questionCode?: string;
  canDelete: boolean;
  warnings: string[];
  blockers: string[];
  relatedData: {
    images: number;
    tags: number;
    feedbacks: number;
    examUsage: number;
    examIds?: string[];
  };
  usageCount: number;
  status: string;
}

/**
 * Delete result interface
 */
interface BulkDeleteResult {
  jobId: string;
  totalQuestions: number;
  successfulDeletes: number;
  failedDeletes: number;
  skippedQuestions: number;
  canUndo: boolean;
  undoExpiresAt?: string;
  summary: {
    relatedDataDeleted: {
      images: number;
      tags: number;
      feedbacks: number;
    };
  };
  processingTimeMs: number;
}

/**
 * Component props
 */
interface BulkDeleteManagerProps {
  selectedQuestions: string[];
  onDeleteCompleted: () => void;
  className?: string;
}

/**
 * Bulk Delete Manager Component
 */
export function BulkDeleteManager({
  selectedQuestions,
  onDeleteCompleted,
  className = "",
}: BulkDeleteManagerProps) {
  // State management
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<
    "select" | "analyze" | "confirm" | "execute" | "result"
  >("select");
  const [deleteType, setDeleteType] = useState<"soft" | "hard">("soft");
  const [reason, setReason] = useState("");
  const [forceDelete, setForceDelete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [impactAnalysis, setImpactAnalysis] = useState<DeleteImpactAnalysis[]>([]);
  const [deleteResult, setDeleteResult] = useState<BulkDeleteResult | null>(null);
  const [undoCountdown, setUndoCountdown] = useState<number>(0);

  // Delete type options
  const deleteTypeOptions = [
    {
      value: "soft",
      label: "Soft Delete (Archive)",
      description: "Move questions to archived status (reversible)",
      icon: <Shield className="h-4 w-4" />,
      safety: "High",
      color: "bg-green-100 text-green-800",
    },
    {
      value: "hard",
      label: "Hard Delete (Permanent)",
      description: "Permanently remove from database (irreversible)",
      icon: <AlertTriangle className="h-4 w-4" />,
      safety: "Critical",
      color: "bg-red-100 text-red-800",
    },
  ];

  /**
   * Reset form state
   */
  const resetForm = () => {
    setCurrentStep("select");
    setDeleteType("soft");
    setReason("");
    setForceDelete(false);
    setImpactAnalysis([]);
    setDeleteResult(null);
    setUndoCountdown(0);
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
   * Analyze delete impact
   */
  const analyzeImpact = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch("/api/admin/questions/bulk/delete/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionIds: selectedQuestions,
        }),
      });

      if (!response.ok) {
        throw new Error("Impact analysis failed");
      }

      const analysis: DeleteImpactAnalysis[] = await response.json();
      setImpactAnalysis(analysis);
      setCurrentStep("analyze");

      toast.success(`Impact analysis completed for ${analysis.length} questions`);
    } catch (error) {
      toast.error("Impact analysis failed: " + (error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Execute delete operation
   */
  const executeDelete = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch("/api/admin/questions/bulk/delete/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionIds: selectedQuestions,
          deleteType,
          reason: reason.trim() || undefined,
          forceDelete,
          validateOnly: false,
        }),
      });

      if (!response.ok) {
        throw new Error("Delete operation failed");
      }

      const result: BulkDeleteResult = await response.json();
      setDeleteResult(result);
      setCurrentStep("result");

      // Start undo countdown if applicable
      if (result.canUndo && result.undoExpiresAt) {
        const expiresAt = new Date(result.undoExpiresAt).getTime();
        const updateCountdown = () => {
          const remaining = Math.max(0, expiresAt - Date.now());
          setUndoCountdown(remaining);
          if (remaining > 0) {
            setTimeout(updateCountdown, 1000);
          }
        };
        updateCountdown();
      }

      toast.success(
        `Delete operation completed: ${result.successfulDeletes}/${result.totalQuestions} questions deleted`
      );
      onDeleteCompleted();
    } catch (error) {
      toast.error("Delete operation failed: " + (error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Undo delete operation
   */
  const undoDelete = async () => {
    if (!deleteResult?.jobId) return;

    setIsProcessing(true);
    try {
      const response = await fetch("/api/admin/questions/bulk/delete/undo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId: deleteResult.jobId,
        }),
      });

      if (!response.ok) {
        throw new Error("Undo operation failed");
      }

      const result = await response.json();
      toast.success(`Undo completed: ${result.restoredQuestions} questions restored`);
      onDeleteCompleted();
      setIsOpen(false);
    } catch (error) {
      toast.error("Undo failed: " + (error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Get safety badge
   */
  const getSafetyBadge = (type: "soft" | "hard") => {
    const option = deleteTypeOptions.find((opt) => opt.value === type);
    return (
      <Badge className={option?.color}>
        {option?.icon}
        <span className="ml-1">{option?.safety} Safety</span>
      </Badge>
    );
  };

  /**
   * Format countdown time
   */
  const formatCountdown = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  /**
   * Render step content
   */
  const renderStepContent = () => {
    switch (currentStep) {
      case "select":
        return (
          <div className="space-y-6">
            {/* Selection Summary */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{selectedQuestions.length} questions selected</Badge>
                  {getSafetyBadge(deleteType)}
                </div>
              </CardContent>
            </Card>

            {/* Delete Type Selection */}
            <div>
              <Label htmlFor="delete-type">Delete Type</Label>
              <Select
                value={deleteType}
                onValueChange={(value: "soft" | "hard") => setDeleteType(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {deleteTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        {option.icon}
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-sm text-muted-foreground">{option.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Reason */}
            <div>
              <Label htmlFor="reason">Reason for Deletion</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for deleting these questions..."
                rows={3}
              />
            </div>

            {/* Hard Delete Warning */}
            {deleteType === "hard" && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Warning:</strong> Hard delete permanently removes questions from the
                  database. This action cannot be undone. Consider using soft delete instead.
                  <div className="mt-2">
                    <Checkbox
                      id="force-delete"
                      checked={forceDelete}
                      onCheckedChange={setForceDelete}
                    />
                    <Label htmlFor="force-delete" className="ml-2">
                      I understand this is permanent and cannot be undone
                    </Label>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={analyzeImpact}
                disabled={
                  isProcessing ||
                  selectedQuestions.length === 0 ||
                  (deleteType === "hard" && !forceDelete)
                }
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Eye className="h-4 w-4 mr-2" />
                )}
                Analyze Impact
              </Button>
            </div>
          </div>
        );

      case "analyze":
        const deletableQuestions = impactAnalysis.filter((q) => q.canDelete);
        const blockedQuestions = impactAnalysis.filter((q) => !q.canDelete);

        return (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {deletableQuestions.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Can Delete</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{blockedQuestions.length}</div>
                  <div className="text-sm text-muted-foreground">Blocked</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">
                    {impactAnalysis.reduce(
                      (sum, q) =>
                        sum + q.relatedData.images + q.relatedData.tags + q.relatedData.feedbacks,
                      0
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">Related Items</div>
                </CardContent>
              </Card>
            </div>

            {/* Blocked Questions */}
            {blockedQuestions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600 flex items-center gap-2">
                    <XCircle className="h-5 w-5" />
                    Blocked Questions ({blockedQuestions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {blockedQuestions.slice(0, 5).map((question) => (
                      <div
                        key={question.questionId}
                        className="flex items-center justify-between p-2 bg-red-50 rounded"
                      >
                        <span className="font-medium">{question.questionCode}</span>
                        <span className="text-sm text-red-600">{question.blockers.join(", ")}</span>
                      </div>
                    ))}
                    {blockedQuestions.length > 5 && (
                      <div className="text-sm text-muted-foreground">
                        ... and {blockedQuestions.length - 5} more
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => setCurrentStep("select")}>
                Back
              </Button>
              <Button
                onClick={() => setCurrentStep("confirm")}
                disabled={deletableQuestions.length === 0}
              >
                Continue to Confirmation
              </Button>
            </div>
          </div>
        );

      case "confirm":
        return (
          <div className="space-y-6">
            {/* Final Confirmation */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Final Confirmation:</strong> You are about to {deleteType} delete{" "}
                {impactAnalysis.filter((q) => q.canDelete).length} questions.
                {deleteType === "soft"
                  ? " Questions will be archived and can be restored within 24 hours."
                  : " This action is permanent and cannot be undone."}
              </AlertDescription>
            </Alert>

            {/* Summary */}
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="font-medium">Delete Type</div>
                    <div className="flex items-center gap-2">{getSafetyBadge(deleteType)}</div>
                  </div>
                  <div>
                    <div className="font-medium">Questions</div>
                    <div>{impactAnalysis.filter((q) => q.canDelete).length} will be deleted</div>
                  </div>
                  <div>
                    <div className="font-medium">Reason</div>
                    <div className="text-sm text-muted-foreground">
                      {reason || "No reason provided"}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Related Data</div>
                    <div className="text-sm">
                      {impactAnalysis.reduce((sum, q) => sum + q.relatedData.images, 0)} images,{" "}
                      {impactAnalysis.reduce((sum, q) => sum + q.relatedData.tags, 0)} tags,{" "}
                      {impactAnalysis.reduce((sum, q) => sum + q.relatedData.feedbacks, 0)}{" "}
                      feedbacks
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => setCurrentStep("analyze")}>
                Back
              </Button>
              <Button
                onClick={executeDelete}
                disabled={isProcessing}
                variant={deleteType === "hard" ? "destructive" : "default"}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Confirm {deleteType === "hard" ? "Permanent" : ""} Delete
              </Button>
            </div>
          </div>
        );

      case "result":
        return (
          <div className="space-y-6">
            {/* Result Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {deleteResult?.successfulDeletes}
                  </div>
                  <div className="text-sm text-muted-foreground">Deleted</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {deleteResult?.failedDeletes}
                  </div>
                  <div className="text-sm text-muted-foreground">Failed</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {deleteResult?.skippedQuestions}
                  </div>
                  <div className="text-sm text-muted-foreground">Skipped</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">{deleteResult?.totalQuestions}</div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </CardContent>
              </Card>
            </div>

            {/* Undo Section */}
            {deleteResult?.canUndo && undoCountdown > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RotateCcw className="h-5 w-5" />
                    Undo Available
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Time remaining: {formatCountdown(undoCountdown)}</span>
                    </div>
                    <Progress
                      value={(undoCountdown / (24 * 60 * 60 * 1000)) * 100}
                      className="h-2"
                    />
                    <Button
                      onClick={undoDelete}
                      disabled={isProcessing}
                      variant="outline"
                      className="w-full"
                    >
                      {isProcessing ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <RotateCcw className="h-4 w-4 mr-2" />
                      )}
                      Undo Delete Operation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Processing Time */}
            <div className="text-sm text-muted-foreground">
              Processing time: {deleteResult?.processingTimeMs}ms
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end">
              <Button onClick={() => setIsOpen(false)}>Close</Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm" disabled={selectedQuestions.length === 0}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Questions
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Bulk Delete Questions
            {currentStep !== "select" && (
              <Badge variant="outline">
                Step{" "}
                {["select", "analyze", "confirm", "execute", "result"].indexOf(currentStep) + 1} of
                4
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {renderStepContent()}
      </DialogContent>
    </Dialog>
  );
}
