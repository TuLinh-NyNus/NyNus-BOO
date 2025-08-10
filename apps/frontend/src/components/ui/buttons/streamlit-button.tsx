/**
 * Streamlit Button Component
 * Button đơn giản để khởi động Streamlit
 */

"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/form/button";
import { 
  Play, 
  ExternalLink, 
  Loader2,
  FileText
} from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/overlay/tooltip";

/**
 * Streamlit Button Props
 */
interface StreamlitButtonProps {
  variant?: "default" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showLabel?: boolean;
  autoOpen?: boolean; // Tự động mở Streamlit sau khi khởi động
}

/**
 * Streamlit Button Component
 */
export function StreamlitButton({ 
  variant = "default",
  size = "default",
  className = "",
  showLabel = true,
  autoOpen = true
}: StreamlitButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handle click để khởi động Streamlit
   */
  const handleClick = async () => {
    setIsLoading(true);

    try {
      // Kiểm tra trạng thái trước
      const statusResponse = await fetch('/api/admin/tools/streamlit/status');
      const statusData = await statusResponse.json();

      if (statusData.status === 'running') {
        // Nếu đã chạy thì mở luôn
        window.open('http://localhost:8501', '_blank', 'noopener,noreferrer');
        toast.success('Streamlit đã được mở!');
        return;
      }

      // Khởi động Streamlit
      const startResponse = await fetch('/api/admin/tools/streamlit/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!startResponse.ok) {
        throw new Error('Failed to start Streamlit');
      }

      const data = await startResponse.json();
      
      toast.success('Streamlit đã được khởi động!', {
        description: 'LaTeX Question Parser đã sẵn sàng sử dụng.',
      });

      // Tự động mở nếu được yêu cầu
      if (autoOpen && data.url) {
        setTimeout(() => {
          window.open(data.url, '_blank', 'noopener,noreferrer');
        }, 1000); // Đợi 1 giây để Streamlit khởi động hoàn toàn
      }

    } catch (error) {
      console.error('Error with Streamlit:', error);
      
      toast.error('Không thể khởi động Streamlit', {
        description: 'Vui lòng kiểm tra lại cấu hình và thử lại.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Render button content
   */
  const renderButtonContent = () => {
    if (isLoading) {
      return (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {showLabel && size !== "icon" && <span className="ml-2">Đang khởi động...</span>}
        </>
      );
    }

    return (
      <>
        <FileText className="h-4 w-4" />
        {showLabel && size !== "icon" && <span className="ml-2">LaTeX Parser</span>}
      </>
    );
  };

  /**
   * Render với tooltip nếu là icon button
   */
  if (size === "icon" || !showLabel) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={variant}
              size={size}
              onClick={handleClick}
              disabled={isLoading}
              className={className}
            >
              {renderButtonContent()}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Khởi động LaTeX Question Parser</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  /**
   * Render button thường
   */
  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={isLoading}
      className={className}
    >
      {renderButtonContent()}
    </Button>
  );
}

/**
 * Quick Streamlit Icon Button
 * Icon button nhanh để sử dụng trong toolbar
 */
export function QuickStreamlitButton({ className = "" }: { className?: string }) {
  return (
    <StreamlitButton
      variant="ghost"
      size="icon"
      showLabel={false}
      autoOpen={true}
      className={className}
    />
  );
}

/**
 * Streamlit Launch Button
 * Button đầy đủ với label
 */
export function StreamlitLaunchButton({ className = "" }: { className?: string }) {
  return (
    <StreamlitButton
      variant="default"
      size="default"
      showLabel={true}
      autoOpen={true}
      className={className}
    />
  );
}
