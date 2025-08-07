'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LatexSamplesProps {
  onSelectSample: (sample: string) => void;
}

const latexSamples = [
  {
    title: 'Phương trình bậc hai',
    content: `\\begin{question}
\\textbf{Câu hỏi:} Giải phương trình $ax^2 + bx + c = 0$ với $a = 1$, $b = -3$, $c = 2$.

\\begin{choices}
\\choice $x = 1$ hoặc $x = 2$
\\choice $x = -1$ hoặc $x = -2$  
\\choice $x = 1$ hoặc $x = -2$
\\choice $x = -1$ hoặc $x = 2$
\\end{choices}

\\textbf{Lời giải:}
Ta có phương trình: $x^2 - 3x + 2 = 0$

Sử dụng công thức nghiệm: $x = \\frac{3 \\pm \\sqrt{9-8}}{2} = \\frac{3 \\pm 1}{2}$

Vậy $x = 2$ hoặc $x = 1$.
\\end{question}`
  },
  {
    title: 'Hình học không gian',
    content: `\\begin{question}
\\textbf{Câu hỏi:} Cho hình chóp $S.ABC$ có đáy $ABC$ là tam giác vuông tại $A$, $AB = 3$, $AC = 4$, $SA \\perp (ABC)$ và $SA = 5$. Tính thể tích khối chóp.

\\begin{choices}
\\choice $V = 10$
\\choice $V = 15$
\\choice $V = 20$  
\\choice $V = 30$
\\end{choices}

\\textbf{Lời giải:}
Diện tích đáy: $S_{ABC} = \\frac{1}{2} \\cdot AB \\cdot AC = \\frac{1}{2} \\cdot 3 \\cdot 4 = 6$

Thể tích: $V = \\frac{1}{3} \\cdot S_{ABC} \\cdot SA = \\frac{1}{3} \\cdot 6 \\cdot 5 = 10$
\\end{question}`
  },
  {
    title: 'Đạo hàm',
    content: `\\begin{question}
\\textbf{Câu hỏi:} Tìm đạo hàm của hàm số $f(x) = x^3 - 3x^2 + 2x - 1$.

\\begin{choices}
\\choice $f'(x) = 3x^2 - 6x + 2$
\\choice $f'(x) = 3x^2 - 6x + 1$
\\choice $f'(x) = x^2 - 6x + 2$
\\choice $f'(x) = 3x^2 - 3x + 2$
\\end{choices}

\\textbf{Lời giải:}
$f'(x) = (x^3)' - (3x^2)' + (2x)' - (1)'$
$f'(x) = 3x^2 - 6x + 2 - 0 = 3x^2 - 6x + 2$
\\end{question}`
  }
];

export default function LatexSamples({ onSelectSample }: LatexSamplesProps) {
  return (
    <div className="space-y-4">
      <div className="text-sm text-slate-600 dark:text-slate-400 mb-4">
        Chọn một mẫu để chèn vào editor:
      </div>
      
      {latexSamples.map((sample, index) => (
        <Card key={index} className="border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-800 dark:text-slate-200">
              {sample.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <pre className="text-xs bg-slate-50 dark:bg-slate-800 p-3 rounded border overflow-x-auto mb-3 text-slate-700 dark:text-slate-300">
              {sample.content.substring(0, 200)}...
            </pre>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelectSample(sample.content)}
              className="w-full"
            >
              Chọn mẫu này
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
