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

import React, { useRef, useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import * as monaco from 'monaco-editor';
import { useTheme } from 'next-themes';

// Dynamic import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-muted/30 rounded border">
      <div className="flex flex-col items-center gap-2">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        <div className="text-sm text-muted-foreground">Loading LaTeX Editor...</div>
      </div>
    </div>
  )
});

// Import our LaTeX Monaco integration
import { initializeLatexSupport, getLatexTheme } from '@/lib/monaco';

// ===== TYPES =====

export interface MonacoLatexEditorProps {
  /** Current LaTeX content */
  value: string;
  
  /** Callback when content changes */
  onChange: (value: string) => void;
  
  /** Placeholder text when empty */
  placeholder?: string;
  
  /** Whether the editor is disabled */
  disabled?: boolean;
  
  /** Editor height */
  height?: string | number;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Callback when editor is ready */
  onMount?: (editor: monaco.editor.IStandaloneCodeEditor) => void;
  
  /** Callback when cursor position changes */
  onCursorPositionChange?: (position: monaco.Position) => void;
  
  /** Callback when selection changes */
  onSelectionChange?: (selection: monaco.Selection) => void;
  
  /** Whether to show minimap */
  showMinimap?: boolean;
  
  /** Whether to show line numbers */
  showLineNumbers?: boolean;
  
  /** Whether to enable word wrap */
  wordWrap?: boolean;
  
  /** Font size */
  fontSize?: number;
  
  /** Whether to enable auto-completion */
  enableAutoCompletion?: boolean;
  
  /** Custom Monaco options */
  options?: monaco.editor.IStandaloneEditorConstructionOptions;
}

// ===== MONACO CONFIGURATION =====

const DEFAULT_MONACO_OPTIONS: monaco.editor.IStandaloneEditorConstructionOptions = {
  language: 'latex',
  fontSize: 14,
  lineNumbers: 'on',
  minimap: { enabled: false },
  wordWrap: 'on',
  automaticLayout: true,
  scrollBeyondLastLine: false,
  folding: true,
  matchBrackets: 'always',
  autoIndent: 'full',
  formatOnPaste: true,
  formatOnType: true,
  selectOnLineNumbers: true,
  roundedSelection: false,
  readOnly: false,
  cursorStyle: 'line',
  mouseWheelZoom: true,
  contextmenu: true,
  quickSuggestions: {
    other: true,
    comments: false,
    strings: false
  },
  suggestOnTriggerCharacters: true,
  acceptSuggestionOnEnter: 'on',
  tabCompletion: 'on',
  wordBasedSuggestions: 'off',
  parameterHints: {
    enabled: true
  }
};

// ===== MAIN COMPONENT =====

