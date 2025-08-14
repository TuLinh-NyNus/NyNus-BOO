/**
 * LaTeX Parser Tests
 * Unit tests cho LaTeX parsing functionality
 */

import { parseLatexContent } from '@/lib/theory/latex-parser';
import { LATEX_COMMANDS, LATEX_ENVIRONMENTS } from '@/lib/theory/latex-commands';

describe('LaTeX Parser', () => {
  describe('parseLatexContent', () => {
    it('should parse basic LaTeX content', () => {
      const content = `\\section{Test Section}

This is a test paragraph.

\\subsection{Test Subsection}

Another paragraph with math: $x^2 + y^2 = z^2$`;

      const result = parseLatexContent(content, 'test.tex');

      expect(result).toBeDefined();
      expect(result.title).toBe('Test Section');
      expect(result.htmlContent).toContain('Test Section');
      expect(result.htmlContent).toContain('Test Subsection');
      expect(result.htmlContent).toContain('x^2 + y^2 = z^2');
    });

    it('should extract metadata correctly', () => {
      const content = `\\section{Advanced Calculus}

This chapter covers advanced calculus topics.

\\subsection{Derivatives}
\\subsection{Integrals}
\\subsection{Applications}`;

      const result = parseLatexContent(content, 'calculus.tex');

      expect(result.title).toBe('Advanced Calculus');
      expect(result.wordCount).toBeGreaterThan(0);
      expect(result.wordCount).toBeGreaterThan(0);
      expect(result.sections).toContain('Derivatives');
      expect(result.sections).toContain('Integrals');
      expect(result.sections).toContain('Applications');
    });

    it('should handle custom commands', () => {
      const content = `\\section{Custom Commands}

This uses custom commands: \\iconMT and \\indam{emphasized text}.

\\begin{boxkn}
This is a knowledge box.
\\end{boxkn}`;

      const result = parseLatexContent(content, 'custom.tex');

      expect(result.htmlContent).toContain('emphasized text');
      expect(result.htmlContent).toContain('knowledge box');
    });

    it('should handle math expressions', () => {
      const content = `\\section{Mathematics}

Inline math: $\\frac{a}{b} = c$

Display math:
$$\\int_{0}^{\\infty} e^{-x} dx = 1$$`;

      const result = parseLatexContent(content, 'math.tex');

      expect(result.htmlContent).toContain('frac{a}{b}');
      expect(result.htmlContent).toContain('int_{0}^{\\infty}');
      expect(result.htmlContent).toContain('frac{a}{b}');
    });

    it('should handle empty content', () => {
      const result = parseLatexContent('', 'empty.tex');

      expect(result.title).toBe('Untitled');
      expect(result.htmlContent).toBe('');
      expect(result.wordCount).toBe(0);
      expect(result.sections).toHaveLength(0);
    });

    it('should handle malformed LaTeX gracefully', () => {
      const content = `\\section{Malformed

This has unclosed commands \\begin{itemize}
\\item Item 1
\\item Item 2
Missing end tag`;

      expect(() => {
        parseLatexContent(content, 'malformed.tex');
      }).not.toThrow();
    });
  });

  describe('LaTeX Commands', () => {
    it('should have all required custom commands', () => {
      expect(LATEX_COMMANDS).toHaveProperty('\\\\iconMT');
      expect(LATEX_COMMANDS).toHaveProperty('\\\\indam\\{([^}]+)\\}');
      expect(LATEX_COMMANDS).toHaveProperty('\\\\indamm\\{([^}]+)\\}');
    });

    it('should have all required environments', () => {
      expect(LATEX_ENVIRONMENTS).toHaveProperty('boxkn');
      expect(LATEX_ENVIRONMENTS).toHaveProperty('vd');
      expect(LATEX_ENVIRONMENTS).toHaveProperty('itemize');
    });

    it('should map commands to correct HTML', () => {
      expect(LATEX_COMMANDS['\\\\iconMT']).toBe('•');
      expect(LATEX_COMMANDS['\\\\indam\\{([^}]+)\\}']).toContain('<strong');
    });
  });

  describe('Performance', () => {
    it('should parse content within reasonable time', () => {
      const largeContent = `\\section{Large Content}

${'\\subsection{Section} '.repeat(100)}

${'This is a paragraph with some content. '.repeat(1000)}`;

      const startTime = performance.now();
      parseLatexContent(largeContent, 'large.tex');
      const endTime = performance.now();

      const parseTime = endTime - startTime;
      expect(parseTime).toBeLessThan(1000); // Should parse within 1 second
    });

    it('should handle multiple math expressions efficiently', () => {
      const mathContent = Array.from({ length: 50 }, (_, i) => 
        `$x_{${i}} = \\frac{${i}}{${i + 1}}$`
      ).join('\n\n');

      const content = `\\section{Math Heavy}

${mathContent}`;

      const startTime = performance.now();
      const result = parseLatexContent(content, 'math-heavy.tex');
      const endTime = performance.now();

      expect(result.htmlContent).toContain('frac{');
      expect(endTime - startTime).toBeLessThan(500);
    });
  });

  describe('Edge Cases', () => {
    it('should handle nested environments', () => {
      const content = `\\section{Nested}

\\begin{boxkn}
Outer box
\\begin{itemize}
\\item Item 1
\\item Item 2
\\end{itemize}
End outer box
\\end{boxkn}`;

      const result = parseLatexContent(content, 'nested.tex');
      expect(result.htmlContent).toContain('Outer box');
      expect(result.htmlContent).toContain('Item 1');
    });

    it('should handle special characters', () => {
      const content = `\\section{Special Characters}

Content with special chars: & % $ # ^ _ { } ~ \\`;

      const result = parseLatexContent(content, 'special.tex');
      expect(result.htmlContent).toContain('Special Characters');
    });

    it('should handle Unicode characters', () => {
      const content = `\\section{Unicode Test}

Vietnamese: Toán học, tiếng Việt
Math symbols: α β γ δ ε
Emojis: 📚 🧮 📊`;

      const result = parseLatexContent(content, 'unicode.tex');
      expect(result.htmlContent).toContain('Toán học');
      expect(result.htmlContent).toContain('α β γ');
    });

    it('should preserve whitespace correctly', () => {
      const content = `\\section{Whitespace}

Paragraph 1

Paragraph 2 with    multiple    spaces

Paragraph 3`;

      const result = parseLatexContent(content, 'whitespace.tex');
      expect(result.htmlContent).toContain('Paragraph 1');
      expect(result.htmlContent).toContain('Paragraph 2');
      expect(result.htmlContent).toContain('Paragraph 3');
    });
  });

  describe('Regression Tests', () => {
    it('should maintain backward compatibility', () => {
      // Test với content từ existing theory files
      const legacyContent = `\\section{MỆNH ĐỀ}

Trong toán học, \\indam{mệnh đề} là một câu khẳng định có thể xác định được tính đúng sai.

\\begin{boxkn}
\\textbf{Định nghĩa:} Mệnh đề là một câu khẳng định có thể xác định được tính đúng hoặc sai của nó, nhưng không thể vừa đúng vừa sai.
\\end{boxkn}

\\subsection{Ví dụ về mệnh đề}

\\begin{vd}
Các câu sau đây là mệnh đề:
\\begin{itemize}
\\item[\\iconMT] $2 + 3 = 5$ (mệnh đề đúng)
\\item[\\iconMT] $\\pi > 4$ (mệnh đề sai)
\\item[\\iconMT] Hà Nội là thủ đô của Việt Nam (mệnh đề đúng)
\\end{itemize}
\\end{vd}`;

      const result = parseLatexContent(legacyContent, 'legacy.tex');

      expect(result.title).toBe('MỆNH ĐỀ');
      expect(result.htmlContent).toContain('mệnh đề');
      expect(result.htmlContent).toContain('Định nghĩa');
      expect(result.htmlContent).toContain('2 + 3 = 5');
      expect(result.sections).toContain('Ví dụ về mệnh đề');
    });
  });
});
