/**
 * Theme Preloader Utility
 * Prevents hydration mismatch and improves theme loading performance
 */

type Theme = 'light' | 'dark' | 'system';

interface ThemePreloaderConfig {
  storageKey: string;
  defaultTheme: Theme;
  enableSystem: boolean;
}

/**
 * Theme Preloader Class
 * Handles theme detection and preloading before React hydration
 */
export class ThemePreloader {
  private config: ThemePreloaderConfig;
  
  constructor(config: ThemePreloaderConfig) {
    this.config = config;
  }

  /**
   * Generate theme preload script
   * This script runs before React hydration to prevent flash
   * 
   * @param nonce - Optional CSP nonce for enhanced security
   */
  getPreloadScript(_nonce?: string): string {
    // Escape values để prevent XSS
    const escapeValue = (value: string) => value.replace(/'/g, "\\'").replace(/"/g, '\\"');
    
    return `
      (function() {
        try {
          var storageKey = '${escapeValue(this.config.storageKey)}';
          var defaultTheme = '${escapeValue(this.config.defaultTheme)}';
          var enableSystem = ${this.config.enableSystem};
          
          function getSystemTheme() {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          }
          
          function applyTheme(theme) {
            var resolvedTheme = theme === 'system' ? getSystemTheme() : theme;
            var root = document.documentElement;

            // Remove all theme classes
            root.classList.remove('light', 'dark');

            // Add the resolved theme class
            root.classList.add(resolvedTheme);

            // Set color-scheme for optimal browser rendering
            root.style.colorScheme = resolvedTheme;

            // ✅ NEW: Set data attribute for debugging
            root.setAttribute('data-theme', resolvedTheme);

            // Store the applied theme for React hydration
            sessionStorage.setItem('__theme_applied', resolvedTheme);
          }
          
          // Get theme from localStorage or use default
          var storedTheme = localStorage.getItem(storageKey);
          var theme = storedTheme || defaultTheme;
          
          // Validate theme
          var validThemes = ['light', 'dark'];
          if (enableSystem) validThemes.push('system');
          
          if (!validThemes.includes(theme)) {
            theme = defaultTheme;
          }
          
          // Apply theme immediately
          applyTheme(theme);
          
          // ✅ ENHANCED: Listen for system theme changes with modern API
          if (enableSystem && (theme === 'system' || !storedTheme)) {
            var mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            var handleChange = function() {
              var currentTheme = localStorage.getItem(storageKey);
              if (currentTheme === 'system' || !currentTheme) {
                applyTheme('system');
              }
            };

            // Use modern API if available, fallback to deprecated addListener
            if (mediaQuery.addEventListener) {
              mediaQuery.addEventListener('change', handleChange);
            } else {
              mediaQuery.addListener(handleChange);
            }
          }
        } catch (e) {
          // Fallback to default theme on error
          document.documentElement.classList.add('${this.config.defaultTheme}');
          console.warn('Theme preloader error:', e);
        }
      })();
    `;
  }

  /**
   * Get applied theme from session storage
   * Used by React components to get the preloaded theme
   */
  static getAppliedTheme(): Theme | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const applied = sessionStorage.getItem('__theme_applied');
      return applied as Theme || null;
    } catch {
      return null;
    }
  }

  /**
   * Clear applied theme cache
   * Used when theme is manually changed
   */
  static clearAppliedTheme(): void {
    if (typeof window === 'undefined') return;
    
    try {
      sessionStorage.removeItem('__theme_applied');
    } catch {
      // Ignore errors
    }
  }
}

/**
 * Default theme preloader instance
 */
export const defaultThemePreloader = new ThemePreloader({
  storageKey: 'nynus-theme',
  defaultTheme: 'light',
  enableSystem: true,
});

/**
 * React hook for getting preloaded theme
 */
export function usePreloadedTheme(): Theme | null {
  if (typeof window === 'undefined') return null;
  return ThemePreloader.getAppliedTheme();
}
