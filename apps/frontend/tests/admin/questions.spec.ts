import { test, expect } from '@playwright/test';

test.describe('Admin Questions Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/3141592654/admin/questions');
  });

  test('should load questions list page', async ({ page }) => {
    // Verify page title
    await expect(page).toHaveTitle(/Questions/);
    
    // Verify questions table
    await expect(page.locator('[data-testid="questions-table"]')).toBeVisible();
    
    // Verify table headers
    await expect(page.locator('[data-testid="header-content"]')).toBeVisible();
    await expect(page.locator('[data-testid="header-type"]')).toBeVisible();
    await expect(page.locator('[data-testid="header-difficulty"]')).toBeVisible();
    await expect(page.locator('[data-testid="header-category"]')).toBeVisible();
    await expect(page.locator('[data-testid="header-actions"]')).toBeVisible();
    
    // Take screenshot
    await page.screenshot({ 
      path: '../../docs/tests/evidence/questions-list.png',
      fullPage: true 
    });
  });

  test('should create new multiple choice question', async ({ page }) => {
    // Click create question button
    await page.click('[data-testid="create-question-button"]');
    
    // Verify modal opens
    await expect(page.locator('[data-testid="create-question-modal"]')).toBeVisible();
    
    // Fill question form
    await page.fill('[data-testid="question-content-input"]', 'What is 2 + 2?');
    await page.selectOption('[data-testid="question-type-select"]', 'multiple-choice');
    await page.selectOption('[data-testid="question-difficulty-select"]', 'easy');
    await page.selectOption('[data-testid="question-category-select"]', 'math');
    
    // Add multiple choice options
    await page.fill('[data-testid="option-1-input"]', '3');
    await page.fill('[data-testid="option-2-input"]', '4');
    await page.fill('[data-testid="option-3-input"]', '5');
    await page.fill('[data-testid="option-4-input"]', '6');
    
    // Mark correct answer
    await page.check('[data-testid="option-2-correct"]');
    
    // Add explanation
    await page.fill('[data-testid="question-explanation"]', 'Basic addition: 2 + 2 = 4');
    
    // Submit form
    await page.click('[data-testid="submit-question-button"]');
    
    // Verify success message
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
    
    // Verify new question appears in list
    await expect(page.locator('[data-testid="question-row"]').filter({ hasText: 'What is 2 + 2?' })).toBeVisible();
  });

  test('should create essay question', async ({ page }) => {
    // Click create question button
    await page.click('[data-testid="create-question-button"]');
    
    // Fill essay question form
    await page.fill('[data-testid="question-content-input"]', 'Explain the concept of recursion in programming.');
    await page.selectOption('[data-testid="question-type-select"]', 'essay');
    await page.selectOption('[data-testid="question-difficulty-select"]', 'hard');
    await page.selectOption('[data-testid="question-category-select"]', 'programming');
    
    // Set points
    await page.fill('[data-testid="question-points-input"]', '10');
    
    // Add grading rubric
    await page.fill('[data-testid="grading-rubric"]', 'Must include definition, example, and use cases');
    
    // Submit form
    await page.click('[data-testid="submit-question-button"]');
    
    // Verify success message
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
  });

  test('should edit existing question', async ({ page }) => {
    // Wait for questions to load
    await page.waitForSelector('[data-testid="question-row"]');
    
    // Click edit button for first question
    await page.click('[data-testid="question-row"]:first-child [data-testid="edit-question-button"]');
    
    // Verify edit modal opens
    await expect(page.locator('[data-testid="edit-question-modal"]')).toBeVisible();
    
    // Update question content
    await page.fill('[data-testid="question-content-input"]', 'Updated question content');
    
    // Submit changes
    await page.click('[data-testid="save-question-button"]');
    
    // Verify success message
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
    
    // Verify changes are reflected
    await expect(page.locator('[data-testid="question-row"]:first-child')).toContainText('Updated question content');
  });

  test('should delete question with confirmation', async ({ page }) => {
    // Wait for questions to load
    await page.waitForSelector('[data-testid="question-row"]');
    
    // Get initial question count
    const initialCount = await page.locator('[data-testid="question-row"]').count();
    
    // Click delete button for last question
    await page.click('[data-testid="question-row"]:last-child [data-testid="delete-question-button"]');
    
    // Verify confirmation dialog
    await expect(page.locator('[data-testid="delete-confirmation"]')).toBeVisible();
    
    // Confirm deletion
    await page.click('[data-testid="confirm-delete-button"]');
    
    // Verify success message
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
    
    // Verify question count decreased
    await page.waitForTimeout(1000);
    const newCount = await page.locator('[data-testid="question-row"]').count();
    expect(newCount).toBe(initialCount - 1);
  });

  test('should import questions from CSV', async ({ page }) => {
    // Click import button
    await page.click('[data-testid="import-questions-button"]');
    
    // Verify import modal opens
    await expect(page.locator('[data-testid="import-modal"]')).toBeVisible();
    
    // Upload CSV file
    const fileInput = page.locator('[data-testid="csv-file-input"]');
    await fileInput.setInputFiles('../../docs/sample_questions.csv');
    
    // Start import
    await page.click('[data-testid="start-import-button"]');
    
    // Verify import progress
    await expect(page.locator('[data-testid="import-progress"]')).toBeVisible();
    
    // Wait for import completion
    await expect(page.locator('[data-testid="import-success"]')).toBeVisible({ timeout: 30000 });
    
    // Verify imported questions appear
    await page.click('[data-testid="close-import-modal"]');
    await page.reload();
    
    // Check for new questions
    const questionCount = await page.locator('[data-testid="question-row"]').count();
    expect(questionCount).toBeGreaterThan(0);
  });

  test('should export questions to CSV', async ({ page }) => {
    // Click export button
    await page.click('[data-testid="export-questions-button"]');
    
    // Verify export options modal
    await expect(page.locator('[data-testid="export-modal"]')).toBeVisible();
    
    // Select export format
    await page.click('[data-testid="export-csv"]');
    
    // Configure export options
    await page.check('[data-testid="include-answers"]');
    await page.check('[data-testid="include-explanations"]');
    
    // Start download
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="start-export-button"]');
    
    // Verify download starts
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('questions');
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('should filter questions by category and difficulty', async ({ page }) => {
    // Wait for questions to load
    await page.waitForSelector('[data-testid="question-row"]');
    
    // Filter by category
    await page.selectOption('[data-testid="category-filter"]', 'math');
    await page.waitForTimeout(1000);
    
    // Verify filtered results
    const mathQuestions = page.locator('[data-testid="question-row"]');
    const count = await mathQuestions.count();
    
    for (let i = 0; i < count; i++) {
      const categoryCell = mathQuestions.nth(i).locator('[data-testid="question-category"]');
      await expect(categoryCell).toContainText('Math');
    }
    
    // Filter by difficulty
    await page.selectOption('[data-testid="difficulty-filter"]', 'easy');
    await page.waitForTimeout(1000);
    
    // Verify combined filters
    const filteredQuestions = page.locator('[data-testid="question-row"]');
    const filteredCount = await filteredQuestions.count();
    expect(filteredCount).toBeLessThanOrEqual(count);
  });

  test('should search questions by content', async ({ page }) => {
    // Wait for questions to load
    await page.waitForSelector('[data-testid="question-row"]');
    
    // Search for specific content
    await page.fill('[data-testid="search-input"]', 'programming');
    await page.press('[data-testid="search-input"]', 'Enter');
    
    // Wait for search results
    await page.waitForTimeout(1000);
    
    // Verify search results contain the term
    const searchResults = page.locator('[data-testid="question-row"]');
    const resultCount = await searchResults.count();
    
    if (resultCount > 0) {
      // Check that results contain search term
      await expect(searchResults.first().locator('[data-testid="question-content"]')).toContainText('programming');
    }
  });

  test('should preview question', async ({ page }) => {
    // Wait for questions to load
    await page.waitForSelector('[data-testid="question-row"]');
    
    // Click preview button for first question
    await page.click('[data-testid="question-row"]:first-child [data-testid="preview-question-button"]');
    
    // Verify preview modal opens
    await expect(page.locator('[data-testid="question-preview-modal"]')).toBeVisible();
    
    // Verify question content is displayed
    await expect(page.locator('[data-testid="preview-content"]')).toBeVisible();
    
    // If multiple choice, verify options are shown
    const questionType = await page.locator('[data-testid="preview-type"]').textContent();
    if (questionType?.includes('Multiple Choice')) {
      await expect(page.locator('[data-testid="preview-options"]')).toBeVisible();
    }
    
    // Close preview
    await page.click('[data-testid="close-preview-button"]');
    await expect(page.locator('[data-testid="question-preview-modal"]')).not.toBeVisible();
  });

  test('should handle bulk operations on questions', async ({ page }) => {
    // Wait for questions to load
    await page.waitForSelector('[data-testid="question-row"]');
    
    // Select multiple questions
    await page.check('[data-testid="question-row"]:nth-child(1) [data-testid="question-checkbox"]');
    await page.check('[data-testid="question-row"]:nth-child(2) [data-testid="question-checkbox"]');
    
    // Verify bulk actions appear
    await expect(page.locator('[data-testid="bulk-actions"]')).toBeVisible();
    
    // Test bulk category change
    await page.click('[data-testid="bulk-category-button"]');
    await page.selectOption('[data-testid="bulk-category-select"]', 'science');
    
    // Confirm bulk action
    await page.click('[data-testid="confirm-bulk-button"]');
    
    // Verify success message
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verify mobile layout
    await expect(page.locator('[data-testid="mobile-questions-view"]')).toBeVisible();
    
    // Test mobile create question
    await page.click('[data-testid="mobile-create-button"]');
    await expect(page.locator('[data-testid="create-question-modal"]')).toBeVisible();
    
    // Take mobile screenshot
    await page.screenshot({ 
      path: '../../docs/tests/evidence/questions-mobile.png',
      fullPage: true 
    });
  });
});
