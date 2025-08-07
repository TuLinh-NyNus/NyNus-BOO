/**
 * Connection Status Component
 * Component hiển thị trạng thái kết nối WebSocket
 */

"use client";

import React from "react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import {
  Wifi,
  WifiOff,
  Loader2,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Activity,
  Clock,
} from "lucide-react";

import { useWebSocket } from "./websocket-provider";
import {
  getConnectionStatusColor,
  getConnectionStatusText,
  formatUptime,
} from "../../lib/websocket/websocket-utils";

/**
 * Connection Status Props
 * Props cho Connection Status component
 */
interface ConnectionStatusProps {
  showDetails?: boolean;
  showActions?: boolean;
  className?: string;
}

/**
 * Connection Status Component
 * Component hiển thị trạng thái kết nối WebSocket với details và actions
 */
export function ConnectionStatus({
  showDetails = false,
  showActions = false,
  className = "",
}: ConnectionStatusProps) {
  const {
    connectionStatus,
    isConnected,
    isConnecting,
    isReconnecting,
    hasError,
    error,
    connect,
    disconnect,
    reconnect,
    getConnectionStats,
    getActiveSubscriptions,
  } = useWebSocket();

  const stats = getConnectionStats();
  const subscriptions = getActiveSubscriptions();

  /**
   * Get status icon
   * Lấy icon cho trạng thái
   */
  const getStatusIcon = () => {
    if (isConnected) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (isConnecting || isReconnecting) {
      return <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />;
    } else if (hasError) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    } else {
      return <WifiOff className="h-4 w-4 text-gray-500" />;
    }
  };

  /**
   * Get status badge variant
   * Lấy variant cho status badge
   */
  const getStatusVariant = () => {
    if (isConnected) return "default";
    if (isConnecting || isReconnecting) return "secondary";
    if (hasError) return "destructive";
    return "outline";
  };

  /**
   * Handle reconnect action
   * Xử lý action reconnect
   */
  const handleReconnect = async () => {
    try {
      await reconnect();
    } catch (error) {
      console.error("Failed to reconnect:", error);
    }
  };

  /**
   * Handle disconnect action
   * Xử lý action disconnect
   */
  const handleDisconnect = () => {
    disconnect();
  };

  /**
   * Handle connect action
   * Xử lý action connect
   */
  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error("Failed to connect:", error);
    }
  };

  if (!showDetails) {
    // Simple status indicator
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {getStatusIcon()}
        <Badge variant={getStatusVariant()}>
          {getConnectionStatusText(connectionStatus.state)}
        </Badge>
      </div>
    );
  }

  // Detailed status card
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Activity className="h-4 w-4" />
          Trạng thái WebSocket
        </CardTitle>
        <CardDescription>Kết nối real-time cho cập nhật admin</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-sm font-medium">
              {getConnectionStatusText(connectionStatus.state)}
            </span>
          </div>
          <Badge variant={getStatusVariant()}>{connectionStatus.state.toUpperCase()}</Badge>
        </div>

        {/* Error Message */}
        {hasError && error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-700 font-medium">Lỗi kết nối</span>
            </div>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        )}

        {/* Reconnection Info */}
        {isReconnecting && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />
              <span className="text-sm text-yellow-700 font-medium">Đang kết nối lại...</span>
            </div>
            <p className="text-sm text-yellow-600 mt-1">
              Lần thử: {connectionStatus.reconnectAttempts}/{connectionStatus.maxReconnectAttempts}
            </p>
          </div>
        )}

        {/* Connection Details */}
        {isConnected && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Thời gian kết nối:</span>
              <span className="font-medium">
                {stats.connectedAt ? formatUptime(stats.uptime) : "N/A"}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Subscriptions:</span>
              <span className="font-medium">{subscriptions.length}</span>
            </div>

            {stats.totalReconnects > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Tổng số lần kết nối lại:</span>
                <span className="font-medium">{stats.totalReconnects}</span>
              </div>
            )}
          </div>
        )}

        {/* Active Subscriptions */}
        {isConnected && subscriptions.length > 0 && (
          <div className="space-y-2">
            <span className="text-sm font-medium text-gray-700">Subscriptions đang hoạt động:</span>
            <div className="flex flex-wrap gap-1">
              {subscriptions.map((subscription) => (
                <Badge key={subscription} variant="outline" className="text-xs">
                  {subscription}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Connection Actions */}
        {showActions && (
          <div className="flex gap-2 pt-2 border-t">
            {isConnected ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
                className="flex items-center gap-2"
              >
                <WifiOff className="h-3 w-3" />
                Ngắt kết nối
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleConnect}
                disabled={isConnecting}
                className="flex items-center gap-2"
              >
                {isConnecting ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Wifi className="h-3 w-3" />
                )}
                Kết nối
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleReconnect}
              disabled={isConnecting || isReconnecting}
              className="flex items-center gap-2"
            >
              {isReconnecting ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
              Kết nối lại
            </Button>
          </div>
        )}

        {/* Last Connected/Disconnected */}
        <div className="text-xs text-gray-500 space-y-1">
          {stats.connectedAt && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Kết nối lần cuối: {stats.connectedAt.toLocaleString("vi-VN")}</span>
            </div>
          )}
          {stats.disconnectedAt && !isConnected && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Ngắt kết nối lần cuối: {stats.disconnectedAt.toLocaleString("vi-VN")}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Simple Connection Indicator
 * Indicator đơn giản cho connection status
 */
export function ConnectionIndicator({ className = "" }: { className?: string }) {
  return <ConnectionStatus showDetails={false} showActions={false} className={className} />;
}

/**
 * Connection Status Card
 * Card chi tiết cho connection status
 */
export function ConnectionStatusCard({ className = "" }: { className?: string }) {
  return <ConnectionStatus showDetails={true} showActions={true} className={className} />;
}
