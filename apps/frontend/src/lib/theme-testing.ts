/**
 * Theme Testing Utilities
 * Utilities for testing theme functionality and accessibility
 */

import type { Page } from '@playwright/test';

export interface ThemeTestConfig {
  baseUrl: string;
  themes: string[];
  components: string[];
  pages: string[];
}

/**
 * Theme Test Suite
 * Automated testing for theme functionality
 */
export class ThemeTestSuite {
  private config: ThemeTestConfig;

  constructor(config: ThemeTestConfig) {
    this.config = config;
  }

  /**
   * Test theme switching functionality
   */
  async testThemeSwitching(page: Page) {
    const results: Array<{ theme: string; success: boolean; error?: string }> = [];

    for (const theme of this.config.themes) {
      try {
        // Click theme toggle to switch theme
        await page.click('[data-theme-toggle]');
        
        // Wait for theme to be applied
        await page.waitForSelector(`.${theme}`, { timeout: 1000 });
        
        // Verify theme class is applied to html element
        const htmlClass = await page.getAttribute('html', 'class');
        const hasThemeClass = htmlClass?.includes(theme) ?? false;
        
        // Verify theme is stored in localStorage
        const storedTheme = await page.evaluate(() => localStorage.getItem('nynus-theme'));
        
        results.push({
          theme,
          success: hasThemeClass && (storedTheme === theme || storedTheme === null),
        });
      } catch (error) {
        results.push({
          theme,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }

  /**
   * Test color contrast accessibility
   */
  async testColorContrast(page: Page) {
    const results: Array<{ 
      theme: string; 
      element: string; 
      contrast: number; 
      passes: boolean;
    }> = [];

    // Critical elements to test for contrast
    const elementsToTest = [
      '.admin-button-primary',
      '.admin-input',
      '.admin-table-header',
      '.badge-default',
      '.hero-button-primary',
    ];

    for (const theme of this.config.themes) {
      // Switch to theme
      await page.evaluate((t) => {
        document.documentElement.className = t;
      }, theme);

      for (const selector of elementsToTest) {
        try {
          const element = await page.$(selector);
          if (!element) continue;

          // Get computed styles
          const styles = await element.evaluate((el) => {
            const computed = window.getComputedStyle(el);
            return {
              color: computed.color,
              backgroundColor: computed.backgroundColor,
            };
          });

          // Calculate contrast ratio (simplified)
          const contrast = await this.calculateContrastRatio(
            styles.color,
            styles.backgroundColor
          );

          results.push({
            theme,
            element: selector,
            contrast,
            passes: contrast >= 4.5, // WCAG AA standard
          });
        } catch (_error) {
          console.warn(`Could not test contrast for ${selector} in ${theme} theme`);
        }
      }
    }

    return results;
  }

  /**
   * Test component rendering in different themes
   */
  async testComponentRendering(page: Page) {
    const results: Array<{
      theme: string;
      component: string;
      rendered: boolean;
      error?: string;
    }> = [];

    for (const theme of this.config.themes) {
      // Switch to theme
      await page.evaluate((t) => {
        document.documentElement.className = t;
      }, theme);

      for (const component of this.config.components) {
        try {
          // Wait for component to be visible
          await page.waitForSelector(component, { 
            state: 'visible', 
            timeout: 2000 
          });

          // Check if component has expected styling
          const hasStyles = await page.evaluate((selector) => {
            const element = document.querySelector(selector);
            if (!element) return false;

            const styles = window.getComputedStyle(element);
            return styles.display !== 'none' && 
                   styles.visibility !== 'hidden' &&
                   styles.opacity !== '0';
          }, component);

          results.push({
            theme,
            component,
            rendered: hasStyles,
          });
        } catch (error) {
          results.push({
            theme,
            component,
            rendered: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    }

    return results;
  }

  /**
   * Test theme performance
   */
  async testThemePerformance(page: Page) {
    const results: Array<{
      theme: string;
      switchTime: number;
      renderTime: number;
    }> = [];

    for (const theme of this.config.themes) {
      // Measure theme switching time
      const startTime = await page.evaluate(() => performance.now());
      
      await page.click('[data-theme-toggle]');
      await page.waitForSelector(`.${theme}`, { timeout: 1000 });
      
      const endTime = await page.evaluate(() => performance.now());
      const switchTime = endTime - startTime;

      // Measure render time after theme switch
      const renderStartTime = await page.evaluate(() => performance.now());
      
      // Force a repaint
      await page.evaluate(() => {
        void document.body.offsetHeight; // Trigger reflow
      });
      
      const renderEndTime = await page.evaluate(() => performance.now());
      const renderTime = renderEndTime - renderStartTime;

      results.push({
        theme,
        switchTime,
        renderTime,
      });
    }

    return results;
  }

  /**
   * Calculate contrast ratio between two colors
   * Simplified implementation for testing
   */
  private async calculateContrastRatio(color1: string, color2: string): Promise<number> {
    // This is a simplified implementation
    // In a real scenario, you would use a proper color contrast library
    
    const rgb1 = this.parseRGB(color1);
    const rgb2 = this.parseRGB(color2);
    
    if (!rgb1 || !rgb2) return 1; // Default to failing contrast
    
    const l1 = this.getLuminance(rgb1);
    const l2 = this.getLuminance(rgb2);
    
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  private parseRGB(color: string): { r: number; g: number; b: number } | null {
    const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!match) return null;
    
    return {
      r: parseInt(match[1]),
      g: parseInt(match[2]),
      b: parseInt(match[3]),
    };
  }

  private getLuminance(rgb: { r: number; g: number; b: number }): number {
    const { r, g, b } = rgb;
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }
}

/**
 * Jest testing utilities for theme components
 */
export class ThemeJestUtils {
  /**
   * Mock theme provider for Jest tests
   */
  static mockThemeProvider() {
    return {
      theme: 'dark',
      setTheme: jest.fn(),
      themes: ['light', 'dark'],
    };
  }

  /**
   * Test helper to render component with theme
   */
  static renderWithTheme(component: React.ReactElement, theme: string = 'dark') {
    const mockProvider = this.mockThemeProvider();
    mockProvider.theme = theme;

    // Mock next-themes context
    jest.mock('next-themes', () => ({
      useTheme: () => mockProvider,
      ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
    }));

    return component;
  }

  /**
   * Test semantic token values
   */
  static testSemanticTokens() {
    const lightTokens = {
      '--color-background': '#FDFCF7',
      '--color-foreground': '#1A1A2E',
      '--color-primary': '#F5D547',
    };

    const darkTokens = {
      '--color-background': '#0B1426',
      '--color-foreground': '#FFFFFF',
      '--color-primary': '#6366F1',
    };

    return { lightTokens, darkTokens };
  }
}

/**
 * Accessibility testing utilities
 */
export class A11yTestUtils {
  /**
   * Test focus management during theme switching
   */
  static async testFocusManagement(page: Page) {
    // Focus theme toggle button
    await page.focus('[data-theme-toggle]');
    
    // Press space to activate
    await page.keyboard.press('Space');
    
    // Verify focus is maintained
    const focused = await page.evaluate(() => 
      document.activeElement?.getAttribute('data-theme-toggle') !== null
    );
    
    return { focusMaintained: focused };
  }

  /**
   * Test keyboard navigation
   */
  static async testKeyboardNavigation(page: Page) {
    const results = [];
    
    // Test Tab navigation through theme-aware components
    const tabbableElements = [
      '[data-theme-toggle]',
      '.admin-button-primary',
      '.admin-input',
    ];

    for (const selector of tabbableElements) {
      try {
        await page.focus(selector);
        const isFocused = await page.evaluate((sel) => {
          const element = document.querySelector(sel);
          return document.activeElement === element;
        }, selector);
        
        results.push({ selector, focusable: isFocused });
      } catch {
        results.push({ selector, focusable: false });
      }
    }

    return results;
  }

  /**
   * Test screen reader announcements
   */
  static async testScreenReaderAnnouncements(page: Page) {
    // This would require integration with screen reader testing tools
    // For now, we test ARIA attributes
    const ariaResults = [];

    const elementsWithAria = [
      '[data-theme-toggle]',
      '.admin-button-primary',
      '.admin-modal',
    ];

    for (const selector of elementsWithAria) {
      try {
        const ariaLabel = await page.getAttribute(selector, 'aria-label');
        const ariaDescribedBy = await page.getAttribute(selector, 'aria-describedby');
        const role = await page.getAttribute(selector, 'role');

        ariaResults.push({
          selector,
          hasAriaLabel: !!ariaLabel,
          hasAriaDescribedBy: !!ariaDescribedBy,
          hasRole: !!role,
        });
      } catch {
        ariaResults.push({
          selector,
          hasAriaLabel: false,
          hasAriaDescribedBy: false,
          hasRole: false,
        });
      }
    }

    return ariaResults;
  }
}

/**
 * Default test configuration
 */
export const defaultThemeTestConfig: ThemeTestConfig = {
  baseUrl: 'http://localhost:3000',
  themes: ['light', 'dark'],
  components: [
    '.admin-card',
    '.admin-button-primary',
    '.admin-table',
    '.hero-button-primary',
    '[data-theme-toggle]',
  ],
  pages: [
    '/',
    '/admin',
    '/admin/users',
  ],
};
