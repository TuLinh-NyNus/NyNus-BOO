/**
 * Mobile Optimizer
 * Tối ưu hóa content cho mobile devices với responsive LaTeX và images
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

import {
  MobileOptimizationConfig,
  MobileOptimizationResult,
  TheoryLatexOptions,
  TheoryLatexResult
} from '@/types/theory';
import {
  renderLatexExpression
} from '@/lib/utils/latex-rendering';

// ===== CONSTANTS =====

const DEFAULT_MOBILE_CONFIG: MobileOptimizationConfig = {
  maxImageWidth: 800,
  imageQuality: 85,
  enableWebP: true,
  lazyLoadImages: true,
  optimizeLatex: true,
  touchFriendlyNavigation: true,
  progressiveLoading: true
};

const MOBILE_LATEX_OPTIONS: TheoryLatexOptions = {
  displayMode: false,
  throwOnError: false,
  errorColor: '#cc0000',
  strict: false,
  trust: true,
  maxSize: 8,  // Smaller for mobile
  maxExpand: 500,
  mobileOptimized: true,
  maxWidth: '100%',
  responsiveScaling: true,
  touchFriendly: true,
  macros: {
    // Vietnamese math macros optimized for mobile
    '\\vn': '\\text{#1}',
    '\\viet': '\\text{#1}',
    '\\dap': '\\Rightarrow',
    '\\kq': '\\boxed{#1}'
  }
};

// ===== MOBILE OPTIMIZER CLASS =====

export class MobileOptimizer {
  private config: MobileOptimizationConfig;

  constructor(config: Partial<MobileOptimizationConfig> = {}) {
    this.config = { ...DEFAULT_MOBILE_CONFIG, ...config };
  }

  /**
   * Optimize content cho mobile devices
   * Tối ưu hóa toàn bộ content bao gồm LaTeX, images và layout
   */
  async optimizeContent(html: string): Promise<MobileOptimizationResult> {
    const originalSize = Buffer.byteLength(html, 'utf8');
    const optimizations: string[] = [];
    const warnings: string[] = [];

    try {
      let optimizedHtml = html;

      // 1. Optimize LaTeX expressions
      if (this.config.optimizeLatex) {
        const latexResult = await this.makeLatexResponsive(optimizedHtml);
        optimizedHtml = latexResult.html;
        optimizations.push('LaTeX responsive optimization');
        
        if (latexResult.warnings.length > 0) {
          warnings.push(...latexResult.warnings);
        }
      }

      // 2. Optimize images
      if (this.config.maxImageWidth || this.config.enableWebP) {
        optimizedHtml = await this.optimizeImages(optimizedHtml);
        optimizations.push('Image optimization');
      }

      // 3. Add touch-friendly navigation
      if (this.config.touchFriendlyNavigation) {
        optimizedHtml = this.addTouchNavigation(optimizedHtml);
        optimizations.push('Touch-friendly navigation');
      }

      // 4. Add progressive loading
      if (this.config.progressiveLoading) {
        optimizedHtml = this.addProgressiveLoading(optimizedHtml);
        optimizations.push('Progressive loading');
      }

      // 5. Add mobile-specific CSS classes
      optimizedHtml = this.addMobileClasses(optimizedHtml);
      optimizations.push('Mobile CSS classes');

      // Calculate results
      const optimizedSize = Buffer.byteLength(optimizedHtml, 'utf8');
      const compressionRatio = (originalSize - optimizedSize) / originalSize;
      const mobileScore = this.calculateMobileScore(optimizedHtml);

      return {
        originalSize,
        optimizedSize,
        compressionRatio,
        mobileScore,
        optimizations,
        warnings
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown optimization error';
      warnings.push(`Optimization error: ${errorMessage}`);

      return {
        originalSize,
        optimizedSize: originalSize,
        compressionRatio: 0,
        mobileScore: 50, // Default score for failed optimization
        optimizations,
        warnings
      };
    }
  }

  /**
   * Make LaTeX expressions responsive cho mobile
   */
  async makeLatexResponsive(html: string): Promise<{ html: string; warnings: string[] }> {
    const warnings: string[] = [];
    
    try {
      // Find all LaTeX expressions trong HTML
      const latexRegex = /<span[^>]*class="[^"]*katex[^"]*"[^>]*>.*?<\/span>/g;
      let optimizedHtml = html;
      
      const matches = html.match(latexRegex);
      if (!matches) {
        return { html, warnings };
      }

      for (const match of matches) {
        try {
          // Extract LaTeX content (simplified - would need proper parsing)
          const latexContent = this.extractLatexFromHtml(match);
          
          if (latexContent) {
            // Re-render với mobile-optimized options
            const mobileResult = this.renderMobileLatex(latexContent);
            
            if (mobileResult.success) {
              // Replace với mobile-optimized version
              const mobileHtml = this.wrapMobileLatex(mobileResult.html);
              optimizedHtml = optimizedHtml.replace(match, mobileHtml);
            } else {
              warnings.push(`Failed to optimize LaTeX: ${latexContent.substring(0, 50)}...`);
            }
          }
        } catch (error) {
          warnings.push(`LaTeX processing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      return { html: optimizedHtml, warnings };
    } catch (error) {
      warnings.push(`LaTeX optimization error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { html, warnings };
    }
  }

  /**
   * Optimize TikZ images cho responsive display
   */
  async optimizeTikZImages(html: string): Promise<string> {
    // Find TikZ/SVG images
    const svgRegex = /<svg[^>]*>[\s\S]*?<\/svg>/g;
    let optimizedHtml = html;

    const svgMatches = html.match(svgRegex);
    if (!svgMatches) {
      return html;
    }

    for (const svgMatch of svgMatches) {
      try {
        // Add responsive wrapper và mobile-friendly attributes
        const responsiveSvg = this.makeImageResponsive(svgMatch, 'svg');
        optimizedHtml = optimizedHtml.replace(svgMatch, responsiveSvg);
      } catch (error) {
        console.warn('SVG optimization error:', error);
      }
    }

    return optimizedHtml;
  }

  // ===== PRIVATE HELPER METHODS =====

  /**
   * Optimize regular images
   */
  private async optimizeImages(html: string): Promise<string> {
    const imgRegex = /<img[^>]*>/g;
    let optimizedHtml = html;

    const imgMatches = html.match(imgRegex);
    if (!imgMatches) {
      return html;
    }

    for (const imgMatch of imgMatches) {
      try {
        const responsiveImg = this.makeImageResponsive(imgMatch, 'img');
        optimizedHtml = optimizedHtml.replace(imgMatch, responsiveImg);
      } catch (error) {
        console.warn('Image optimization error:', error);
      }
    }

    return optimizedHtml;
  }

  /**
   * Make image responsive
   */
  private makeImageResponsive(imageHtml: string, type: 'img' | 'svg'): string {
    if (type === 'svg') {
      // Add responsive SVG wrapper
      return `
        <div class="responsive-svg-container">
          <div class="responsive-svg-wrapper">
            ${imageHtml.replace(/<svg/, '<svg class="responsive-svg"')}
          </div>
        </div>
      `;
    } else {
      // Add responsive image classes và lazy loading
      const lazyLoading = this.config.lazyLoadImages ? 'loading="lazy"' : '';
      return imageHtml
        .replace(/<img/, `<img class="responsive-image" ${lazyLoading}`)
        .replace(/style="[^"]*"/, 'style="max-width: 100%; height: auto;"');
    }
  }

  /**
   * Add touch-friendly navigation
   */
  private addTouchNavigation(html: string): string {
    // Add touch-friendly navigation elements
    const touchNavigation = `
      <div class="mobile-navigation-controls">
        <button class="touch-nav-btn prev-btn" aria-label="Previous lesson">
          <span class="nav-icon">‹</span>
        </button>
        <button class="touch-nav-btn menu-btn" aria-label="Menu">
          <span class="nav-icon">☰</span>
        </button>
        <button class="touch-nav-btn next-btn" aria-label="Next lesson">
          <span class="nav-icon">›</span>
        </button>
      </div>
    `;

    // Insert navigation at the end of content
    return html + touchNavigation;
  }

  /**
   * Add progressive loading indicators
   */
  private addProgressiveLoading(html: string): string {
    // Add loading skeletons cho heavy content
    return html.replace(
      /<div class="latex-content/g,
      '<div class="latex-content progressive-load'
    );
  }

  /**
   * Add mobile-specific CSS classes
   */
  private addMobileClasses(html: string): string {
    return html
      .replace(/<div/g, '<div class="mobile-optimized"')
      .replace(/<p/g, '<p class="mobile-text"')
      .replace(/<h([1-6])/g, '<h$1 class="mobile-heading"');
  }

  /**
   * Extract LaTeX content từ rendered HTML
   */
  private extractLatexFromHtml(html: string): string | null {
    // Simplified extraction - would need proper parsing in production
    const match = html.match(/data-latex="([^"]*)"/) || html.match(/title="([^"]*)"/) ;
    return match ? match[1] : null;
  }

  /**
   * Render LaTeX với mobile optimization
   */
  private renderMobileLatex(latex: string): TheoryLatexResult {
    try {
      const result = renderLatexExpression(latex, MOBILE_LATEX_OPTIONS);
      
      return {
        ...result,
        mobileOptimized: true,
        responsiveHtml: this.wrapMobileLatex(result.html),
        originalSize: Buffer.byteLength(result.html, 'utf8'),
        optimizedSize: Buffer.byteLength(result.html, 'utf8') // Would be different after optimization
      };
    } catch (error) {
      return {
        success: false,
        html: `<span class="latex-error mobile">${latex}</span>`,
        error: error instanceof Error ? error.message : 'Unknown error',
        renderTime: 0,
        mobileOptimized: false,
        originalSize: 0,
        optimizedSize: 0
      };
    }
  }

  /**
   * Wrap LaTeX với mobile-friendly container
   */
  private wrapMobileLatex(latexHtml: string): string {
    return `
      <div class="mobile-latex-container">
        <div class="mobile-latex-wrapper">
          ${latexHtml}
        </div>
      </div>
    `;
  }

  /**
   * Calculate mobile optimization score
   */
  private calculateMobileScore(html: string): number {
    let score = 100;

    // Deduct points for mobile unfriendly elements
    const issues = [
      { pattern: /width:\s*\d{4,}px/g, penalty: 10, name: 'Fixed large widths' },
      { pattern: /<table(?![^>]*class="[^"]*responsive)/g, penalty: 15, name: 'Non-responsive tables' },
      { pattern: /font-size:\s*\d{2,}px/g, penalty: 5, name: 'Large fixed font sizes' },
      { pattern: /<img(?![^>]*loading="lazy")/g, penalty: 5, name: 'Non-lazy images' }
    ];

    for (const issue of issues) {
      const matches = html.match(issue.pattern);
      if (matches) {
        score -= Math.min(issue.penalty * matches.length, 30);
      }
    }

    // Bonus points for mobile optimizations
    const bonuses = [
      { pattern: /class="[^"]*responsive/g, bonus: 5, name: 'Responsive classes' },
      { pattern: /loading="lazy"/g, bonus: 3, name: 'Lazy loading' },
      { pattern: /class="[^"]*mobile/g, bonus: 2, name: 'Mobile classes' }
    ];

    for (const bonus of bonuses) {
      const matches = html.match(bonus.pattern);
      if (matches) {
        score += Math.min(bonus.bonus * matches.length, 20);
      }
    }

    return Math.max(0, Math.min(100, score));
  }
}
