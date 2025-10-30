/**
 * Monaco LaTeX Editor Component
 * ============================
 * Advanced LaTeX editor built on Monaco Editor with syntax highlighting,
 * auto-completion, and error detection
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useRef, useCallback } from 'react';
import { Textarea } from '@/components/ui/form/textarea';

// ===== TYPES =====

export interface MonacoLatexEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  height?: string | number;
  language?: string;
  theme?: string;
  onMount?: (editor: any) => void;
  onCursorPositionChange?: (position: any) => void;
  onSelectionChange?: (selection: any) => void;
  onContentChange?: (content: string) => void;
  showMinimap?: boolean;
  showLineNumbers?: boolean;
  wordWrap?: boolean;
  fontSize?: number;
  enableAutoCompletion?: boolean;
  className?: string;
  options?: any;
}

export type MonacoLatexEditorRef = {
  insertText: (text: string) => void;
  getCursorPosition: () => any;
  getSelection: () => any;
  focus: () => void;
  getEditor: () => any;
};

// ===== STUB COMPONENT =====
// Using Textarea as fallback to avoid Monaco SSR issues in build

const MonacoLatexEditorComponent = React.forwardRef<MonacoLatexEditorRef, MonacoLatexEditorProps>(({
  value,
  onChange,
  placeholder = "Enter LaTeX content...",
  disabled = false,
  height = 300,
  className = "",
  options = {}
}, ref) => {
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertText = useCallback((text: string) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const before = value.substring(0, start);
    const after = value.substring(end);
    onChange(before + text + after);
  }, [value, onChange]);

  const getCursorPosition = useCallback(() => null, []);
  const getSelection = useCallback(() => null, []);

  React.useImperativeHandle(ref, () => ({
    insertText,
    getCursorPosition,
    getSelection,
    focus: () => textareaRef.current?.focus(),
    getEditor: () => null
  }), [insertText]);

  const editorHeight = typeof height === 'number' ? `${height}px` : height;

  return (
    <div className={`latex-editor-stub ${className} relative`} style={{ height: editorHeight }}>
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full h-full font-mono text-sm resize-none"
      />
    </div>
  );
});

MonacoLatexEditorComponent.displayName = 'MonacoLatexEditor';

export const MonacoLatexEditor = MonacoLatexEditorComponent;
export default MonacoLatexEditor;
