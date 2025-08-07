'use client';

import katex from 'katex';
import React, { useEffect, useRef, useState } from 'react';

import logger from '@/lib/utils/logger';
import 'katex/dist/katex.min.css';
import './latex-styles.css';

interface UnifiedLatexRendererProps {
  content: string;
  className?: string;
  showSolution?: boolean;
  mode?: 'simple' | 'advanced'; // simple for basic rendering, advanced for full parsing
}

interface ExtractedData {
  content: string;
  type: 'multiple-choice' | 'true-false' | 'essay';
  answers: Array<{
    id: string;
    content: string;
    isCorrect: boolean;
  }>;
  correctAnswer: string[];
  solution?: string;
}

const UnifiedLatexRendererComponent = React.memo(function UnifiedLatexRenderer({
  content,
  className = '',
  showSolution = true,
  mode = 'advanced'
}: UnifiedLatexRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showSolutionState, setShowSolutionState] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);

  // KaTeX macros for mathematical expressions
  const katexMacros = {
    '\\vec': '\\overrightarrow{#1}',
    '\\vect': '\\overrightarrow{#1}',
    '\\dfrac': '{\\displaystyle\\frac{#1}{#2}}',
    '\\iff': '\\Leftrightarrow',
    '\\implies': '\\Rightarrow',
    '\\R': '\\mathbb{R}',
    '\\N': '\\mathbb{N}',
    '\\Z': '\\mathbb{Z}',
    '\\Q': '\\mathbb{Q}',
    '\\C': '\\mathbb{C}',
    '\\norm': '\\left\\lVert#1\\right\\rVert',
    '\\abs': '\\left|#1\\right|',
    '\\degree': '^{\\circ}',
    '\\triangle': '\\triangle',
    '\\angle': '\\angle',
    '\\parallel': '\\parallel',
    '\\perp': '\\perp'
  };

  // Render mathematical formulas with KaTeX
  const renderMathWithKaTeX = (text: string): string => {
    if (!text) return '';

    try {
      // Replace math expressions with KaTeX rendered HTML
      return text.replace(/\$(.*?)\$/g, (match, formula) => {
        try {
          return katex.renderToString(formula, {
            throwOnError: false,
            output: 'html',
            macros: katexMacros,
            strict: false
          });
        } catch (err) {
          logger.error('Error rendering formula:', err);
          return match;
        }
      });
    } catch (error) {
      logger.error('Error processing math:', error);
      return text;
    }
  };

  // Extract data from LaTeX content (advanced mode)
  const extractDataFromLatex = (): ExtractedData => {
    try {
      // Check if content is valid LaTeX
      if (!content.includes('\\begin{ex}') || !content.includes('\\end{ex}')) {
        return {
          content: content,
          type: 'essay',
          answers: [],
          correctAnswer: [],
          solution: undefined
        };
      }

      // Extract question content from ex environment
      const questionMatch = content.match(/\\begin\{ex\}([\s\S]*?)\\end\{ex\}/);
      if (!questionMatch) {
        throw new Error('No question content found in ex environment');
      }

      const questionContent = questionMatch[1];
      
      // Remove solution before processing
      let contentWithoutSolution = questionContent;
      if (questionContent.includes('\\loigiai')) {
        contentWithoutSolution = questionContent.split('\\loigiai')[0].trim();
      }

      // Extract main question text
      let questionText = '';
      if (contentWithoutSolution.includes('\\choice')) {
        questionText = contentWithoutSolution.split('\\choice')[0].trim();
      } else if (contentWithoutSolution.includes('\\choiceTF')) {
        questionText = contentWithoutSolution.split('\\choiceTF')[0].trim();
      } else {
        questionText = contentWithoutSolution.trim();
      }

      // Extract answers
      let answers: ExtractedData['answers'] = [];
      const correctAnswerIndices: number[] = [];
      let questionType: ExtractedData['type'] = 'essay';

      // Process multiple choice questions
      if (contentWithoutSolution.includes('\\choice')) {
        questionType = 'multiple-choice';
        const choiceContent = contentWithoutSolution.split('\\choice')[1];
        const answerLines = choiceContent.split('\n').filter(line => line.trim() !== '');

        answers = answerLines.map((line, index) => {
          const isCorrect = line.includes('\\True');
          if (isCorrect) {
            correctAnswerIndices.push(index);
          }

          let answerContent = line.replace('\\True', '').trim();
          if (answerContent.startsWith('{') && answerContent.endsWith('}')) {
            answerContent = answerContent.substring(1, answerContent.length - 1).trim();
          }

          return {
            id: `answer-${index}`,
            content: answerContent,
            isCorrect: isCorrect
          };
        });
      }

      // Process true/false questions
      else if (contentWithoutSolution.includes('\\choiceTF')) {
        questionType = 'true-false';
        const choiceContent = contentWithoutSolution.split('\\choiceTF')[1];
        const answerLines = choiceContent.split('\n').filter(line => line.trim() !== '');

        answers = answerLines.map((line, index) => {
          const isCorrect = line.includes('\\True');
          if (isCorrect) {
            correctAnswerIndices.push(index);
          }

          let answerContent = line.replace('\\True', '').trim();
          if (answerContent.startsWith('{') && answerContent.endsWith('}')) {
            answerContent = answerContent.substring(1, answerContent.length - 1).trim();
          }

          return {
            id: `answer-${index}`,
            content: answerContent,
            isCorrect: isCorrect
          };
        });
      }

      // Extract solution
      let solution: string | undefined;
      const loigiaiMatch = content.match(/\\loigiai\s*\{([\s\S]*?)\}/);
      if (loigiaiMatch) {
        solution = loigiaiMatch[1].trim();
      }

      return {
        content: questionText,
        type: questionType,
        answers: answers,
        correctAnswer: correctAnswerIndices.map(index => `answer-${index}`),
        solution: solution
      };

    } catch (error) {
      logger.error('Error extracting data from LaTeX:', error);
      return {
        content: content,
        type: 'essay',
        answers: [],
        correctAnswer: [],
        solution: undefined
      };
    }
  };

  // Process content based on mode
  useEffect(() => {
    if (mode === 'simple') {
      // Simple mode: just render with KaTeX like the original KaTeXRenderer
      const container = containerRef.current;
      if (container) {
        try {
          let processedContent = content;

          // Extract from ex environment
          const exMatch = content.match(/\\begin\{ex\}.*?\n([\s\S]*?)\\end\{ex\}/);
          if (exMatch && exMatch[1]) {
            processedContent = exMatch[1];
          }

          // Clean up content
          processedContent = processedContent
            .replace(/\[TL\.\d+\]/g, '')
            .replace(/%.*?\n/g, '\n')
            .replace(/\\textbf\{([^{}]*)\}/g, '<strong>$1</strong>')
            .replace(/\\textit\{([^{}]*)\}/g, '<em>$1</em>')
            .replace(/\\underline\{([^{}]*)\}/g, '<u>$1</u>')
            .replace(/\\newline/g, '<br/>')
            .replace(/\\\\/g, '<br/>');

          // Render math with KaTeX
          processedContent = renderMathWithKaTeX(processedContent);

          container.innerHTML = `<div class="katex-preview">${processedContent}</div>`;
        } catch (error) {
          logger.error('Error in simple mode rendering:', error);
          container.innerHTML = `<div class="error">Error rendering content</div>`;
        }
      }
    } else {
      // Advanced mode: full parsing and structured display
      const data = extractDataFromLatex();
      setExtractedData(data);
    }
  }, [content, mode]);

  if (mode === 'simple') {
    return (
      <div ref={containerRef} className={`katex-container ${className}`}>
        <div className="loading-placeholder">Đang tải nội dung...</div>
      </div>
    );
  }

  // Advanced mode rendering
  if (!extractedData) {
    return <div className="loading-placeholder">Đang xử lý nội dung...</div>;
  }

  return (
    <div className={`latex-renderer ${className}`}>
      {/* Question content */}
      <div 
        className="question-content"
        dangerouslySetInnerHTML={{ __html: renderMathWithKaTeX(extractedData.content) }}
      />

      {/* answers */}
      {extractedData.answers.length > 0 && (
        <div className="answers-section">
          {extractedData.answers.map((answer, index) => {
            const label = String.fromCharCode(65 + index); // A, B, C, D...
            return (
              <div 
                key={answer.id} 
                className={`answer-item ${answer.isCorrect ? 'correct' : ''}`}
              >
                <span className="answer-label">{label}</span>
                {answer.isCorrect && <span className="correct-mark">✓</span>}
                <span 
                  className="answer-content"
                  dangerouslySetInnerHTML={{ __html: renderMathWithKaTeX(answer.content) }}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Solution */}
      {showSolution && extractedData.solution && (
        <div className="solution-section">
          <button 
            className="solution-toggle"
            onClick={() => setShowSolutionState(!showSolutionState)}
          >
            {showSolutionState ? 'Ẩn lời giải' : 'Hiện lời giải'}
          </button>
          {showSolutionState && (
            <div 
              className="solution-content"
              dangerouslySetInnerHTML={{ __html: renderMathWithKaTeX(extractedData.solution) }}
            />
          )}
        </div>
      )}
    </div>
  );
});

export { UnifiedLatexRendererComponent as UnifiedLatexRenderer };
export default UnifiedLatexRendererComponent;
