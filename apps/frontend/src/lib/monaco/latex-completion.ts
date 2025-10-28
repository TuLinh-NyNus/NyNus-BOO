/**
 * LaTeX Auto-completion Provider for Monaco Editor
 * ===============================================
 * Provides intelligent auto-completion for LaTeX commands, environments,
 * and exam-specific syntax
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

import * as monaco from 'monaco-editor';
import { latexCommands as _latexCommands } from './latex-language';

// Helper function to create a default range for completion items
function createDefaultRange(): monaco.IRange {
  return {
    startLineNumber: 1,
    endLineNumber: 1,
    startColumn: 1,
    endColumn: 1
  };
}

// Helper function to add range to completion items
function _addRangeToItems(items: Omit<monaco.languages.CompletionItem, 'range'>[]): monaco.languages.CompletionItem[] {
  return items.map(item => ({
    ...item,
    range: createDefaultRange()
  }));
}

// ===== COMPLETION ITEMS =====

// Basic LaTeX commands
export const basicCommands: monaco.languages.CompletionItem[] = [
  {
    label: '\\begin',
    kind: monaco.languages.CompletionItemKind.Snippet,
    insertText: '\\begin{${1:environment}}\n\t$0\n\\end{${1:environment}}',
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    documentation: 'Begin environment',
    detail: 'LaTeX environment',
    range: createDefaultRange()
  },
  {
    label: '\\frac',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: '\\frac{${1:numerator}}{${2:denominator}}',
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    documentation: 'Fraction',
    detail: 'Math fraction',
    range: createDefaultRange()
  },
  {
    label: '\\sqrt',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: '\\sqrt{${1:expression}}',
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    documentation: 'Square root',
    detail: 'Math square root',
    range: createDefaultRange()
  },
  {
    label: '\\sum',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: '\\sum_{${1:i=1}}^{${2:n}} ${3:expression}',
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    documentation: 'Summation',
    detail: 'Math summation',
    range: createDefaultRange()
  },
  {
    label: '\\int',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: '\\int_{${1:a}}^{${2:b}} ${3:f(x)} dx',
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    documentation: 'Integral',
    detail: 'Math integral',
    range: createDefaultRange()
  }
];

// Exam-specific commands
export const examCommands: monaco.languages.CompletionItem[] = [
  {
    label: '\\begin{ex}',
    kind: monaco.languages.CompletionItemKind.Snippet,
    insertText: '\\begin{ex}%[${1:Mã câu hỏi}]%[${2:Nguồn}]\n${3:Nội dung câu hỏi...}\n\\choice\n{\\True ${4:Đáp án A (đúng)}}\n{${5:Đáp án B}}\n{${6:Đáp án C}}\n{${7:Đáp án D}}\n\\loigiai{\n${8:Lời giải chi tiết...}\n}\n\\end{ex}',
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    documentation: 'Exam question template',
    detail: 'NyNus exam question structure',
    range: createDefaultRange()
  },
  {
    label: '\\choice',
    kind: monaco.languages.CompletionItemKind.Snippet,
    insertText: '\\choice\n{\\True ${1:Đáp án đúng}}\n{${2:Đáp án B}}\n{${3:Đáp án C}}\n{${4:Đáp án D}}',
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    documentation: 'Multiple choice answers',
    detail: 'Exam choice options',
    range: createDefaultRange()
  },
  {
    label: '\\choice[m]',
    kind: monaco.languages.CompletionItemKind.Snippet,
    insertText: '\\choice[m]\n{\\True ${1:Đáp án A (đúng)}}\n{${2:Đáp án B}}\n{\\True ${3:Đáp án C (đúng)}}\n{${4:Đáp án D}}',
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    documentation: 'Multiple correct answers',
    detail: 'Multiple choice with multiple correct answers',
    range: createDefaultRange()
  },
  {
    label: '\\True',
    kind: monaco.languages.CompletionItemKind.Keyword,
    insertText: '\\True ${1:Đáp án đúng}',
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    documentation: 'Mark correct answer',
    detail: 'Indicates correct answer choice',
    range: createDefaultRange()
  },
  {
    label: '\\loigiai',
    kind: monaco.languages.CompletionItemKind.Snippet,
    insertText: '\\loigiai{\n${1:Lời giải chi tiết...}\n}',
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    documentation: 'Solution explanation',
    detail: 'Detailed solution for the question',
    range: createDefaultRange()
  }
];

// Math environments
export const mathEnvironments: monaco.languages.CompletionItem[] = [
  {
    label: 'equation',
    kind: monaco.languages.CompletionItemKind.Snippet,
    insertText: '\\begin{equation}\n\t${1:equation}\n\\end{equation}',
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    documentation: 'Numbered equation',
    detail: 'Math equation environment',
    range: createDefaultRange()
  },
  {
    label: 'align',
    kind: monaco.languages.CompletionItemKind.Snippet,
    insertText: '\\begin{align}\n\t${1:equation1} &= ${2:expression1} \\\\\\\\\n\t${3:equation2} &= ${4:expression2}\n\\end{align}',
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    documentation: 'Aligned equations',
    detail: 'Math align environment',
    range: createDefaultRange()
  },
  {
    label: 'cases',
    kind: monaco.languages.CompletionItemKind.Snippet,
    insertText: '\\begin{cases}\n\t${1:case1} & \\text{if } ${2:condition1} \\\\\\\\\n\t${3:case2} & \\text{if } ${4:condition2}\n\\end{cases}',
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    documentation: 'Piecewise function',
    detail: 'Math cases environment',
    range: createDefaultRange()
  },
  {
    label: 'matrix',
    kind: monaco.languages.CompletionItemKind.Snippet,
    insertText: '\\begin{${1|pmatrix,bmatrix,vmatrix,Vmatrix|}}\n\t${2:a} & ${3:b} \\\\\\\\\n\t${4:c} & ${5:d}\n\\end{${1|pmatrix,bmatrix,vmatrix,Vmatrix|}}',
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    documentation: 'Matrix',
    detail: 'Math matrix environment',
    range: createDefaultRange()
  }
];

// Greek letters
export const greekLetters: monaco.languages.CompletionItem[] = [
  { label: '\\alpha', kind: monaco.languages.CompletionItemKind.Constant, insertText: '\\alpha', documentation: 'Greek letter alpha', range: createDefaultRange() },
  { label: '\\beta', kind: monaco.languages.CompletionItemKind.Constant, insertText: '\\beta', documentation: 'Greek letter beta', range: createDefaultRange() },
  { label: '\\gamma', kind: monaco.languages.CompletionItemKind.Constant, insertText: '\\gamma', documentation: 'Greek letter gamma', range: createDefaultRange() },
  { label: '\\delta', kind: monaco.languages.CompletionItemKind.Constant, insertText: '\\delta', documentation: 'Greek letter delta', range: createDefaultRange() },
  { label: '\\epsilon', kind: monaco.languages.CompletionItemKind.Constant, insertText: '\\epsilon', documentation: 'Greek letter epsilon', range: createDefaultRange() },
  { label: '\\theta', kind: monaco.languages.CompletionItemKind.Constant, insertText: '\\theta', documentation: 'Greek letter theta', range: createDefaultRange() },
  { label: '\\lambda', kind: monaco.languages.CompletionItemKind.Constant, insertText: '\\lambda', documentation: 'Greek letter lambda', range: createDefaultRange() },
  { label: '\\mu', kind: monaco.languages.CompletionItemKind.Constant, insertText: '\\mu', documentation: 'Greek letter mu', range: createDefaultRange() },
  { label: '\\pi', kind: monaco.languages.CompletionItemKind.Constant, insertText: '\\pi', documentation: 'Greek letter pi', range: createDefaultRange() },
  { label: '\\sigma', kind: monaco.languages.CompletionItemKind.Constant, insertText: '\\sigma', documentation: 'Greek letter sigma', range: createDefaultRange() },
  { label: '\\phi', kind: monaco.languages.CompletionItemKind.Constant, insertText: '\\phi', documentation: 'Greek letter phi', range: createDefaultRange() },
  { label: '\\omega', kind: monaco.languages.CompletionItemKind.Constant, insertText: '\\omega', documentation: 'Greek letter omega', range: createDefaultRange() }
];

// Math operators
export const mathOperators: monaco.languages.CompletionItem[] = [
  { label: '\\cdot', kind: monaco.languages.CompletionItemKind.Operator, insertText: '\\cdot', documentation: 'Multiplication dot', range: createDefaultRange() },
  { label: '\\times', kind: monaco.languages.CompletionItemKind.Operator, insertText: '\\times', documentation: 'Multiplication cross', range: createDefaultRange() },
  { label: '\\div', kind: monaco.languages.CompletionItemKind.Operator, insertText: '\\div', documentation: 'Division symbol', range: createDefaultRange() },
  { label: '\\pm', kind: monaco.languages.CompletionItemKind.Operator, insertText: '\\pm', documentation: 'Plus-minus', range: createDefaultRange() },
  { label: '\\mp', kind: monaco.languages.CompletionItemKind.Operator, insertText: '\\mp', documentation: 'Minus-plus', range: createDefaultRange() },
  { label: '\\leq', kind: monaco.languages.CompletionItemKind.Operator, insertText: '\\leq', documentation: 'Less than or equal', range: createDefaultRange() },
  { label: '\\geq', kind: monaco.languages.CompletionItemKind.Operator, insertText: '\\geq', documentation: 'Greater than or equal', range: createDefaultRange() },
  { label: '\\neq', kind: monaco.languages.CompletionItemKind.Operator, insertText: '\\neq', documentation: 'Not equal', range: createDefaultRange() },
  { label: '\\approx', kind: monaco.languages.CompletionItemKind.Operator, insertText: '\\approx', documentation: 'Approximately equal', range: createDefaultRange() },
  { label: '\\equiv', kind: monaco.languages.CompletionItemKind.Operator, insertText: '\\equiv', documentation: 'Equivalent', range: createDefaultRange() }
];

// ===== COMPLETION PROVIDER =====

export const latexCompletionProvider: monaco.languages.CompletionItemProvider = {
  provideCompletionItems: (model, position, _context, _token) => {
    const word = model.getWordUntilPosition(position);
    const range = {
      startLineNumber: position.lineNumber,
      endLineNumber: position.lineNumber,
      startColumn: word.startColumn,
      endColumn: word.endColumn
    };

    // Get the line content to determine context
    const lineContent = model.getLineContent(position.lineNumber);
    const beforeCursor = lineContent.substring(0, position.column - 1);
    
    // Check if we're in a math environment
    const inMathMode = beforeCursor.includes('$') && !beforeCursor.includes('$$');
    const inDisplayMath = beforeCursor.includes('$$');
    
    // Combine all completion items
    let suggestions: monaco.languages.CompletionItem[] = [
      ...basicCommands,
      ...examCommands,
      ...mathEnvironments,
      ...greekLetters,
      ...mathOperators
    ];

    // Filter suggestions based on context
    if (inMathMode || inDisplayMath) {
      // In math mode, prioritize math-related completions
      suggestions = [
        ...mathOperators,
        ...greekLetters,
        ...basicCommands.filter(cmd => {
          const label = typeof cmd.label === 'string' ? cmd.label : cmd.label.label;
          return ['\\frac', '\\sqrt', '\\sum', '\\int'].includes(label);
        }),
        ...mathEnvironments
      ];
    }

    // Filter by current word
    if (word.word) {
      suggestions = suggestions.filter(suggestion => {
        const label = typeof suggestion.label === 'string' ? suggestion.label : suggestion.label.label;
        return label.toLowerCase().includes(word.word.toLowerCase());
      });
    }

    // Set range for all suggestions
    suggestions.forEach(suggestion => {
      suggestion.range = range;
    });

    return {
      suggestions
    };
  },

  triggerCharacters: ['\\', '{', '$']
};

// ===== REGISTRATION FUNCTION =====

export function registerLatexCompletion() {
  monaco.languages.registerCompletionItemProvider('latex', latexCompletionProvider);
}

const latexCompletionModule = {
  registerLatexCompletion,
  latexCompletionProvider,
  basicCommands,
  examCommands,
  mathEnvironments,
  greekLetters,
  mathOperators
};

export default latexCompletionModule;
