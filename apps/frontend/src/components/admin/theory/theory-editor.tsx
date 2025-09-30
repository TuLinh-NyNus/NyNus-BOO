/**
 * Theory Editor Component
 * Component chỉnh sửa nội dung lý thuyết với Monaco editor và live preview
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/display/card";
import { Button } from "@/components/ui/form/button";
import { Badge } from "@/components/ui/display/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/form/select";
import {
  FileText,
  Save,
  RefreshCw,
  Monitor,
  Smartphone,
  Code,
  Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LaTeXContent } from "@/components/common/latex";

// Dynamic import Monaco Editor để tránh SSR issues
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64 bg-muted/30 rounded">
      <div className="text-muted-foreground">Loading editor...</div>
    </div>
  )
});

// ===== TYPES =====

export interface LaTeXTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
  category: 'math' | 'text' | 'structure';
}

export interface AutoSaveStatus {
  isEnabled: boolean;
  lastSaved?: Date;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
}

export interface TheoryEditorProps {
  /** Nội dung hiện tại */
  content: string;
  
  /** Handler khi content thay đổi */
  onChange: (content: string) => void;
  
  /** Show live preview panel */
  showLivePreview?: boolean;
  
  /** Show mobile preview panel */
  showMobilePreview?: boolean;
  
  /** Enable auto-save functionality */
  enableAutoSave?: boolean;
  
  /** Auto-save interval in milliseconds */
  autoSaveInterval?: number;
  
  /** Available LaTeX templates */
  templates?: LaTeXTemplate[];
  
  /** Handler để save content */
  onSave?: (content: string) => Promise<void>;
  
  /** Handler khi auto-save */
  onAutoSave?: (content: string) => Promise<void>;
  
  /** Custom CSS classes */
  className?: string;
}

// ===== CONSTANTS =====

const DEFAULT_AUTO_SAVE_INTERVAL = 5000; // 5 seconds

const DEFAULT_TEMPLATES: LaTeXTemplate[] = [
  {
    id: 'basic-math',
    name: 'Công thức toán cơ bản',
    description: 'Template cho công thức toán học cơ bản',
    content: '# Bài học\n\nCông thức: $f(x) = ax^2 + bx + c$\n\nGiải thích:\n- $a$: hệ số bậc 2\n- $b$: hệ số bậc 1\n- $c$: hằng số',
    category: 'math'
  },
  {
    id: 'equation',
    name: 'Phương trình',
    description: 'Template cho phương trình toán học',
    content: '# Phương trình\n\n$$\\begin{align}\nax^2 + bx + c &= 0 \\\\\nx &= \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}\n\\end{align}$$',
    category: 'math'
  },
  {
    id: 'text-structure',
    name: 'Cấu trúc bài học',
    description: 'Template cấu trúc bài học chuẩn',
    content: '# Tên bài học\n\n## Mục tiêu\n- Mục tiêu 1\n- Mục tiêu 2\n\n## Nội dung\n### Phần 1\nNội dung phần 1\n\n### Phần 2\nNội dung phần 2\n\n## Bài tập\n1. Bài tập 1\n2. Bài tập 2',
    category: 'structure'
  }
];

const MONACO_OPTIONS = {
  minimap: { enabled: false },
  wordWrap: 'on' as const,
  fontSize: 14,
  lineNumbers: 'on' as const,
  scrollBeyondLastLine: false,
  automaticLayout: true,
  theme: 'vs-light',
  language: 'markdown'
};

// ===== MAIN COMPONENT =====

