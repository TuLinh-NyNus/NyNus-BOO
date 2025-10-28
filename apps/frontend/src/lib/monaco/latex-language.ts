/**
 * LaTeX Language Definition for Monaco Editor
 * =========================================
 * Defines syntax highlighting, tokenization, and language features for LaTeX
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

import * as monaco from 'monaco-editor';

// ===== LANGUAGE CONFIGURATION =====

export const latexLanguageConfig: monaco.languages.LanguageConfiguration = {
  comments: {
    lineComment: '%'
  },
  brackets: [
    ['{', '}'],
    ['[', ']'],
    ['(', ')']
  ],
  autoClosingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '$', close: '$' },
    { open: '$$', close: '$$' }
  ],
  surroundingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '$', close: '$' }
  ],
  folding: {
    markers: {
      start: new RegExp('^\\s*\\\\begin\\{([^}]+)\\}'),
      end: new RegExp('^\\s*\\\\end\\{([^}]+)\\}')
    }
  }
};

// ===== TOKENIZER RULES =====

export const latexLanguage: monaco.languages.IMonarchLanguage = {
  defaultToken: 'text',
  tokenPostfix: '.latex',

  // Keywords and commands
  keywords: [
    'begin', 'end', 'documentclass', 'usepackage', 'title', 'author', 'date',
    'maketitle', 'section', 'subsection', 'subsubsection', 'paragraph',
    'chapter', 'part', 'appendix', 'tableofcontents', 'listoffigures',
    'listoftables', 'bibliography', 'bibliographystyle', 'cite', 'ref',
    'label', 'pageref', 'footnote', 'marginpar'
  ],

  // Math commands
  mathCommands: [
    'frac', 'sqrt', 'sum', 'int', 'prod', 'lim', 'sin', 'cos', 'tan',
    'log', 'ln', 'exp', 'min', 'max', 'inf', 'sup', 'det', 'dim',
    'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta',
    'iota', 'kappa', 'lambda', 'mu', 'nu', 'xi', 'pi', 'rho', 'sigma',
    'tau', 'upsilon', 'phi', 'chi', 'psi', 'omega'
  ],

  // Custom LaTeX commands for exam questions
  examCommands: [
    'choice', 'True', 'loigiai', 'ex'
  ],

  // Operators
  operators: [
    '=', '>', '<', '!', '~', '?', ':', '==', '<=', '>=', '!=',
    '&&', '||', '++', '--', '+', '-', '*', '/', '&', '|', '^', '%',
    '<<', '>>', '>>>', '+=', '-=', '*=', '/=', '&=', '|=', '^=',
    '%=', '<<=', '>>=', '>>>='
  ],

  // Symbols
  symbols: /[=><!~?:&|+\-*\/\^%]+/,

  // Tokenizer
  tokenizer: {
    root: [
      // Comments
      [/%.*$/, 'comment'],

      // Math environments (display math)
      [/\$\$/, { token: 'string.math.display', next: '@mathDisplay' }],
      
      // Inline math
      [/\$/, { token: 'string.math.inline', next: '@mathInline' }],

      // LaTeX commands
      [/\\([a-zA-Z@]+)(\*?)/, {
        cases: {
          '$1@keywords': 'keyword.latex',
          '$1@mathCommands': 'keyword.math',
          '$1@examCommands': 'keyword.exam',
          '@default': 'keyword.latex'
        }
      }],

      // Environments
      [/\\(begin|end)\s*\{([^}]+)\}/, ['keyword.control', 'string.environment']],

      // Braces and brackets
      [/[{}]/, 'delimiter.bracket'],
      [/[\[\]]/, 'delimiter.square'],
      [/[()]/, 'delimiter.parenthesis'],

      // Numbers
      [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
      [/\d+/, 'number'],

      // Strings
      [/"([^"\\]|\\.)*$/, 'string.invalid'],
      [/"/, 'string', '@string'],

      // Whitespace
      [/[ \t\r\n]+/, 'white'],

      // Text
      [/[^\\\$%{}[\]()]+/, 'text']
    ],

    // Math display mode ($$...$$)
    mathDisplay: [
      [/\$\$/, { token: 'string.math.display', next: '@pop' }],
      [/\\([a-zA-Z@]+)/, 'keyword.math'],
      [/[{}]/, 'delimiter.bracket.math'],
      [/[\[\]]/, 'delimiter.square.math'],
      [/[()]/, 'delimiter.parenthesis.math'],
      [/[+\-*/=<>]/, 'operator.math'],
      [/\d+/, 'number.math'],
      [/[a-zA-Z]/, 'variable.math'],
      [/./, 'text.math']
    ],

    // Math inline mode ($...$)
    mathInline: [
      [/\$/, { token: 'string.math.inline', next: '@pop' }],
      [/\\([a-zA-Z@]+)/, 'keyword.math'],
      [/[{}]/, 'delimiter.bracket.math'],
      [/[\[\]]/, 'delimiter.square.math'],
      [/[()]/, 'delimiter.parenthesis.math'],
      [/[+\-*/=<>]/, 'operator.math'],
      [/\d+/, 'number.math'],
      [/[a-zA-Z]/, 'variable.math'],
      [/./, 'text.math']
    ],

    // String handling
    string: [
      [/[^\\"]+/, 'string'],
      [/\\./, 'string.escape.invalid'],
      [/"/, 'string', '@pop']
    ]
  }
};

// ===== LANGUAGE REGISTRATION =====

export function registerLatexLanguage() {
  // Register the language
  monaco.languages.register({ id: 'latex' });

  // Set the language configuration
  monaco.languages.setLanguageConfiguration('latex', latexLanguageConfig);

  // Set the tokenizer
  monaco.languages.setMonarchTokensProvider('latex', latexLanguage);
}

// ===== COMMON LATEX COMMANDS FOR AUTOCOMPLETE =====

export const latexCommands = [
  // Document structure
  '\\documentclass{}',
  '\\usepackage{}',
  '\\begin{}',
  '\\end{}',
  '\\title{}',
  '\\author{}',
  '\\date{}',
  '\\maketitle',

  // Sectioning
  '\\section{}',
  '\\subsection{}',
  '\\subsubsection{}',
  '\\paragraph{}',
  '\\chapter{}',

  // Math
  '\\frac{}{}',
  '\\sqrt{}',
  '\\sqrt[]{}',
  '\\sum_{}^{}',
  '\\int_{}^{}',
  '\\prod_{}^{}',
  '\\lim_{}',

  // Greek letters
  '\\alpha',
  '\\beta',
  '\\gamma',
  '\\delta',
  '\\epsilon',
  '\\theta',
  '\\lambda',
  '\\mu',
  '\\pi',
  '\\sigma',
  '\\phi',
  '\\omega',

  // Exam-specific commands
  '\\begin{ex}',
  '\\end{ex}',
  '\\choice',
  '\\True',
  '\\loigiai{}',

  // Common environments
  '\\begin{equation}',
  '\\end{equation}',
  '\\begin{align}',
  '\\end{align}',
  '\\begin{cases}',
  '\\end{cases}',
  '\\begin{pmatrix}',
  '\\end{pmatrix}',
  '\\begin{bmatrix}',
  '\\end{bmatrix}',

  // Formatting
  '\\textbf{}',
  '\\textit{}',
  '\\underline{}',
  '\\emph{}',

  // References
  '\\label{}',
  '\\ref{}',
  '\\cite{}',
  '\\footnote{}'
];

const latexLanguageModule = {
  registerLatexLanguage,
  latexLanguageConfig,
  latexLanguage,
  latexCommands
};

export default latexLanguageModule;





