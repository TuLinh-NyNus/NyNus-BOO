import { test, expect } from '@playwright/test';

test.describe('Admin Users Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/3141592654/admin/users');
  });

  test('should load users list page', async ({ page }) => {
    // Verify page title
    await expect(page).toHaveTitle(/Users/);
    
    // Verify users table
    await expect(page.locator('[data-testid="users-table"]')).toBeVisible();
    
    // Verify table headers
    await expect(page.locator('[data-testid="header-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="header-email"]')).toBeVisible();
    await expect(page.locator('[data-testid="header-role"]')).toBeVisible();
    await expect(page.locator('[data-testid="header-status"]')).toBeVisible();
    await expect(page.locator('[data-testid="header-actions"]')).toBeVisible();
    
    // Take screenshot
    await page.screenshot({ 
      path: '../../docs/tests/evidence/users-list.png',
      fullPage: true 
    });
  });

  test('should search users by name', async ({ page }) => {
    // Wait for users to load
    await page.waitForSelector('[data-testid="user-row"]');
    
    // Get initial user count
    const initialCount = await page.locator('[data-testid="user-row"]').count();
    
    // Search for specific user
    await page.fill('[data-testid="search-input"]', 'John');
    await page.press('[data-testid="search-input"]', 'Enter');
    
    // Wait for search results
    await page.waitForTimeout(1000);
    
    // Verify filtered results
    const filteredCount = await page.locator('[data-testid="user-row"]').count();
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
    
    // Verify search term is highlighted
    await expect(page.locator('[data-testid="search-highlight"]')).toBeVisible();
  });

  test('should filter users by role', async ({ page }) => {
    // Open role filter dropdown
    await page.click('[data-testid="role-filter"]');
    
    // Select admin role
    await page.click('[data-testid="filter-admin"]');
    
    // Wait for filter to apply
    await page.waitForTimeout(1000);
    
    // Verify all visible users have admin role
    const userRows = page.locator('[data-testid="user-row"]');
    const count = await userRows.count();
    
    for (let i = 0; i < count; i++) {
      const roleCell = userRows.nth(i).locator('[data-testid="user-role"]');
      await expect(roleCell).toContainText('Admin');
    }
  });

  test('should create new user', async ({ page }) => {
    // Click create user button
    await page.click('[data-testid="create-user-button"]');
    
    // Verify modal opens
    await expect(page.locator('[data-testid="create-user-modal"]')).toBeVisible();
    
    // Fill user form
    await page.fill('[data-testid="user-name-input"]', 'Test User');
    await page.fill('[data-testid="user-email-input"]', 'test@example.com');
    await page.selectOption('[data-testid="user-role-select"]', 'student');
    await page.fill('[data-testid="user-password-input"]', 'password123');
    
    // Submit form
    await page.click('[data-testid="submit-user-button"]');
    
    // Verify success message
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
    
    // Verify modal closes
    await expect(page.locator('[data-testid="create-user-modal"]')).not.toBeVisible();
    
    // Verify new user appears in list
    await expect(page.locator('[data-testid="user-row"]').filter({ hasText: 'test@example.com' })).toBeVisible();
  });

  test('should edit user information', async ({ page }) => {
    // Wait for users to load
    await page.waitForSelector('[data-testid="user-row"]');
    
    // Click edit button for first user
    await page.click('[data-testid="user-row"]:first-child [data-testid="edit-user-button"]');
    
    // Verify edit modal opens
    await expect(page.locator('[data-testid="edit-user-modal"]')).toBeVisible();
    
    // Update user name
    await page.fill('[data-testid="user-name-input"]', 'Updated Name');
    
    // Submit changes
    await page.click('[data-testid="save-user-button"]');
    
    // Verify success message
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
    
    // Verify changes are reflected
    await expect(page.locator('[data-testid="user-row"]:first-child')).toContainText('Updated Name');
  });

  test('should delete user with confirmation', async ({ page }) => {
    // Wait for users to load
    await page.waitForSelector('[data-testid="user-row"]');
    
    // Get initial user count
    const initialCount = await page.locator('[data-testid="user-row"]').count();
    
    // Click delete button for last user
    await page.click('[data-testid="user-row"]:last-child [data-testid="delete-user-button"]');
    
    // Verify confirmation dialog
    await expect(page.locator('[data-testid="delete-confirmation"]')).toBeVisible();
    
    // Confirm deletion
    await page.click('[data-testid="confirm-delete-button"]');
    
    // Verify success message
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
    
    // Verify user count decreased
    await page.waitForTimeout(1000);
    const newCount = await page.locator('[data-testid="user-row"]').count();
    expect(newCount).toBe(initialCount - 1);
  });

  test('should handle bulk operations', async ({ page }) => {
    // Wait for users to load
    await page.waitForSelector('[data-testid="user-row"]');
    
    // Select multiple users
    await page.check('[data-testid="user-row"]:nth-child(1) [data-testid="user-checkbox"]');
    await page.check('[data-testid="user-row"]:nth-child(2) [data-testid="user-checkbox"]');
    
    // Verify bulk actions appear
    await expect(page.locator('[data-testid="bulk-actions"]')).toBeVisible();
    
    // Test bulk status change
    await page.click('[data-testid="bulk-status-button"]');
    await page.click('[data-testid="status-inactive"]');
    
    // Verify confirmation dialog
    await expect(page.locator('[data-testid="bulk-confirmation"]')).toBeVisible();
    
    // Confirm bulk action
    await page.click('[data-testid="confirm-bulk-button"]');
    
    // Verify success message
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
  });

  test('should export users data', async ({ page }) => {
    // Click export button
    await page.click('[data-testid="export-users-button"]');
    
    // Verify export options modal
    await expect(page.locator('[data-testid="export-modal"]')).toBeVisible();
    
    // Select CSV format
    await page.click('[data-testid="export-csv"]');
    
    // Start download
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="start-export-button"]');
    
    // Verify download starts
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('users');
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verify mobile layout
    await expect(page.locator('[data-testid="mobile-users-view"]')).toBeVisible();
    
    // Verify mobile search
    await page.click('[data-testid="mobile-search-toggle"]');
    await expect(page.locator('[data-testid="mobile-search-input"]')).toBeVisible();
    
    // Take mobile screenshot
    await page.screenshot({ 
      path: '../../docs/tests/evidence/users-mobile.png',
      fullPage: true 
    });
  });

  test('should handle pagination', async ({ page }) => {
    // Wait for users to load
    await page.waitForSelector('[data-testid="user-row"]');
    
    // Verify pagination controls
    await expect(page.locator('[data-testid="pagination"]')).toBeVisible();
    
    // Test page size change
    await page.selectOption('[data-testid="page-size-select"]', '50');
    await page.waitForTimeout(1000);
    
    // Verify more users loaded
    const userCount = await page.locator('[data-testid="user-row"]').count();
    expect(userCount).toBeGreaterThan(20);
    
    // Test next page
    if (await page.locator('[data-testid="next-page-button"]').isEnabled()) {
      await page.click('[data-testid="next-page-button"]');
      await page.waitForTimeout(1000);
      
      // Verify page changed
      await expect(page.locator('[data-testid="current-page"]')).toContainText('2');
    }
  });
});
