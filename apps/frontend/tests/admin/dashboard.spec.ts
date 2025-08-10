import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin dashboard
    await page.goto('/3141592654/admin/dashboard');
  });

  test('should load dashboard page successfully', async ({ page }) => {
    // Verify page title
    await expect(page).toHaveTitle(/Dashboard/);
    
    // Verify main dashboard container
    await expect(page.locator('[data-testid="dashboard-container"]')).toBeVisible();
    
    // Take screenshot for evidence
    await page.screenshot({ 
      path: '../../docs/tests/evidence/dashboard-load.png',
      fullPage: true 
    });
  });

  test('should display statistics widgets', async ({ page }) => {
    // Check for statistics cards
    const statsCards = page.locator('[data-testid="stats-card"]');
    await expect(statsCards).toHaveCount(4); // Assuming 4 main stats
    
    // Verify each stat card has title and value
    for (let i = 0; i < await statsCards.count(); i++) {
      const card = statsCards.nth(i);
      await expect(card.locator('[data-testid="stat-title"]')).toBeVisible();
      await expect(card.locator('[data-testid="stat-value"]')).toBeVisible();
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verify dashboard is still accessible
    await expect(page.locator('[data-testid="dashboard-container"]')).toBeVisible();
    
    // Check mobile navigation
    await expect(page.locator('[data-testid="mobile-menu-toggle"]')).toBeVisible();
    
    // Take mobile screenshot
    await page.screenshot({ 
      path: '../../docs/tests/evidence/dashboard-mobile.png',
      fullPage: true 
    });
  });

  test('should refresh data when refresh button clicked', async ({ page }) => {
    // Wait for initial load
    await page.waitForLoadState('networkidle');
    
    // Click refresh button
    await page.click('[data-testid="refresh-button"]');
    
    // Verify loading state
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
    
    // Wait for data to reload
    await page.waitForLoadState('networkidle');
    
    // Verify loading state is gone
    await expect(page.locator('[data-testid="loading-spinner"]')).not.toBeVisible();
  });

  test('should navigate to other admin sections', async ({ page }) => {
    // Test navigation to Users
    await page.click('[data-testid="nav-users"]');
    await expect(page).toHaveURL(/.*\/users/);
    
    // Go back to dashboard
    await page.goto('/3141592654/admin/dashboard');
    
    // Test navigation to Questions
    await page.click('[data-testid="nav-questions"]');
    await expect(page).toHaveURL(/.*\/questions/);
  });

  test('should handle errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/admin/stats', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });
    
    // Reload page to trigger error
    await page.reload();
    
    // Verify error message is displayed
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    
    // Verify retry button is available
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
  });

  test('should display recent activities', async ({ page }) => {
    // Check for recent activities section
    await expect(page.locator('[data-testid="recent-activities"]')).toBeVisible();
    
    // Verify activity items
    const activityItems = page.locator('[data-testid="activity-item"]');
    await expect(activityItems.first()).toBeVisible();
    
    // Check activity item structure
    const firstActivity = activityItems.first();
    await expect(firstActivity.locator('[data-testid="activity-user"]')).toBeVisible();
    await expect(firstActivity.locator('[data-testid="activity-action"]')).toBeVisible();
    await expect(firstActivity.locator('[data-testid="activity-time"]')).toBeVisible();
  });

  test('should show charts and analytics preview', async ({ page }) => {
    // Check for charts container
    await expect(page.locator('[data-testid="charts-container"]')).toBeVisible();
    
    // Verify chart elements are rendered
    await expect(page.locator('[data-testid="user-growth-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="question-stats-chart"]')).toBeVisible();
    
    // Test chart interactions
    await page.hover('[data-testid="user-growth-chart"]');
    await expect(page.locator('[data-testid="chart-tooltip"]')).toBeVisible();
  });
});