const MonacoLatexEditorComponent = React.forwardRef<MonacoLatexEditorRef, MonacoLatexEditorProps>(({
  value,
  onChange,
  placeholder = "Enter LaTeX content...",
  disabled = false,
  height = 300,
  className = "",
  onMount,
  onCursorPositionChange,
  onSelectionChange,
  showMinimap = false,
  showLineNumbers = true,
  wordWrap = true,
  fontSize = 14,
  enableAutoCompletion = true,
  options = {}
}, ref) => {
  
  // ===== STATE =====
  
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [isLanguageRegistered, setIsLanguageRegistered] = useState(false);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const { theme } = useTheme();
  
  // ===== MONACO SETUP =====
  
  // Register LaTeX language and themes when Monaco loads
  const handleEditorWillMount = useCallback(() => {
    if (!isLanguageRegistered) {
      try {
        initializeLatexSupport();
        setIsLanguageRegistered(true);
      } catch (error) {
        console.error('Failed to initialize LaTeX support:', error);
      }
    }
  }, [isLanguageRegistered]);
  
  // Handle editor mount
  const handleEditorMount = useCallback((editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
    setIsEditorReady(true);
    
    // Set theme based on current theme
    const latexTheme = getLatexTheme(theme === 'dark');
    editor.updateOptions({ theme: latexTheme });
    
    // Setup event listeners
    editor.onDidChangeCursorPosition((e) => {
      onCursorPositionChange?.(e.position);
    });
    
    editor.onDidChangeCursorSelection((e) => {
      onSelectionChange?.(e.selection);
    });
    
    // Focus editor
    editor.focus();
    
    // Call external onMount callback
    onMount?.(editor);
  }, [theme, onMount, onCursorPositionChange, onSelectionChange]);
  
  // ===== THEME HANDLING =====
  
  // Update theme when app theme changes
  useEffect(() => {
    if (editorRef.current && isEditorReady) {
      const latexTheme = getLatexTheme(theme === 'dark');
      editorRef.current.updateOptions({ theme: latexTheme });
    }
  }, [theme, isEditorReady]);
  
  // ===== PUBLIC METHODS =====
  
  // Insert text at cursor position
  const insertText = useCallback((text: string) => {
    if (!editorRef.current) return;
    
    const editor = editorRef.current;
    const selection = editor.getSelection();
    
    if (selection) {
      editor.executeEdits('insert-text', [{
        range: selection,
        text: text,
        forceMoveMarkers: true
      }]);
      
      // Move cursor to end of inserted text
      const newPosition = {
        lineNumber: selection.startLineNumber,
        column: selection.startColumn + text.length
      };
      editor.setPosition(newPosition);
      editor.focus();
    }
  }, []);
  
  // Get current cursor position
  const getCursorPosition = useCallback(() => {
    if (!editorRef.current) return null;
    return editorRef.current.getPosition();
  }, []);
  
  // Get current selection
  const getSelection = useCallback(() => {
    if (!editorRef.current) return null;
    return editorRef.current.getSelection();
  }, []);
  
  // Expose methods via ref
  React.useImperativeHandle(ref, () => ({
    insertText,
    getCursorPosition,
    getSelection,
    focus: () => editorRef.current?.focus(),
    getEditor: () => editorRef.current
  }), [insertText, getCursorPosition, getSelection]);
  
  // ===== MONACO OPTIONS =====
  
  const monacoOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
    ...DEFAULT_MONACO_OPTIONS,
    readOnly: disabled,
    minimap: { enabled: showMinimap },
    lineNumbers: showLineNumbers ? 'on' : 'off',
    wordWrap: wordWrap ? 'on' : 'off',
    fontSize,
    quickSuggestions: enableAutoCompletion ? {
      other: true,
      comments: false,
      strings: false
    } : false,
    suggestOnTriggerCharacters: enableAutoCompletion,
    ...options
  };
  
  // ===== RENDER =====
  
  // Calculate proper height
  const editorHeight = React.useMemo(() => {
    if (typeof height === 'string') {
      if (height.includes('calc') || height.includes('vh') || height.includes('px') || height === '100%') {
        return height;
      }
      return height;
    }
    if (typeof height === 'number') {
      return `${height}px`;
    }
    return height || '300px';
  }, [height]);

  return (
    <div 
      className={`monaco-latex-editor ${className} relative`} 
      style={{ 
        height: editorHeight,
        minHeight: '200px',
        maxHeight: '100vh'
      }}
    >
      <MonacoEditor
        value={value}
        onChange={(newValue) => onChange(newValue || '')}
        beforeMount={handleEditorWillMount}
        onMount={handleEditorMount}
        options={monacoOptions}
        height="100%"
        loading={
          <div className="flex items-center justify-center h-full bg-muted/30 rounded border">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <div className="text-sm text-muted-foreground">Loading LaTeX Editor...</div>
            </div>
          </div>
        }
      />
      
      {/* Placeholder overlay when empty */}
      {!value && !disabled && (
        <div className="absolute top-4 left-16 text-muted-foreground pointer-events-none select-none z-10">
          {placeholder}
        </div>
      )}
    </div>
  );
});

MonacoLatexEditorComponent.displayName = 'MonacoLatexEditor';

// ===== EXPORT =====

export const MonacoLatexEditor = MonacoLatexEditorComponent;

// ===== EXPORT TYPES =====

export type MonacoLatexEditorRef = {
  insertText: (text: string) => void;
  getCursorPosition: () => monaco.Position | null;
  getSelection: () => monaco.Selection | null;
  focus: () => void;
  getEditor: () => monaco.editor.IStandaloneCodeEditor | null;
};

export default MonacoLatexEditor;
