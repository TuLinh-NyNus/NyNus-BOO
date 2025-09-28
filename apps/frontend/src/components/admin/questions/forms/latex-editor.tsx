/**
 * LaTeX Editor Component
 * Real-time LaTeX editor với live preview và syntax highlighting
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState, useCallback, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Textarea,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Alert,
  AlertDescription,
  Separator,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui";
import {
  Eye,
  EyeOff,
  Code,
  Type,
  Zap,
  Copy,
  // Download,
  // Settings,
  HelpCircle,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Maximize2,
  Minimize2
} from "lucide-react";

// Import LaTeX components
import { LaTeXContent, useLatexValidation } from "@/components/latex";

// ===== TYPES =====

export interface LaTeXEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  showPreview?: boolean;
  showToolbar?: boolean;
  showValidation?: boolean;
  height?: string;
  className?: string;
}

// ===== LATEX TEMPLATES =====

const LATEX_TEMPLATES = [
  {
    category: "Cơ bản",
    items: [
      { name: "Phân số", code: "\\frac{a}{b}" },
      { name: "Căn bậc hai", code: "\\sqrt{x}" },
      { name: "Căn bậc n", code: "\\sqrt[n]{x}" },
      { name: "Lũy thừa", code: "x^{n}" },
      { name: "Chỉ số dưới", code: "x_{i}" }
    ]
  },
  {
    category: "Ký hiệu",
    items: [
      { name: "Alpha", code: "\\alpha" },
      { name: "Beta", code: "\\beta" },
      { name: "Pi", code: "\\pi" },
      { name: "Sigma", code: "\\sigma" },
      { name: "Infinity", code: "\\infty" }
    ]
  },
  {
    category: "Toán học",
    items: [
      { name: "Tích phân", code: "\\int_{a}^{b} f(x) dx" },
      { name: "Tổng", code: "\\sum_{i=1}^{n} x_i" },
      { name: "Giới hạn", code: "\\lim_{x \\to 0} f(x)" },
      { name: "Ma trận", code: "\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}" },
      { name: "Hệ phương trình", code: "\\begin{cases} x + y = 1 \\\\ x - y = 0 \\end{cases}" }
    ]
  }
];

// ===== MAIN COMPONENT =====

export function LaTeXEditor({
  value,
  onChange,
  placeholder = "Nhập nội dung với LaTeX...",
  disabled = false,
  showPreview = true,
  showToolbar = true,
  showValidation = true,
  height = "200px",
  className = ""
}: LaTeXEditorProps) {
  // ===== STATE =====
  
  const [isPreviewVisible, setIsPreviewVisible] = useState(showPreview);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // ===== VALIDATION =====
  
  const validation = useLatexValidation(value);
  
  // ===== HANDLERS =====
  
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setCursorPosition(e.target.selectionStart);
    onChange(newValue);
  }, [onChange]);
  
  const handleInsertTemplate = useCallback((template: string) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = value.substring(0, start) + template + value.substring(end);

    onChange(newValue);
    setSelectedTemplate(template);

    // Set cursor position after template
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + template.length, start + template.length);
      setCursorPosition(start + template.length);
    }, 0);
  }, [value, onChange]);
  
  const handleCopyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(value);
  }, [value]);
  
  const handleTogglePreview = useCallback(() => {
    setIsPreviewVisible(!isPreviewVisible);
  }, [isPreviewVisible]);
  
  const handleToggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  /**
   * Handle cursor position change
   */
  const handleCursorChange = useCallback((event: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = event.target as HTMLTextAreaElement;
    setCursorPosition(target.selectionStart);
  }, []);
  
  // ===== RENDER HELPERS =====
  
  /**
   * Render toolbar
   */
  const renderToolbar = () => {
    if (!showToolbar) return null;
    
    return (
      <div className="flex items-center justify-between p-2 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleTogglePreview}
                >
                  {isPreviewVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isPreviewVisible ? 'Ẩn xem trước' : 'Hiện xem trước'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Separator orientation="vertical" className="h-4" />
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyToClipboard}
                  disabled={!value}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Sao chép nội dung
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleFullscreen}
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="flex items-center gap-2">
          {showValidation && (
            <div className="flex items-center gap-2">
              {validation.isValid ? (
                <Badge variant="default" className="text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Hợp lệ
                </Badge>
              ) : (
                <Badge variant="destructive" className="text-xs">
                  <XCircle className="h-3 w-3 mr-1" />
                  {validation.errorCount} lỗi
                </Badge>
              )}
            </div>
          )}
          
          <Badge variant="outline" className="text-xs">
            {value.length} ký tự
          </Badge>
        </div>
      </div>
    );
  };
  
  /**
   * Render LaTeX templates
   */
  const renderTemplates = () => {
    return (
      <div className="space-y-4">
        {LATEX_TEMPLATES.map((category) => (
          <div key={category.category}>
            <h4 className="font-medium text-sm mb-2">{category.category}</h4>
            <div className="grid grid-cols-2 gap-2">
              {category.items.map((item) => (
                <Button
                  key={item.name}
                  variant={selectedTemplate === item.code ? "default" : "outline"}
                  size="sm"
                  className="justify-start text-xs h-auto p-2"
                  onClick={() => handleInsertTemplate(item.code)}
                  disabled={disabled}
                >
                  <div className="text-left">
                    <div className="font-medium">{item.name}</div>
                    <code className="text-xs text-muted-foreground">{item.code}</code>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  /**
   * Render validation errors
   */
  const renderValidationErrors = () => {
    if (!showValidation || validation.isValid) return null;
    
    return (
      <Alert variant="destructive" className="mt-2">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-1">
            <p className="font-medium">Lỗi LaTeX:</p>
            {validation.validationResults.map((result, index) => (
              !result.isValid && (
                <div key={index} className="text-xs">
                  • {result.error}
                </div>
              )
            ))}
          </div>
        </AlertDescription>
      </Alert>
    );
  };
  
  // ===== MAIN RENDER =====
  
  const containerClasses = `latex-editor ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''} ${className}`;
  const editorHeight = isFullscreen ? 'calc(100vh - 200px)' : height;
  
  return (
    <Card className={containerClasses}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Code className="h-4 w-4" />
          LaTeX Editor
        </CardTitle>
      </CardHeader>
      
      {renderToolbar()}
      
      <CardContent className="p-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
          {/* Editor */}
          <div className={`${isPreviewVisible ? 'lg:col-span-2' : 'lg:col-span-3'} border-r`}>
            <Tabs defaultValue="editor" className="h-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="editor" className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  Editor
                </TabsTrigger>
                <TabsTrigger value="templates" className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Templates
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="editor" className="mt-0 h-full">
                <Textarea
                  ref={textareaRef}
                  value={value}
                  onChange={handleTextChange}
                  onSelect={handleCursorChange}
                  onKeyUp={handleCursorChange}
                  onClick={handleCursorChange}
                  placeholder={placeholder}
                  disabled={disabled}
                  className="border-0 resize-none focus-visible:ring-0 rounded-none"
                  style={{ height: editorHeight }}
                />
              </TabsContent>
              
              <TabsContent value="templates" className="mt-0 p-4 overflow-y-auto" style={{ height: editorHeight }}>
                {renderTemplates()}
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Preview */}
          {isPreviewVisible && (
            <div className="lg:col-span-1">
              <div className="p-4 h-full overflow-y-auto" style={{ height: editorHeight }}>
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="h-4 w-4" />
                  <span className="font-medium text-sm">Xem trước</span>
                </div>
                
                {value ? (
                  <div className="prose prose-sm max-w-none">
                    <LaTeXContent
                      content={value}
                      safeMode={true}
                      expandable={true}
                      showStats={false}
                    />
                  </div>
                ) : (
                  <div className="text-muted-foreground text-sm italic">
                    Nhập nội dung để xem trước...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {renderValidationErrors()}
      </CardContent>
      
      {/* Status Bar */}
      <div className="px-4 py-2 border-t bg-muted/50 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>Độ dài: {value.length} ký tự</span>
          <span>Vị trí con trỏ: {cursorPosition}</span>
          <span>Dòng: {value.substring(0, cursorPosition).split('\n').length}</span>
        </div>
        {validation.isValid ? (
          <span className="text-green-600">✓ LaTeX hợp lệ</span>
        ) : (
          <span className="text-red-600">⚠ Có lỗi LaTeX</span>
        )}
      </div>

      {/* Help */}
      <div className="p-4 border-t bg-muted/50">
        <Alert>
          <HelpCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>Hướng dẫn LaTeX:</strong> Sử dụng $...$ cho inline math, $$...$$ cho display math.
            Ví dụ: $a^2 + b^2 = c^2$ hoặc $$\int_0^1 f(t) dt = 1$$
          </AlertDescription>
        </Alert>
      </div>
    </Card>
  );
}

// ===== SPECIALIZED VARIANTS =====

/**
 * Compact LaTeX editor
 */
export function CompactLaTeXEditor(props: LaTeXEditorProps) {
  return (
    <LaTeXEditor
      {...props}
      showToolbar={false}
      showValidation={false}
      height="120px"
      className={`compact-latex-editor ${props.className || ''}`}
    />
  );
}

/**
 * Inline LaTeX editor
 */
export function InlineLaTeXEditor(props: LaTeXEditorProps) {
  return (
    <LaTeXEditor
      {...props}
      showPreview={false}
      showToolbar={false}
      height="80px"
      className={`inline-latex-editor ${props.className || ''}`}
    />
  );
}
