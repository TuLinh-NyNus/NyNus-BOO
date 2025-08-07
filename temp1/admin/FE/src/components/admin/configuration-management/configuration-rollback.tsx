/**
 * Configuration Rollback Component
 * Component cho configuration rollback functionality
 *
 * Features:
 * - Configuration history display
 * - Rollback to previous versions
 * - Rollback confirmation dialog
 * - Real-time rollback notifications
 * - Rollback reason tracking
 *
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/layout/card";
import { Button } from "../../ui/forms/button";
import { Badge } from "../../ui/data-display/badge";
import { Textarea } from "../../ui/forms/textarea";
import { Label } from "../../ui/forms/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/forms/dialog";
import {
  History,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { useConfigurationRealtime } from "../../../hooks/use-configuration-realtime";

/**
 * Configuration history item interface
 */
interface ConfigurationHistoryItem {
  id: string;
  configurationId: string;
  oldValue: any;
  newValue: any;
  changedBy: string;
  changedByEmail?: string;
  changeReason: string;
  changedAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Configuration rollback props
 */
interface ConfigurationRollbackProps {
  configurationId: string;
  category: string;
  configKey: string;
  currentValue: any;
  onRollbackSuccess?: () => void;
}

/**
 * Configuration Rollback Component
 */
export function ConfigurationRollback({
  configurationId,
  category,
  configKey,
  currentValue,
  onRollbackSuccess,
}: ConfigurationRollbackProps) {
  const [history, setHistory] = useState<ConfigurationHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [rollbackLoading, setRollbackLoading] = useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [rollbackReason, setRollbackReason] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Real-time updates
  const { recentRollbacks } = useConfigurationRealtime({
    categories: [category],
    onConfigurationRollback: (event) => {
      if (event.configurationId === configurationId) {
        loadHistory();
        onRollbackSuccess?.();
      }
    },
  });

  /**
   * Load configuration history
   */
  const loadHistory = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call
      // const response = await fetch(`/api/configuration/${configurationId}/history`);
      // const data = await response.json();

      // Mock data for now
      const mockHistory: ConfigurationHistoryItem[] = [
        {
          id: "1",
          configurationId,
          oldValue: 3,
          newValue: 5,
          changedBy: "admin-1",
          changedByEmail: "admin@nynus.com",
          changeReason: "Tăng số lần đăng nhập tối đa",
          changedAt: new Date("2025-07-27T09:15:00Z"),
          ipAddress: "192.168.1.100",
        },
        {
          id: "2",
          configurationId,
          oldValue: 5,
          newValue: 3,
          changedBy: "admin-1",
          changedByEmail: "admin@nynus.com",
          changeReason: "Giảm số lần đăng nhập để tăng bảo mật",
          changedAt: new Date("2025-07-26T14:30:00Z"),
          ipAddress: "192.168.1.100",
        },
      ];

      setHistory(mockHistory);
    } catch (error) {
      toast.error("Lỗi khi tải lịch sử cấu hình");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Perform rollback
   */
  const performRollback = async () => {
    if (!selectedHistoryId || !rollbackReason.trim()) {
      toast.error("Vui lòng chọn version và nhập lý do rollback");
      return;
    }

    setRollbackLoading(true);
    try {
      // TODO: Implement API call
      // const response = await fetch('/api/configuration/rollback', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     configurationId,
      //     targetHistoryId: selectedHistoryId,
      //     rollbackReason: rollbackReason.trim()
      //   })
      // });
      // const result = await response.json();

      // Mock success
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success(`Rollback thành công cho ${category}.${configKey}`);
      setDialogOpen(false);
      setSelectedHistoryId(null);
      setRollbackReason("");
      loadHistory();
      onRollbackSuccess?.();
    } catch (error) {
      toast.error("Lỗi khi thực hiện rollback");
    } finally {
      setRollbackLoading(false);
    }
  };

  /**
   * Format value for display
   */
  const formatValue = (value: any) => {
    if (typeof value === "object") {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  /**
   * Get selected history item
   */
  const selectedHistory = history.find((h) => h.id === selectedHistoryId);

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, [configurationId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <History className="h-5 w-5" />
          <span>Lịch sử thay đổi</span>
          <Badge variant="outline">
            {category}.{configKey}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Value */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-blue-800">Giá trị hiện tại</span>
            <Badge className="bg-blue-100 text-blue-800">Current</Badge>
          </div>
          <div className="font-mono text-sm bg-white p-2 rounded border">
            {formatValue(currentValue)}
          </div>
        </div>

        {/* History List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Đang tải lịch sử...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8">
              <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Chưa có lịch sử thay đổi</h3>
              <p className="text-muted-foreground">
                Configuration này chưa có thay đổi nào được ghi lại
              </p>
            </div>
          ) : (
            history.map((item, index) => (
              <div
                key={item.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Badge variant="outline" className="text-xs">
                        Version {history.length - index}
                      </Badge>
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>{item.changedByEmail || item.changedBy}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{item.changedAt.toLocaleString("vi-VN")}</span>
                      </div>
                    </div>

                    <div className="text-sm mb-3">
                      <span className="font-medium">Lý do: </span>
                      <span>{item.changeReason}</span>
                    </div>

                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="text-muted-foreground">Từ:</span>
                        <code className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                          {formatValue(item.oldValue)}
                        </code>
                      </div>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <div className="flex items-center space-x-2">
                        <span className="text-muted-foreground">Đến:</span>
                        <code className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                          {formatValue(item.newValue)}
                        </code>
                      </div>
                    </div>
                  </div>

                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedHistoryId(item.id)}
                        className="flex items-center space-x-1"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>Rollback</span>
                      </Button>
                    </DialogTrigger>

                    {selectedHistoryId === item.id && (
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="flex items-center space-x-2">
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                            <span>Xác nhận Rollback</span>
                          </DialogTitle>
                          <DialogDescription>
                            Bạn có chắc chắn muốn rollback configuration{" "}
                            <strong>
                              {category}.{configKey}
                            </strong>{" "}
                            về version trước đó không?
                          </DialogDescription>
                        </DialogHeader>

                        {selectedHistory && (
                          <div className="space-y-4">
                            <div className="p-3 bg-muted rounded-lg">
                              <div className="text-sm font-medium mb-2">
                                Thay đổi sẽ được thực hiện:
                              </div>
                              <div className="flex items-center space-x-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Từ:</span>
                                  <code className="ml-2 bg-red-100 text-red-800 px-2 py-1 rounded">
                                    {formatValue(currentValue)}
                                  </code>
                                </div>
                                <ArrowRight className="h-3 w-3" />
                                <div>
                                  <span className="text-muted-foreground">Đến:</span>
                                  <code className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded">
                                    {formatValue(selectedHistory.newValue)}
                                  </code>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="rollback-reason">Lý do rollback *</Label>
                              <Textarea
                                id="rollback-reason"
                                value={rollbackReason}
                                onChange={(e) => setRollbackReason(e.target.value)}
                                placeholder="Nhập lý do thực hiện rollback..."
                                rows={3}
                              />
                            </div>
                          </div>
                        )}

                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setDialogOpen(false);
                              setSelectedHistoryId(null);
                              setRollbackReason("");
                            }}
                          >
                            Hủy
                          </Button>
                          <Button
                            onClick={performRollback}
                            disabled={rollbackLoading || !rollbackReason.trim()}
                            className="flex items-center space-x-2"
                          >
                            <RotateCcw className="h-4 w-4" />
                            <span>
                              {rollbackLoading ? "Đang rollback..." : "Xác nhận Rollback"}
                            </span>
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    )}
                  </Dialog>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
