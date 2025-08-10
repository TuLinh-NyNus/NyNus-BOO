/**
 * Streamlit Launcher Component
 * Component để khởi động ứng dụng Streamlit parsing LaTeX questions
 */

"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/form/button";
import { Badge } from "@/components/ui/display/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/display/card";
import { 
  Play, 
  Square, 
  ExternalLink, 
  FileText, 
  Upload,
  Settings,
  Activity,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { toast } from "sonner";

/**
 * Streamlit service status
 */
type StreamlitStatus = 'stopped' | 'starting' | 'running' | 'error';

/**
 * Streamlit Launcher Props
 */
interface StreamlitLauncherProps {
  className?: string;
}

/**
 * Streamlit Launcher Component
 */
export function StreamlitLauncher({ className = "" }: StreamlitLauncherProps) {
  // State management
  const [status, setStatus] = useState<StreamlitStatus>('stopped');
  const [streamlitUrl, setStreamlitUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Khởi động Streamlit service
   */
  const handleStartStreamlit = async () => {
    setIsLoading(true);
    setStatus('starting');

    try {
      // Call API để khởi động Streamlit
      const response = await fetch('/api/admin/tools/streamlit/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to start Streamlit service');
      }

      const data = await response.json();
      
      setStatus('running');
      setStreamlitUrl(data.url || 'http://localhost:8501');
      
      toast.success('Streamlit đã được khởi động thành công!', {
        description: 'Ứng dụng parsing LaTeX questions đã sẵn sàng sử dụng.',
      });

    } catch (error) {
      console.error('Error starting Streamlit:', error);
      setStatus('error');
      
      toast.error('Không thể khởi động Streamlit', {
        description: 'Vui lòng kiểm tra lại cấu hình và thử lại.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Dừng Streamlit service
   */
  const handleStopStreamlit = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/tools/streamlit/stop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to stop Streamlit service');
      }

      setStatus('stopped');
      setStreamlitUrl('');
      
      toast.success('Streamlit đã được dừng thành công!');

    } catch (error) {
      console.error('Error stopping Streamlit:', error);
      
      toast.error('Không thể dừng Streamlit', {
        description: 'Vui lòng kiểm tra lại và thử lại.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Mở Streamlit trong tab mới
   */
  const handleOpenStreamlit = () => {
    if (streamlitUrl) {
      window.open(streamlitUrl, '_blank', 'noopener,noreferrer');
    }
  };

  /**
   * Kiểm tra trạng thái Streamlit
   */
  const handleCheckStatus = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/tools/streamlit/status');
      const data = await response.json();
      
      setStatus(data.status);
      if (data.url) {
        setStreamlitUrl(data.url);
      }

    } catch (error) {
      console.error('Error checking Streamlit status:', error);
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get status badge
   */
  const getStatusBadge = () => {
    switch (status) {
      case 'running':
        return (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Đang chạy
          </Badge>
        );
      case 'starting':
        return (
          <Badge variant="secondary">
            <Activity className="h-3 w-3 mr-1 animate-spin" />
            Đang khởi động
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Lỗi
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <Square className="h-3 w-3 mr-1" />
            Đã dừng
          </Badge>
        );
    }
  };

  /**
   * Get main action button
   */
  const getMainActionButton = () => {
    if (status === 'running') {
      return (
        <div className="flex gap-2">
          <Button
            onClick={handleOpenStreamlit}
            className="flex-1"
            disabled={!streamlitUrl}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Mở Streamlit
          </Button>
          <Button
            variant="outline"
            onClick={handleStopStreamlit}
            disabled={isLoading}
          >
            <Square className="h-4 w-4 mr-2" />
            Dừng
          </Button>
        </div>
      );
    }

    return (
      <Button
        onClick={handleStartStreamlit}
        disabled={isLoading || status === 'starting'}
        className="w-full"
      >
        <Play className="h-4 w-4 mr-2" />
        {status === 'starting' ? 'Đang khởi động...' : 'Khởi động Streamlit'}
      </Button>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              LaTeX Question Parser
            </CardTitle>
            <CardDescription>
              Ứng dụng Streamlit để parsing và chuyển đổi câu hỏi từ LaTeX sang CSV
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main Action Button */}
        {getMainActionButton()}

        {/* Status Check Button */}
        <Button
          variant="ghost"
          onClick={handleCheckStatus}
          disabled={isLoading}
          className="w-full"
        >
          <Activity className="h-4 w-4 mr-2" />
          Kiểm tra trạng thái
        </Button>

        {/* Features List */}
        <div className="space-y-2 pt-4 border-t">
          <h4 className="text-sm font-medium text-muted-foreground">Tính năng:</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li className="flex items-center gap-2">
              <Upload className="h-3 w-3" />
              Upload file LaTeX (.tex)
            </li>
            <li className="flex items-center gap-2">
              <FileText className="h-3 w-3" />
              Parse câu hỏi tự động
            </li>
            <li className="flex items-center gap-2">
              <Settings className="h-3 w-3" />
              Xuất CSV có cấu trúc
            </li>
          </ul>
        </div>

        {/* URL Display */}
        {streamlitUrl && status === 'running' && (
          <div className="p-3 bg-muted rounded-md">
            <p className="text-xs text-muted-foreground mb-1">URL:</p>
            <code className="text-xs">{streamlitUrl}</code>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
