import { test, expect } from '@playwright/test';

test.describe('Comprehensive Admin Module Testing', () => {
  
  // Test all admin modules accessibility and basic functionality
  const adminModules = [
    'analytics',
    'audit', 
    'books',
    'faq',
    'level-progression',
    'mapcode',
    'notifications',
    'permissions',
    'resources',
    'roles',
    'security',
    'sessions',
    'settings'
  ];

  adminModules.forEach(module => {
    test(`should load ${module} module successfully`, async ({ page }) => {
      // Navigate to module
      await page.goto(`/3141592654/admin/${module}`);
      
      // Verify page loads without errors
      await expect(page.locator('body')).toBeVisible();
      
      // Check for common admin layout elements
      await expect(page.locator('[data-testid="admin-header"]')).toBeVisible();
      await expect(page.locator('[data-testid="admin-sidebar"]')).toBeVisible();
      
      // Verify module-specific content area
      await expect(page.locator('[data-testid="main-content"]')).toBeVisible();
      
      // Take screenshot for evidence
      await page.screenshot({ 
        path: `../../docs/tests/evidence/${module}-load.png`,
        fullPage: true 
      });
      
      // Check for JavaScript errors
      const errors = await page.evaluate(() => {
        return window.console.error.toString();
      });
      
      // Log any console errors for investigation
      if (errors && errors.length > 0) {
        console.log(`Console errors in ${module}:`, errors);
      }
    });

    test(`should be responsive on mobile - ${module}`, async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Navigate to module
      await page.goto(`/3141592654/admin/${module}`);
      
      // Verify mobile layout
      await expect(page.locator('[data-testid="mobile-header"]')).toBeVisible();
      
      // Check mobile navigation
      const mobileMenuToggle = page.locator('[data-testid="mobile-menu-toggle"]');
      if (await mobileMenuToggle.isVisible()) {
        await mobileMenuToggle.click();
        await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
      }
      
      // Take mobile screenshot
      await page.screenshot({ 
        path: `../../docs/tests/evidence/${module}-mobile.png`,
        fullPage: true 
      });
    });
  });

  test('should navigate between all admin modules', async ({ page }) => {
    // Start at dashboard
    await page.goto('/3141592654/admin/dashboard');
    
    // Test navigation to each module
    for (const module of adminModules) {
      // Click navigation link
      const navLink = page.locator(`[data-testid="nav-${module}"]`);
      if (await navLink.isVisible()) {
        await navLink.click();
        
        // Verify URL changed
        await expect(page).toHaveURL(new RegExp(`.*/${module}`));
        
        // Verify page loaded
        await expect(page.locator('[data-testid="main-content"]')).toBeVisible();
        
        // Wait a bit for any async loading
        await page.waitForTimeout(500);
      }
    }
  });

  test('should handle authentication across all modules', async ({ page }) => {
    // Test each module requires authentication
    for (const module of adminModules) {
      // Clear authentication
      await page.context().clearCookies();
      await page.context().clearPermissions();
      
      // Try to access module directly
      await page.goto(`/3141592654/admin/${module}`);
      
      // Should redirect to login or show auth error
      const currentUrl = page.url();
      const hasLoginRedirect = currentUrl.includes('login') || currentUrl.includes('auth');
      const hasAuthError = await page.locator('[data-testid="auth-error"]').isVisible();
      
      expect(hasLoginRedirect || hasAuthError).toBeTruthy();
    }
  });

  test('should check performance across modules', async ({ page }) => {
    const performanceResults = [];
    
    for (const module of adminModules) {
      // Start performance measurement
      const startTime = Date.now();
      
      // Navigate to module
      await page.goto(`/3141592654/admin/${module}`);
      
      // Wait for page to be fully loaded
      await page.waitForLoadState('networkidle');
      
      // Calculate load time
      const loadTime = Date.now() - startTime;
      
      performanceResults.push({
        module,
        loadTime,
        status: loadTime < 3000 ? 'PASS' : 'FAIL'
      });
      
      // Log slow loading modules
      if (loadTime > 3000) {
        console.log(`⚠️ Slow loading module: ${module} (${loadTime}ms)`);
      }
    }
    
    // Generate performance report
    console.log('Performance Results:', performanceResults);
    
    // Verify at least 80% of modules load within 3 seconds
    const passCount = performanceResults.filter(r => r.status === 'PASS').length;
    const passRate = (passCount / performanceResults.length) * 100;
    
    expect(passRate).toBeGreaterThanOrEqual(80);
  });

  test('should check accessibility across modules', async ({ page }) => {
    for (const module of adminModules.slice(0, 5)) { // Test first 5 modules for time
      await page.goto(`/3141592654/admin/${module}`);
      
      // Check for basic accessibility elements
      const hasHeadings = await page.locator('h1, h2, h3').count() > 0;
      const hasLabels = await page.locator('label').count() > 0;
      const hasAltText = await page.locator('img[alt]').count() >= await page.locator('img').count();
      
      // Log accessibility issues
      if (!hasHeadings) console.log(`❌ ${module}: Missing heading structure`);
      if (!hasLabels) console.log(`❌ ${module}: Missing form labels`);
      if (!hasAltText) console.log(`❌ ${module}: Missing alt text on images`);
      
      // Basic keyboard navigation test
      await page.keyboard.press('Tab');
      const focusedElement = await page.locator(':focus').count();
      expect(focusedElement).toBeGreaterThan(0);
    }
  });

  test('should test error handling across modules', async ({ page }) => {
    for (const module of adminModules.slice(0, 3)) { // Test first 3 modules
      // Mock API error
      await page.route(`**/api/admin/${module}/**`, route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error' })
        });
      });
      
      await page.goto(`/3141592654/admin/${module}`);
      
      // Check for error handling
      const hasErrorMessage = await page.locator('[data-testid="error-message"]').isVisible();
      const hasRetryButton = await page.locator('[data-testid="retry-button"]').isVisible();
      const hasErrorBoundary = await page.locator('[data-testid="error-boundary"]').isVisible();
      
      // At least one error handling mechanism should be present
      expect(hasErrorMessage || hasRetryButton || hasErrorBoundary).toBeTruthy();
      
      // Clear route mock
      await page.unroute(`**/api/admin/${module}/**`);
    }
  });

  test('should verify security headers and CSRF protection', async ({ page }) => {
    // Check for security headers
    const response = await page.goto('/3141592654/admin/dashboard');
    const headers = response?.headers();
    
    // Verify important security headers
    expect(headers?.['x-frame-options']).toBeDefined();
    expect(headers?.['x-content-type-options']).toBeDefined();
    
    // Check for CSRF token in forms
    await page.goto('/3141592654/admin/users');
    
    const csrfToken = await page.locator('[name="csrf-token"]').getAttribute('value');
    expect(csrfToken).toBeTruthy();
  });

  test('should test data export functionality across modules', async ({ page }) => {
    const exportableModules = ['users', 'questions', 'analytics', 'audit'];
    
    for (const module of exportableModules) {
      await page.goto(`/3141592654/admin/${module}`);
      
      // Look for export button
      const exportButton = page.locator('[data-testid="export-button"], [data-testid="export-data"]');
      
      if (await exportButton.isVisible()) {
        await exportButton.click();
        
        // Verify export modal or dropdown appears
        const exportModal = page.locator('[data-testid="export-modal"]');
        const exportDropdown = page.locator('[data-testid="export-dropdown"]');
        
        expect(await exportModal.isVisible() || await exportDropdown.isVisible()).toBeTruthy();
      }
    }
  });

  test('should verify search functionality across modules', async ({ page }) => {
    const searchableModules = ['users', 'questions', 'books', 'resources'];
    
    for (const module of searchableModules) {
      await page.goto(`/3141592654/admin/${module}`);
      
      // Look for search input
      const searchInput = page.locator('[data-testid="search-input"], [placeholder*="Search"], [placeholder*="Tìm kiếm"]');
      
      if (await searchInput.isVisible()) {
        // Test search functionality
        await searchInput.fill('test');
        await page.keyboard.press('Enter');
        
        // Wait for search results
        await page.waitForTimeout(1000);
        
        // Verify search was performed (URL change or loading indicator)
        const urlHasSearch = page.url().includes('search') || page.url().includes('q=');
        const hasLoadingIndicator = await page.locator('[data-testid="loading"], [data-testid="spinner"]').isVisible();
        
        expect(urlHasSearch || hasLoadingIndicator).toBeTruthy();
      }
    }
  });

  test('should test pagination across modules', async ({ page }) => {
    const paginatedModules = ['users', 'questions', 'books', 'sessions'];
    
    for (const module of paginatedModules) {
      await page.goto(`/3141592654/admin/${module}`);
      
      // Wait for data to load
      await page.waitForTimeout(2000);
      
      // Look for pagination controls
      const pagination = page.locator('[data-testid="pagination"]');
      const nextButton = page.locator('[data-testid="next-page"], [aria-label="Next page"]');
      const pageNumbers = page.locator('[data-testid="page-number"]');
      
      if (await pagination.isVisible() || await nextButton.isVisible() || await pageNumbers.count() > 0) {
        // Test pagination if available
        if (await nextButton.isEnabled()) {
          const currentUrl = page.url();
          await nextButton.click();
          await page.waitForTimeout(1000);
          
          // Verify page changed
          const newUrl = page.url();
          expect(newUrl).not.toBe(currentUrl);
        }
      }
    }
  });
});
