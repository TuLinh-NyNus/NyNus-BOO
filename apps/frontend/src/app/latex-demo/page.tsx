/**
 * LaTeX Demo Page
 * Comprehensive demo cho LaTeX rendering capabilities
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Textarea, Badge } from "@/components/ui";
import {
  // LaTeXRenderer,
  InlineLaTeX,
  DisplayLaTeX,
  LaTeXContent,
  LaTeXPreview,
  useLatexContent,
  useLatexValidation
} from "@/components/latex";

// ===== SAMPLE LATEX CONTENT =====

const SAMPLE_LATEX_EXPRESSIONS = [
  {
    title: "Basic Math",
    inline: "$x^2 + y^2 = z^2$",
    display: "$$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$"
  },
  {
    title: "Vietnamese Math",
    inline: "Tính $\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$",
    display: "$$\\text{Giải phương trình: } ax^2 + bx + c = 0$$"
  },
  {
    title: "Complex Expressions",
    inline: "$\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$",
    display: "$$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix} \\begin{pmatrix} x \\\\ y \\end{pmatrix} = \\begin{pmatrix} ax + by \\\\ cx + dy \\end{pmatrix}$$"
  }
];

const SAMPLE_MIXED_CONTENT = `
Trong toán học, **định lý Pythagoras** phát biểu rằng: Trong một tam giác vuông, bình phương của cạnh huyền bằng tổng bình phương của hai cạnh góc vuông.

Công thức: $a^2 + b^2 = c^2$

Chứng minh bằng tích phân:

$$\\int_0^a \\sqrt{a^2 - x^2} dx = \\frac{\\pi a^2}{4}$$

Ví dụ: Cho tam giác vuông có hai cạnh góc vuông là $a = 3$ và $b = 4$, tính cạnh huyền $c$.

Giải: $c = \\sqrt{a^2 + b^2} = \\sqrt{3^2 + 4^2} = \\sqrt{9 + 16} = \\sqrt{25} = 5$

**Kết luận**: Cạnh huyền có độ dài là $c = 5$.
`;

// ===== MAIN COMPONENT =====

export default function LaTeXDemoPage() {
  const [customLatex, setCustomLatex] = useState("$f(x) = x^2 + 2x + 1$");
  const [mixedContent, setMixedContent] = useState(SAMPLE_MIXED_CONTENT);
  
  // Analysis hooks
  const latexAnalysis = useLatexContent(mixedContent);
  const latexValidation = useLatexValidation(mixedContent);
  
  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">LaTeX Rendering Demo</h1>
        <p className="text-lg text-muted-foreground">
          Comprehensive LaTeX rendering với KaTeX integration
        </p>
      </div>
      
      {/* Basic LaTeX Expressions */}
      <Card>
        <CardHeader>
          <CardTitle>🧮 Basic LaTeX Expressions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {SAMPLE_LATEX_EXPRESSIONS.map((sample, index) => (
            <div key={index} className="space-y-3">
              <h3 className="font-semibold text-lg">{sample.title}</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Inline LaTeX:</h4>
                  <div className="p-3 bg-gray-50 rounded border">
                    <InlineLaTeX latex={sample.inline} />
                  </div>
                  <code className="text-xs text-gray-600">{sample.inline}</code>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Display LaTeX:</h4>
                  <div className="p-3 bg-gray-50 rounded border text-center">
                    <DisplayLaTeX latex={sample.display} />
                  </div>
                  <code className="text-xs text-gray-600">{sample.display}</code>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      
      {/* Mixed Content */}
      <Card>
        <CardHeader>
          <CardTitle>📝 Mixed Content Rendering</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold">Input Content:</h3>
              <Textarea
                value={mixedContent}
                onChange={(e) => setMixedContent(e.target.value)}
                rows={12}
                className="font-mono text-sm"
                placeholder="Enter mixed content with LaTeX..."
              />
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold">Rendered Output:</h3>
              <div className="p-4 border rounded bg-white min-h-[300px]">
                <LaTeXContent 
                  content={mixedContent}
                  showStats={true}
                  expandable={true}
                />
              </div>
            </div>
          </div>
          
          {/* Content Analysis */}
          <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-2">
              <h4 className="font-medium">📊 Content Analysis:</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant={latexAnalysis.hasLatex ? "default" : "secondary"}>
                  {latexAnalysis.hasLatex ? "Contains LaTeX" : "No LaTeX"}
                </Badge>
                <Badge variant="outline">
                  {latexAnalysis.stats?.totalExpressions || 0} expressions
                </Badge>
                <Badge variant="outline">
                  {latexAnalysis.stats?.inlineCount || 0} inline
                </Badge>
                <Badge variant="outline">
                  {latexAnalysis.stats?.displayCount || 0} display
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">✅ Validation Status:</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant={latexValidation.isValid ? "default" : "destructive"}>
                  {latexValidation.isValid ? "All Valid" : "Has Errors"}
                </Badge>
                {latexValidation.errorCount > 0 && (
                  <Badge variant="destructive">
                    {latexValidation.errorCount} errors
                  </Badge>
                )}
                <Badge variant="outline">
                  {latexValidation.totalExpressions} total
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Interactive LaTeX Editor */}
      <Card>
        <CardHeader>
          <CardTitle>✏️ Interactive LaTeX Editor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold">LaTeX Input:</h3>
              <Textarea
                value={customLatex}
                onChange={(e) => setCustomLatex(e.target.value)}
                rows={6}
                className="font-mono"
                placeholder="Enter LaTeX expression..."
              />
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setCustomLatex("$\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$")}
                >
                  Quadratic Formula
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setCustomLatex("$$\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}$$")}
                >
                  Basel Problem
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setCustomLatex("$e^{i\\pi} + 1 = 0$")}
                >
                  Euler&apos;s Identity
                </Button>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold">Live Preview:</h3>
              <LaTeXPreview 
                latex={customLatex}
                showValidation={true}
                className="min-h-[200px]"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Performance & Features */}
      <Card>
        <CardHeader>
          <CardTitle>⚡ Performance & Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded">
              <div className="text-2xl font-bold text-green-600">KaTeX</div>
              <div className="text-sm text-green-700">Fast Rendering</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded">
              <div className="text-2xl font-bold text-blue-600">Cached</div>
              <div className="text-sm text-blue-700">Performance Optimized</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded">
              <div className="text-2xl font-bold text-purple-600">Safe</div>
              <div className="text-sm text-purple-700">Error Handling</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded">
              <div className="text-2xl font-bold text-orange-600">Mixed</div>
              <div className="text-sm text-orange-700">Text + Math</div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded">
            <h4 className="font-semibold mb-2">✨ Key Features:</h4>
            <ul className="text-sm space-y-1 text-gray-700">
              <li>• <strong>Fast KaTeX rendering</strong> với caching cho performance</li>
              <li>• <strong>Mixed content support</strong> - text và LaTeX trong cùng content</li>
              <li>• <strong>Error handling</strong> với fallback rendering</li>
              <li>• <strong>Responsive design</strong> - mobile và desktop friendly</li>
              <li>• <strong>Vietnamese support</strong> - optimized cho nội dung tiếng Việt</li>
              <li>• <strong>Accessibility</strong> - ARIA labels và screen reader support</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
