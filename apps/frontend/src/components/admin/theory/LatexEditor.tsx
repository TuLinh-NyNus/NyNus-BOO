/**
 * LaTeX Editor Component
 * Monaco Editor với LaTeX syntax highlighting và auto-completion
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useRef, useCallback, useState } from 'react';
import dynamic from 'next/dynamic';
import { Allotment } from 'allotment';
import { useTheme } from 'next-themes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/display/separator';
import {
  Save,
  Eye,
  EyeOff,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';

import { parseLatexContent } from '@/lib/theory/latex-parser';
import { LatexToReact } from '@/lib/theory/latex-to-react';
import { LATEX_COMMANDS, LATEX_ENVIRONMENTS } from '@/lib/theory/latex-commands';
import type { ParsedLatexFile } from '@/lib/theory/latex-parser';

// Import allotment CSS
import 'allotment/dist/style.css';

// Dynamic import Monaco Editor để tránh SSR issues
const Editor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full">Loading editor...</div>
});

// Global monaco declaration
declare global {
  interface Window {
    monaco: unknown;
  }
}



// ===== INTERFACES =====

interface LatexEditorProps {
  /** Nội dung LaTeX ban đầu */
  initialContent?: string;
  /** Tên file đang edit */
  fileName?: string;
  /** Callback khi content thay đổi */
  onContentChange?: (content: string) => void;
  /** Callback khi save file */
  onSave?: (content: string) => Promise<void>;
  /** Chế độ chỉ đọc */
  readOnly?: boolean;
  /** Hiển thị preview mặc định */
  showPreview?: boolean;
  /** Chiều cao editor */
  height?: string | number;
}

interface EditorState {
  content: string;
  isModified: boolean;
  isSaving: boolean;
  parseResult: ParsedLatexFile | null;
  parseError: string | null;
  isPreviewVisible: boolean;
}

// ===== MONACO CONFIGURATION =====

/**
 * Cấu hình LaTeX language cho Monaco Editor
 */
const configureLatexLanguage = () => {
  // Check if monaco is available (client-side only)
  if (typeof window === 'undefined' || !window.monaco) return;

  const monaco = window.monaco as any;

  // Register LaTeX language
  monaco.languages.register({ id: 'latex' });

  // Define LaTeX tokens
  monaco.languages.setMonarchTokensProvider('latex', {
    tokenizer: {
      root: [
        // Commands
        [/\\[a-zA-Z]+/, 'keyword'],
        [/\\[^a-zA-Z]/, 'keyword'],
        
        // Environments
        [/\\begin\{[^}]+\}/, 'tag'],
        [/\\end\{[^}]+\}/, 'tag'],
        
        // Math mode
        [/\$\$/, 'string', '@mathDisplay'],
        [/\$/, 'string', '@mathInline'],
        
        // Comments
        [/%.*$/, 'comment'],
        
        // Braces
        [/[{}]/, 'delimiter.bracket'],
        [/[\[\]]/, 'delimiter.square'],
        
        // Text
        [/./, 'text']
      ],
      
      mathDisplay: [
        [/\$\$/, 'string', '@pop'],
        [/./, 'string.math']
      ],
      
      mathInline: [
        [/\$/, 'string', '@pop'],
        [/./, 'string.math']
      ]
    }
  });

  // Define theme colors
  monaco.editor.defineTheme('latex-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: '0066cc', fontStyle: 'bold' },
      { token: 'tag', foreground: '008000', fontStyle: 'bold' },
      { token: 'string', foreground: 'dd0000' },
      { token: 'string.math', foreground: 'aa00aa' },
      { token: 'comment', foreground: '008000', fontStyle: 'italic' },
      { token: 'text', foreground: '000000' }
    ],
    colors: {}
  });

  monaco.editor.defineTheme('latex-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: '4fc3f7', fontStyle: 'bold' },
      { token: 'tag', foreground: '81c784', fontStyle: 'bold' },
      { token: 'string', foreground: 'f48fb1' },
      { token: 'string.math', foreground: 'ce93d8' },
      { token: 'comment', foreground: '81c784', fontStyle: 'italic' },
      { token: 'text', foreground: 'ffffff' }
    ],
    colors: {}
  });
};

/**
 * Cấu hình auto-completion cho LaTeX commands
 */
const configureLatexCompletion = () => {
  // Check if monaco is available (client-side only)
  if (typeof window === 'undefined' || !window.monaco) return;

  const monaco = window.monaco as any;

  monaco.languages.registerCompletionItemProvider('latex', {
    provideCompletionItems: (model: any, position: any) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn
      };

      const suggestions: any[] = [];

      // LaTeX commands
      Object.keys(LATEX_COMMANDS).forEach(command => {
        const cleanCommand = command.replace(/\\\\/g, '\\');
        suggestions.push({
          label: cleanCommand,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: cleanCommand,
          range,
          documentation: `LaTeX command: ${cleanCommand}`
        });
      });

      // LaTeX environments
      Object.keys(LATEX_ENVIRONMENTS).forEach(env => {
        suggestions.push({
          label: `\\begin{${env}}`,
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: `\\begin{${env}}\n\t$0\n\\end{${env}}`,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range,
          documentation: `LaTeX environment: ${env}`
        });
      });

      return { suggestions };
    }
  });
};

