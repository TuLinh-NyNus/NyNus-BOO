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
  CardFooter,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui";
import {
  Eye,
  EyeOff,
  Code,
  Type,
  Zap,
  Copy,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Maximize2
} from "lucide-react";

// Import LaTeX components
import { LaTeXContent, useLatexValidation } from "@/components/common/latex";

// Import Monaco LaTeX Editor
import { MonacoLatexEditor } from "@/components/common/editors/monaco-latex-editor";

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

const QUESTION_STRUCTURE_TEMPLATES = [
  {
    category: "Cấu trúc câu hỏi",
    items: [
      {
        name: "Trắc nghiệm (1 đáp án đúng)",
        code: `\\begin{ex}%[Mã câu hỏi]%[Nguồn]\nNội dung câu hỏi ở đây...\n\\choice\n{\\True Đáp án A (đúng)}\n{Đáp án B}\n{Đáp án C}\n{Đáp án D}\n\\loigiai{\nLời giải chi tiết...\n}\n\\end{ex}`
      },
      {
        name: "Trắc nghiệm (nhiều đáp án đúng)",
        code: `\\begin{ex}%[Mã câu hỏi]%[Nguồn]\nNội dung câu hỏi...\n\\choice[m]\n{\\True Đáp án A (đúng)}\n{Đáp án B}\n{\\True Đáp án C (đúng)}\n{Đáp án D}\n\\loigiai{\nLời giải chi tiết...\n}\n\\end{ex}`
      },
      {
        name: "Đúng/Sai",
        code: `\\begin{ex}%[Mã câu hỏi]%[Nguồn]\nPhát biểu này là đúng hay sai?\n\\choice\n{\\True Đúng}\n{Sai}\n\\loigiai{\nGiải thích tại sao... \n}\n\\end{ex}`
      },
      {
        name: "Điền vào chỗ trống",
        code: `\\begin{ex}%[Mã câu hỏi]%[Nguồn]\nĐiền vào chỗ trống: Trái đất quay quanh ...\n\\choice\n{\\True Mặt trời}\n\\loigiai{\nTrái đất là một hành tinh trong hệ mặt trời.\n}\n\\end{ex}`
      }
    ]
  }
];