export function TheoryEditor({
  content,
  onChange,
  showLivePreview = true,
  showMobilePreview = false,
  enableAutoSave = true,
  autoSaveInterval = DEFAULT_AUTO_SAVE_INTERVAL,
  templates = DEFAULT_TEMPLATES,
  onSave,
  onAutoSave,
  className
}: TheoryEditorProps) {
  
  // ===== STATE =====
  
  const [editorContent, setEditorContent] = useState(content);
  const [autoSaveStatus, setAutoSaveStatus] = useState<AutoSaveStatus>({
    isEnabled: enableAutoSave,
    hasUnsavedChanges: false,
    isSaving: false
  });
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isEditorReady, setIsEditorReady] = useState(false);
  
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const editorRef = useRef<unknown>(null);

  // ===== HANDLERS =====

  const handleAutoSave = useCallback(async (contentToSave: string) => {
    if (!onAutoSave) return;

    setAutoSaveStatus(prev => ({ ...prev, isSaving: true }));

    try {
      await onAutoSave(contentToSave);
      setAutoSaveStatus(prev => ({
        ...prev,
        hasUnsavedChanges: false,
        lastSaved: new Date(),
        isSaving: false
      }));
    } catch (error) {
      console.error('Auto-save failed:', error);
      setAutoSaveStatus(prev => ({ ...prev, isSaving: false }));
    }
  }, [onAutoSave]);

  const handleEditorChange = useCallback((value: string | undefined) => {
    const newContent = value || '';
    setEditorContent(newContent);
    onChange(newContent);

    // Mark as having unsaved changes
    setAutoSaveStatus(prev => ({
      ...prev,
      hasUnsavedChanges: true
    }));

    // Setup auto-save
    if (enableAutoSave && onAutoSave) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      autoSaveTimeoutRef.current = setTimeout(() => {
        handleAutoSave(newContent);
      }, autoSaveInterval);
    }
  }, [onChange, enableAutoSave, onAutoSave, autoSaveInterval, handleAutoSave]);

  const handleManualSave = useCallback(async () => {
    if (!onSave) return;
    
    setAutoSaveStatus(prev => ({ ...prev, isSaving: true }));
    
    try {
      await onSave(editorContent);
      setAutoSaveStatus(prev => ({
        ...prev,
        hasUnsavedChanges: false,
        lastSaved: new Date(),
        isSaving: false
      }));
    } catch (error) {
      console.error('Manual save failed:', error);
      setAutoSaveStatus(prev => ({ ...prev, isSaving: false }));
    }
  }, [onSave, editorContent]);

  const handleTemplateSelect = useCallback((templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setEditorContent(template.content);
      onChange(template.content);
      setSelectedTemplate(templateId);
    }
  }, [templates, onChange]);

  const handleEditorMount = useCallback((editor: unknown) => {
    editorRef.current = editor;
    setIsEditorReady(true);

    // Setup keyboard shortcuts
    const monacoEditor = editor as {
      addCommand: (key: unknown, handler: () => void) => void;
      createContextKey: (key: string, value: boolean) => unknown;
    };
    monacoEditor.addCommand(
      // Ctrl+S for save
      monacoEditor.createContextKey('ctrlS', true),
      () => handleManualSave()
    );
  }, [handleManualSave]);

  // ===== EFFECTS =====

  useEffect(() => {
    setEditorContent(content);
  }, [content]);

  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // ===== RENDER HELPERS =====

  const renderAutoSaveStatus = () => {
    const { isEnabled, lastSaved, hasUnsavedChanges, isSaving } = autoSaveStatus;
    
    if (!isEnabled) return null;
    
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {isSaving ? (
          <>
            <RefreshCw className="h-3 w-3 animate-spin" />
            <span>Đang lưu...</span>
          </>
        ) : hasUnsavedChanges ? (
          <>
            <div className="h-2 w-2 bg-yellow-500 rounded-full" />
            <span>Có thay đổi chưa lưu</span>
          </>
        ) : lastSaved ? (
          <>
            <div className="h-2 w-2 bg-green-500 rounded-full" />
            <span>Đã lưu lúc {lastSaved.toLocaleTimeString()}</span>
          </>
        ) : null}
      </div>
    );
  };

  const renderTemplateSelector = () => {
    if (templates.length === 0) return null;

    return (
      <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Chọn template..." />
        </SelectTrigger>
        <SelectContent>
          {templates.map((template) => (
            <SelectItem key={template.id} value={template.id}>
              <div className="flex flex-col">
                <span className="font-medium">{template.name}</span>
                <span className="text-xs text-muted-foreground">{template.description}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  };

  // ===== RENDER =====

  return (
    <Card className={cn("theory-editor", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          Theory Editor
        </CardTitle>
        <CardDescription>
          Chỉnh sửa nội dung lý thuyết với Monaco editor và live preview
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Editor Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            {renderTemplateSelector()}
            
            <Button
              onClick={() => setPreviewMode(previewMode === 'desktop' ? 'mobile' : 'desktop')}
              variant="outline"
              size="sm"
            >
              {previewMode === 'desktop' ? (
                <>
                  <Smartphone className="h-4 w-4 mr-2" />
                  Mobile Preview
                </>
              ) : (
                <>
                  <Monitor className="h-4 w-4 mr-2" />
                  Desktop Preview
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {renderAutoSaveStatus()}
            
            {onSave && (
              <Button
                onClick={handleManualSave}
                size="sm"
                disabled={autoSaveStatus.isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            )}
          </div>
        </div>

        {/* Editor Layout */}
        <div className={`grid gap-4 ${showLivePreview ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
          {/* Monaco Editor */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="text-sm font-medium">Editor</span>
              {!isEditorReady && (
                <Badge variant="secondary" className="text-xs">Loading...</Badge>
              )}
            </div>
            
            <div className="border rounded-lg overflow-hidden" style={{ height: '500px' }}>
              <MonacoEditor
                value={editorContent}
                onChange={handleEditorChange}
                onMount={handleEditorMount}
                options={MONACO_OPTIONS}
              />
            </div>
          </div>

          {/* Live Preview */}
          {showLivePreview && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {previewMode === 'desktop' ? 'Desktop' : 'Mobile'} Preview
                </span>
                <Badge variant="outline" className="text-xs">
                  {previewMode}
                </Badge>
              </div>
              
              <div 
                className={`border rounded-lg p-4 overflow-auto ${
                  previewMode === 'mobile' ? 'max-w-sm mx-auto' : ''
                }`}
                style={{ height: '500px' }}
              >
                <div className="prose prose-sm max-w-none">
                  <LaTeXContent
                    content={editorContent}
                    safeMode={true}
                    showStats={false}
                    className="theory-preview-content"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Preview (nếu enabled) */}
        {showMobilePreview && !showLivePreview && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <Smartphone className="h-4 w-4" />
              <span className="text-sm font-medium">Mobile Preview</span>
            </div>
            
            <div className="border rounded-lg p-4 max-w-sm mx-auto" style={{ height: '400px' }}>
              <div className="prose prose-sm max-w-none">
                <LaTeXContent
                  content={editorContent}
                  safeMode={true}
                  showStats={false}
                  className="theory-mobile-preview"
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ===== VARIANTS =====

/**
 * Compact Theory Editor
 * Phiên bản compact cho modal hoặc sidebar
 */
export function CompactTheoryEditor(props: TheoryEditorProps) {
  return (
    <TheoryEditor
      {...props}
      showLivePreview={false}
      showMobilePreview={false}
      className={cn("compact-theory-editor", props.className)}
    />
  );
}

/**
 * Full Theory Editor
 * Phiên bản đầy đủ với tất cả features
 */
export function FullTheoryEditor(props: TheoryEditorProps) {
  return (
    <TheoryEditor
      {...props}
      showLivePreview={true}
      showMobilePreview={true}
      enableAutoSave={true}
      className={cn("full-theory-editor", props.className)}
    />
  );
}