// ===== MAIN COMPONENT =====

/**
 * LaTeX Editor Component
 * Editor chính với Monaco Editor và live preview
 */
export function LatexEditor({
  initialContent = '',
  fileName = 'untitled.tex',
  onContentChange,
  onSave,
  readOnly = false,
  showPreview = true,
  height = '600px'
}: LatexEditorProps) {
  const { theme } = useTheme();
  const editorRef = useRef<any>(null);
  const [state, setState] = useState<EditorState>({
    content: initialContent,
    isModified: false,
    isSaving: false,
    parseResult: null,
    parseError: null,
    isPreviewVisible: showPreview
  });

  // ===== EDITOR HANDLERS =====

  const handleEditorDidMount = useCallback((editor: any) => {
    editorRef.current = editor;
    
    // Configure LaTeX language và completion
    configureLatexLanguage();
    configureLatexCompletion();
    
    // Set editor options
    editor.updateOptions({
      fontSize: 14,
      lineNumbers: 'on',
      minimap: { enabled: true },
      wordWrap: 'on',
      folding: true,
      autoIndent: 'full',
      formatOnPaste: true,
      formatOnType: true
    });
  }, []);

  const handleContentChange = useCallback((value: string | undefined) => {
    const newContent = value || '';
    
    setState(prev => ({
      ...prev,
      content: newContent,
      isModified: newContent !== initialContent
    }));
    
    onContentChange?.(newContent);
    
    // Parse content với debounce
    const timeoutId = setTimeout(() => {
      try {
        const parsed = parseLatexContent(newContent, fileName);
        setState(prev => ({
          ...prev,
          parseResult: parsed,
          parseError: null
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          parseResult: null,
          parseError: error instanceof Error ? error.message : 'Parse error'
        }));
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [initialContent, fileName, onContentChange]);

  // ===== ACTION HANDLERS =====

  const handleSave = useCallback(async () => {
    if (!onSave || state.isSaving) return;
    
    setState(prev => ({ ...prev, isSaving: true }));
    
    try {
      await onSave(state.content);
      setState(prev => ({ ...prev, isModified: false }));
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setState(prev => ({ ...prev, isSaving: false }));
    }
  }, [onSave, state.content, state.isSaving]);

  const togglePreview = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPreviewVisible: !prev.isPreviewVisible
    }));
  }, []);

  // ===== RENDER =====

  const editorTheme = theme === 'dark' ? 'latex-dark' : 'latex-light';

  return (
    <div className="w-full h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span className="font-medium">{fileName}</span>
          {state.isModified && (
            <Badge variant="secondary" className="text-xs">
              Modified
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {state.parseError ? (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Parse Error
            </Badge>
          ) : state.parseResult ? (
            <Badge variant="default" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Parsed
            </Badge>
          ) : null}
          
          <Separator orientation="vertical" className="h-4" />
          
          <Button
            variant="outline"
            size="sm"
            onClick={togglePreview}
            className="flex items-center gap-1"
          >
            {state.isPreviewVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            Preview
          </Button>
          
          {onSave && (
            <Button
              variant="default"
              size="sm"
              onClick={handleSave}
              disabled={!state.isModified || state.isSaving}
              className="flex items-center gap-1"
            >
              {state.isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save
            </Button>
          )}
        </div>
      </div>

      {/* Editor + Preview */}
      <div className="flex-1" style={{ height }}>
        {state.isPreviewVisible ? (
          <Allotment defaultSizes={[50, 50]}>
            {/* Editor Pane */}
            <div className="h-full">
              <Editor
                height="100%"
                language="latex"
                theme={editorTheme}
                value={state.content}
                onChange={handleContentChange}
                onMount={handleEditorDidMount}
                options={{
                  readOnly,
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  minimap: { enabled: true },
                  lineNumbers: 'on',
                  wordWrap: 'on'
                }}
              />
            </div>
            
            {/* Preview Pane */}
            <div className="h-full border-l">
              <Card className="h-full rounded-none border-0">
                <CardHeader className="py-2 px-4">
                  <CardTitle className="text-sm">Live Preview</CardTitle>
                </CardHeader>
                <CardContent className="p-4 h-full overflow-auto">
                  {state.parseError ? (
                    <div className="text-destructive text-sm">
                      <AlertCircle className="h-4 w-4 inline mr-2" />
                      {state.parseError}
                    </div>
                  ) : state.parseResult ? (
                    <div className="theory-content">
                      <LatexToReact content={state.content} />
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-sm">
                      Start typing to see preview...
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </Allotment>
        ) : (
          // Full editor mode
          <Editor
            height="100%"
            language="latex"
            theme={editorTheme}
            value={state.content}
            onChange={handleContentChange}
            onMount={handleEditorDidMount}
            options={{
              readOnly,
              automaticLayout: true,
              scrollBeyondLastLine: false,
              minimap: { enabled: true },
              lineNumbers: 'on',
              wordWrap: 'on'
            }}
          />
        )}
      </div>
    </div>
  );
}

export default LatexEditor;
