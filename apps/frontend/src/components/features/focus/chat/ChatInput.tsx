/**
 * ChatInput Component
 * Input field cho chat message
 * 
 * Features:
 * - Textarea với auto-resize (max 3 lines)
 * - Enter to send, Shift+Enter for new line
 * - Character limit (500) với counter
 * - Rate limit warning display
 * - Disabled state khi sending/disconnected
 * 
 * @author NyNus Development Team
 * @created 2025-02-01
 */

"use client";

import React, { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChatInputProps {
  /** Callback khi send message */
  onSend: (message: string) => void;
  
  /** Disabled state (khi sending hoặc disconnected) */
  disabled?: boolean;
  
  /** Max character length */
  maxLength?: number;
  
  /** Placeholder text */
  placeholder?: string;
  
  /** Show rate limit warning */
  showRateLimitWarning?: boolean;
  
  /** Custom className */
  className?: string;
}

export function ChatInput({
  onSend,
  disabled = false,
  maxLength = 500,
  placeholder = "Nhập tin nhắn... (Enter để gửi, Shift+Enter để xuống dòng)",
  showRateLimitWarning = false,
  className,
}: ChatInputProps) {
  
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /**
   * Auto-resize textarea (max 3 lines)
   */
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto để tính toán chiều cao mới
    textarea.style.height = "auto";
    
    // Calculate new height (max 3 lines ≈ 84px)
    const lineHeight = 28; // Approximate line height
    const maxHeight = lineHeight * 3;
    const scrollHeight = textarea.scrollHeight;
    
    textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
  }, [message]);

  /**
   * Handle send message
   */
  const handleSend = async () => {
    const trimmedMessage = message.trim();
    
    // Validate
    if (!trimmedMessage) return;
    if (trimmedMessage.length > maxLength) return;
    if (disabled) return;

    try {
      setIsSending(true);
      await onSend(trimmedMessage);
      
      // Clear input after successful send
      setMessage("");
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  /**
   * Handle Enter key (send message)
   * Shift+Enter for new line
   */
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /**
   * Character count color
   */
  const getCounterColor = () => {
    const length = message.length;
    if (length >= maxLength) return "text-red-500";
    if (length >= maxLength * 0.9) return "text-yellow-500";
    return "text-muted-foreground";
  };

  /**
   * Is send button disabled
   */
  const isSendDisabled = 
    disabled || 
    isSending || 
    message.trim().length === 0 || 
    message.length > maxLength;

  return (
    <div className={cn("space-y-2", className)}>
      {/* Rate limit warning */}
      {showRateLimitWarning && (
        <div className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 px-3 py-2 rounded-md text-sm">
          ⚠️ Bạn đang gửi tin nhắn quá nhanh. Vui lòng chờ một chút.
        </div>
      )}

      {/* Input area */}
      <div className="flex gap-2">
        {/* Textarea */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isSending}
            maxLength={maxLength}
            className="resize-none pr-16"
            rows={1}
          />
          
          {/* Character counter */}
          <div className={cn(
            "absolute bottom-2 right-2 text-xs",
            getCounterColor()
          )}>
            {message.length}/{maxLength}
          </div>
        </div>

        {/* Send button */}
        <Button
          onClick={handleSend}
          disabled={isSendDisabled}
          size="icon"
          className="h-auto aspect-square"
        >
          {isSending ? (
            <span className="animate-spin">⏳</span>
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Helper text */}
      {!disabled && (
        <p className="text-xs text-muted-foreground">
          💡 Nhấn Enter để gửi, Shift+Enter để xuống dòng
        </p>
      )}

      {/* Disconnected warning */}
      {disabled && (
        <p className="text-xs text-red-500">
          ⚠️ Mất kết nối - Đang kết nối lại...
        </p>
      )}
    </div>
  );
}
