import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // Thực hiện đăng nhập admin
  await page.goto('/3141592654/admin');
  
  // Kiểm tra xem có redirect đến login không
  await page.waitForURL('**/login', { timeout: 10000 });
  
  // Điền thông tin đăng nhập admin
  await page.fill('[data-testid="email-input"]', 'admin@example.com');
  await page.fill('[data-testid="password-input"]', 'admin123');
  
  // Click nút đăng nhập
  await page.click('[data-testid="login-button"]');
  
  // Chờ redirect về admin dashboard
  await page.waitForURL('**/3141592654/admin**');
  
  // Verify đăng nhập thành công
  await expect(page.locator('[data-testid="admin-header"]')).toBeVisible();
  
  // Lưu authentication state
  await page.context().storageState({ path: authFile });
});