const SYMBOL_TEMPLATES = [
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

const LATEX_TEMPLATES = [...QUESTION_STRUCTURE_TEMPLATES, ...SYMBOL_TEMPLATES];

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<monaco.Position | null>(null);
  const [activeTab, setActiveTab] = useState("editor");

  const monacoEditorRef = useRef<any>(null);
  
  // ===== MONACO EDITOR SETUP =====
  
  // Monaco setup is handled by MonacoLatexEditor component
  
  // ===== VALIDATION =====
  
  const validation = useLatexValidation(value);
  
  // ===== HANDLERS =====
  
  const handleEditorChange = useCallback((newValue: string) => {
    onChange(newValue);
  }, [onChange]);
  
  const handleCursorPositionChange = useCallback((position: monaco.Position) => {
    setCursorPosition(position);
  }, []);
  
  const handleInsertTemplate = useCallback((template: string) => {
    if (!monacoEditorRef.current) return;

    monacoEditorRef.current.insertText(template);
  }, []);
  
  const handleCopyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(value);
  }, [value]);
  
  const handleTogglePreview = useCallback(() => {
    setIsPreviewVisible(!isPreviewVisible);
  }, [isPreviewVisible]);
  
  const handleToggleModal = useCallback(() => {
    setIsModalOpen(!isModalOpen);
  }, [isModalOpen]);

  const handleCopyTemplate = useCallback((template: string) => {
    navigator.clipboard.writeText(template);
    // Optionally, show a toast notification
  }, []);

  /**
   * Handle Monaco editor mount
   */
  const handleEditorMount = useCallback((_editor: monaco.editor.IStandaloneCodeEditor) => {
    // Editor is ready, can perform additional setup if needed
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
                  variant={isPreviewVisible ? "default" : "ghost"}
                  size="sm"
                  onClick={handleTogglePreview}
                  className={`transition-all duration-200 ${
                    isPreviewVisible 
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                      : 'hover:bg-muted'
                  }`}
                >
                  {isPreviewVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="ml-1 text-xs font-medium">
                    {isPreviewVisible ? 'Ẩn' : 'Xem trước'}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isPreviewVisible ? 'Ẩn panel xem trước bên phải' : 'Hiện panel xem trước bên phải'}
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
                  onClick={handleToggleModal}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Mở rộng editor
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
      <div className="space-y-6 max-w-full">
        {LATEX_TEMPLATES.map((category) => (
          <div key={category.category} className="w-full">
            <h4 className="font-medium text-sm mb-3 text-foreground sticky top-0 bg-background/95 backdrop-blur py-2 border-b">
              {category.category}
            </h4>
            <div className="grid grid-cols-1 gap-3">
              {category.items.map((item) => (
                <Card key={item.name} className="overflow-hidden hover:shadow-md transition-shadow w-full">
                  <CardHeader className="p-3 pb-2">
                    <CardTitle className="text-sm font-semibold truncate">{item.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 bg-muted/50">
                    <pre className="text-xs font-mono whitespace-pre-wrap overflow-x-auto max-w-full">
                      <code className="break-all">{item.code}</code>
                    </pre>
                  </CardContent>
                  <CardFooter className="p-2 flex justify-end gap-2 bg-background/50 flex-wrap">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => handleCopyTemplate(item.code)}
                      disabled={disabled}
                    >
                      <Copy className="h-3 w-3 mr-1" /> Sao chép
                    </Button>
                    <Button
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => handleInsertTemplate(item.code)}
                      disabled={disabled}
                    >
                      <Zap className="h-3 w-3 mr-1" /> Chèn
                    </Button>
                  </CardFooter>
                </Card>
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
  
  const containerClasses = `latex-editor ${className}`;
  const editorHeight = height;
  
  return (
    <Card className={`${containerClasses} overflow-hidden`}>
      <CardHeader className="pb-2 flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Code className="h-4 w-4" />
          LaTeX Editor
        </CardTitle>
      </CardHeader>
      
      {renderToolbar()}
      
      <CardContent className="p-0 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-hidden">
          {/* Editor and Templates */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="p-2 border-b flex-shrink-0">
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
            </div>

            <TabsContent value="editor" className="mt-0 flex-1 overflow-hidden">
              <div className="h-full grid grid-cols-1 lg:grid-cols-3 overflow-hidden">
                <div className={`${isPreviewVisible ? 'lg:col-span-2' : 'lg:col-span-3'} border-r flex flex-col overflow-hidden`}>
                  <div className="flex-1 overflow-hidden">
                    <MonacoLatexEditor
                      ref={monacoEditorRef}
                      value={value}
                      onChange={handleEditorChange}
                      onMount={handleEditorMount}
                      onCursorPositionChange={handleCursorPositionChange}
                      placeholder={placeholder}
                      disabled={disabled}
                      height={editorHeight}
                      showMinimap={false}
                      showLineNumbers={true}
                      wordWrap={true}
                      fontSize={14}
                      enableAutoCompletion={true}
                      className="border-0 rounded-none"
                    />
                  </div>
                  <div className="flex-shrink-0">
                    {renderValidationErrors()}
                  </div>
                </div>
                {/* Preview */}
                {isPreviewVisible && (
                  <div className="lg:col-span-1 hidden lg:flex flex-col overflow-hidden">
                    <div className="p-4 flex-1 overflow-y-auto">
                      <div className="flex items-center gap-2 mb-3 flex-shrink-0">
                        <Eye className="h-4 w-4" />
                        <span className="font-medium text-sm">Xem trước</span>
                      </div>
                      <div className="overflow-auto">
                        {value ? (
                          <div className="prose prose-sm max-w-none break-words">
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
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="templates" className="mt-0 flex-1 overflow-hidden">
              <div className="p-4 h-full overflow-y-auto">
                {renderTemplates()}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>

      {/* Modal Dialog for Expanded Editor */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh] flex flex-col p-4 gap-0">
          <DialogHeader className="pb-2">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Code className="h-5 w-5" />
              LaTeX Editor - Chế độ mở rộng
            </DialogTitle>
            <DialogDescription className="text-sm">
              Soạn thảo LaTeX với không gian làm việc rộng rãi hơn
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden min-h-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-2 mb-3 flex-shrink-0">
                <TabsTrigger value="editor" className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  Editor
                </TabsTrigger>
                <TabsTrigger value="templates" className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Templates
                </TabsTrigger>
              </TabsList>

              <TabsContent value="editor" className="flex-1 overflow-hidden mt-0">
                <div className={`h-full gap-3 overflow-hidden ${
                  isPreviewVisible ? 'grid grid-cols-1 lg:grid-cols-2' : 'flex flex-col'
                }`}>
                  <div className="flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between mb-2 flex-shrink-0">
                      <span className="text-sm font-medium">Nội dung LaTeX</span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant={isPreviewVisible ? "default" : "outline"}
                          size="sm"
                          onClick={handleTogglePreview}
                          className={`transition-all duration-200 ${
                            isPreviewVisible 
                              ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                              : 'hover:bg-muted'
                          }`}
                        >
                          {isPreviewVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          <span className="ml-1 text-xs font-medium">
                            {isPreviewVisible ? 'Ẩn' : 'Xem trước'}
                          </span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCopyToClipboard}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex-1 min-h-0 overflow-hidden">
                      <MonacoLatexEditor
                        value={value}
                        onChange={handleEditorChange}
                        onCursorPositionChange={handleCursorPositionChange}
                        placeholder={placeholder}
                        disabled={disabled}
                        height="60vh"
                        showMinimap={true}
                        showLineNumbers={true}
                        wordWrap={true}
                        fontSize={14}
                        enableAutoCompletion={true}
                        className="border-0 rounded-none"
                      />
                    </div>
                    <div className="flex-shrink-0">
                      {renderValidationErrors()}
                    </div>
                  </div>
                  
                  {isPreviewVisible && (
                    <div className="flex flex-col overflow-hidden">
                      <div className="flex items-center gap-2 mb-2 flex-shrink-0">
                        <Eye className="h-4 w-4" />
                        <span className="text-sm font-medium">Xem trước</span>
                      </div>
                      <div className="flex-1 min-h-0 overflow-y-auto border rounded-md p-3 bg-muted/50">
                        {value ? (
                          <div className="prose prose-sm max-w-none break-words">
                            <LaTeXContent
                              content={value}
                              safeMode={true}
                              expandable={true}
                              showStats={false}
                            />
                          </div>
                        ) : (
                          <div className="text-muted-foreground text-sm italic flex items-center justify-center h-full">
                            Nhập nội dung để xem trước...
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="templates" className="flex-1 overflow-hidden mt-0">
                <div className="h-full overflow-y-auto">
                  {renderTemplates()}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter className="pt-3 border-t">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Độ dài: {value.length} ký tự</span>
                <span>Vị trí con trỏ: {cursorPosition ? `${cursorPosition.lineNumber}:${cursorPosition.column}` : '1:1'}</span>
                {validation.isValid ? (
                  <span className="text-green-600">✓ LaTeX hợp lệ</span>
                ) : (
                  <span className="text-red-600">⚠ Có lỗi LaTeX</span>
                )}
              </div>
              <Button size="sm" onClick={() => setIsModalOpen(false)}>
                Đóng
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
