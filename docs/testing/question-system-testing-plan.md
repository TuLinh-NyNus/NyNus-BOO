# Kế Hoạch Kiểm Tra Hệ Thống Question - NyNus Exam Bank System

## 📋 Tổng Quan

**Phạm vi kiểm tra:** Tất cả trang và component liên quan đến Question management
**Thời gian ước tính:** 40-50 giờ kiểm tra
**Ngày tạo:** 2025-01-20
**Phiên bản:** 1.0.0
**Testing Tool:** MCP Playwright Browser Automation

### 🎯 Mục Tiêu Kiểm Tra
- Đảm bảo tất cả tính năng CRUD hoạt động chính xác
- Kiểm tra responsive design trên tất cả thiết bị
- Xác minh accessibility compliance (WCAG 2.1 AA)
- Đánh giá performance và user experience
- Kiểm tra error handling và edge cases

### 📊 Thống Kê Hệ Thống
**Trang chính:** 6 trang
**Components:** 25+ components
**Breakpoints:** 4 responsive breakpoints
**API Endpoints:** 10+ endpoints
**User Roles:** Admin, Teacher, Student

### 🛠️ MCP Playwright Setup

#### Chuẩn Bị Môi Trường
```bash
# Khởi động development server
cd d:\0.111\exam-bank-system\apps\frontend
pnpm dev

# Base URL cho testing
http://localhost:3000
```

#### Playwright Commands Cơ Bản
```javascript
// Navigate to page
browser_navigate_Playwright({ url: "http://localhost:3000/3141592654/admin/questions" })

// Take screenshot
browser_take_screenshot_Playwright({ filename: "questions-list-page.png" })

// Get page snapshot for interactions
browser_snapshot_Playwright()

// Click element
browser_click_Playwright({ element: "Create Question button", ref: "[data-testid='create-question-btn']" })

// Type text
browser_type_Playwright({ element: "Search input", ref: "input[placeholder='Tìm kiếm câu hỏi...']", text: "test question" })

// Resize for responsive testing
browser_resize_Playwright({ width: 375, height: 667 }) // Mobile
browser_resize_Playwright({ width: 768, height: 1024 }) // Tablet
browser_resize_Playwright({ width: 1920, height: 1080 }) // Desktop
```

---

## 🏗️ Cấu Trúc Hệ Thống

### Trang Chính
1. **`/questions`** - Danh sách câu hỏi chính
2. **`/questions/create`** - Tạo câu hỏi mới
3. **`/questions/inputques`** - Nhập câu hỏi (Import)
4. **`/questions/[id]/edit`** - Chỉnh sửa câu hỏi
5. **`/questions/[id]`** - Chi tiết câu hỏi (Public)
6. **`/questions/browse`** - Browse câu hỏi (Public)

### Components Chính
- QuestionBank & QuestionBankTable
- QuestionForm (Create/Edit)
- ComprehensiveQuestionFiltersNew
- QuestionPreviewModal
- Import/Export functionality

---

## 🔴 CRITICAL PRIORITY - Kiểm Tra Cốt Lõi

### ⏱️ Ước tính: 15-18 giờ

## 1. Trang Danh Sách Question (`/questions`)

### 1.1 Functional Testing (4 giờ)

#### 🎬 Playwright Test Script: Load trang thành công
```javascript
// Navigate to questions page
await browser_navigate_Playwright({ url: "http://localhost:3000/3141592654/admin/questions" });

// Take initial screenshot
await browser_take_screenshot_Playwright({ filename: "questions-list-initial.png" });

// Get page snapshot to verify elements
await browser_snapshot_Playwright();
```

- [ ] **Load trang thành công**
  - [ ] Hiển thị danh sách câu hỏi
    - **Playwright:** Verify table with questions exists: `table[data-testid="questions-table"]`
  - [ ] Loading states hoạt động
    - **Playwright:** Check for loading spinner: `[data-testid="loading-spinner"]`
  - [ ] Error boundaries catch lỗi
    - **Playwright:** Simulate network error and verify error boundary
  - [ ] Toast notifications hiển thị
    - **Playwright:** Look for toast container: `[data-testid="toast-container"]`

#### 🎬 Playwright Test Script: QuestionBankTable Operations
```javascript
// Test sorting functionality
await browser_click_Playwright({ element: "Content column header", ref: "th[data-column='content']" });
await browser_take_screenshot_Playwright({ filename: "table-sorted-content.png" });

// Test pagination
await browser_click_Playwright({ element: "Next page button", ref: "[data-testid='pagination-next']" });
await browser_take_screenshot_Playwright({ filename: "table-page-2.png" });

// Test row selection
await browser_click_Playwright({ element: "First row checkbox", ref: "tr:first-child input[type='checkbox']" });
await browser_take_screenshot_Playwright({ filename: "row-selected.png" });
```

- [ ] **QuestionBankTable Operations**
  - [ ] Sorting theo từng column
    - **Playwright:** Click column headers: `th[data-column="content"]`, `th[data-column="type"]`, etc.
  - [ ] Pagination hoạt động
    - **Playwright:** Test pagination controls: `[data-testid="pagination-prev"]`, `[data-testid="pagination-next"]`
  - [ ] Row selection (single/multiple)
    - **Playwright:** Click checkboxes: `input[type="checkbox"][data-row-id]`
  - [ ] Bulk operations (delete, publish, archive)
    - **Playwright:** Select multiple rows then click bulk action: `[data-testid="bulk-actions-dropdown"]`
  - [ ] Action dropdown menu
    - **Playwright:** Click action button: `[data-testid="question-actions-${questionId}"]`

#### 🎬 Playwright Test Script: Search & Filter System
```javascript
// Test basic search
await browser_type_Playwright({
  element: "Search input",
  ref: "input[placeholder='Tìm kiếm câu hỏi...']",
  text: "mathematics"
});
await browser_press_key_Playwright({ key: "Enter" });
await browser_take_screenshot_Playwright({ filename: "search-results.png" });

// Test filters
await browser_click_Playwright({ element: "Type filter", ref: "[data-testid='filter-type']" });
await browser_select_option_Playwright({
  element: "Type dropdown",
  ref: "select[data-testid='filter-type']",
  values: ["MC"]
});
await browser_take_screenshot_Playwright({ filename: "filtered-by-type.png" });
```

- [ ] **Search & Filter System**
  - [ ] Basic search functionality
    - **Playwright:** Type in search: `input[placeholder="Tìm kiếm câu hỏi..."]`
  - [ ] Advanced filters (type, status, difficulty)
    - **Playwright:** Use filter dropdowns: `[data-testid="filter-type"]`, `[data-testid="filter-status"]`
  - [ ] Filter combinations
    - **Playwright:** Apply multiple filters and verify results
  - [ ] Clear filters
    - **Playwright:** Click clear button: `[data-testid="clear-filters"]`
  - [ ] Filter persistence
    - **Playwright:** Refresh page and verify filters remain

### 1.2 UI/UX Testing (2 giờ)

#### 🎬 Playwright Test Script: Visual Design
```javascript
// Take screenshots for visual comparison
await browser_take_screenshot_Playwright({ filename: "questions-list-visual-check.png", fullPage: true });

// Check specific UI elements
await browser_snapshot_Playwright();

// Hover over elements to test states
await browser_hover_Playwright({ element: "First question row", ref: "tbody tr:first-child" });
await browser_take_screenshot_Playwright({ filename: "row-hover-state.png" });
```

- [ ] **Visual Design**
  - [ ] Layout consistency
    - **Playwright:** Take full page screenshot and compare with design mockups
  - [ ] Color scheme adherence
    - **Playwright:** Verify CSS variables: `getComputedStyle()` for color values
  - [ ] Typography hierarchy
    - **Playwright:** Check font sizes and weights in snapshot
  - [ ] Icon alignment
    - **Playwright:** Verify icon positions in table headers and buttons
  - [ ] Badge styling
    - **Playwright:** Check status badges: `[data-testid="status-badge"]`

#### 🎬 Playwright Test Script: Interactive Elements
```javascript
// Test button hover states
await browser_hover_Playwright({ element: "Create button", ref: "[data-testid='create-question-btn']" });
await browser_take_screenshot_Playwright({ filename: "button-hover.png" });

// Test dropdown animations
await browser_click_Playwright({ element: "Filter dropdown", ref: "[data-testid='filter-dropdown']" });
await browser_take_screenshot_Playwright({ filename: "dropdown-open.png" });
```

- [ ] **Interactive Elements**
  - [ ] Button hover states
    - **Playwright:** Hover over buttons and verify visual feedback
  - [ ] Table row hover
    - **Playwright:** Hover over table rows: `tbody tr`
  - [ ] Dropdown animations
    - **Playwright:** Open/close dropdowns and verify smooth transitions
  - [ ] Modal transitions
    - **Playwright:** Open modals and check animation timing
  - [ ] Loading spinners
    - **Playwright:** Trigger loading states and verify spinner appearance

### 1.3 Responsive Testing (2 giờ)

#### 🎬 Playwright Test Script: Mobile Testing
```javascript
// Resize to mobile
await browser_resize_Playwright({ width: 375, height: 667 });
await browser_take_screenshot_Playwright({ filename: "mobile-questions-list.png" });

// Test mobile navigation
await browser_click_Playwright({ element: "Mobile menu toggle", ref: "[data-testid='mobile-menu-toggle']" });
await browser_take_screenshot_Playwright({ filename: "mobile-menu-open.png" });

// Check touch targets
await browser_snapshot_Playwright();
```

- [ ] **Mobile (320px - 767px)**
  - [ ] Table responsive behavior
    - **Playwright:** Resize to 375px width, verify table scrolls horizontally
  - [ ] Filter panel collapse
    - **Playwright:** Check if filters collapse into mobile menu
  - [ ] Touch targets ≥44px
    - **Playwright:** Verify button sizes in snapshot meet minimum requirements
  - [ ] Horizontal scrolling
    - **Playwright:** Test table scroll behavior on mobile

#### 🎬 Playwright Test Script: Tablet Testing
```javascript
// Resize to tablet
await browser_resize_Playwright({ width: 768, height: 1024 });
await browser_take_screenshot_Playwright({ filename: "tablet-questions-list.png" });

// Test tablet-specific interactions
await browser_click_Playwright({ element: "Filter sidebar toggle", ref: "[data-testid='filter-sidebar-toggle']" });
```

- [ ] **Tablet (768px - 1023px)**
  - [ ] Grid layout adaptation
    - **Playwright:** Verify layout adjusts properly at tablet breakpoint
  - [ ] Filter sidebar behavior
    - **Playwright:** Test sidebar collapse/expand functionality
  - [ ] Touch interactions
    - **Playwright:** Test touch-friendly interactions

#### 🎬 Playwright Test Script: Desktop Testing
```javascript
// Resize to desktop
await browser_resize_Playwright({ width: 1920, height: 1080 });
await browser_take_screenshot_Playwright({ filename: "desktop-questions-list.png" });

// Test keyboard navigation
await browser_press_key_Playwright({ key: "Tab" });
await browser_press_key_Playwright({ key: "Tab" });
await browser_take_screenshot_Playwright({ filename: "keyboard-focus.png" });
```

- [ ] **Desktop (1024px+)**
  - [ ] Full layout display
    - **Playwright:** Verify all elements visible and properly spaced
  - [ ] Hover interactions
    - **Playwright:** Test hover states on all interactive elements
  - [ ] Keyboard navigation
    - **Playwright:** Use Tab key to navigate through all focusable elements

## 2. Trang Tạo Câu Hỏi (`/questions/create`)

### 2.1 Form Functionality (3 giờ)

#### 🎬 Playwright Test Script: Navigate to Create Page
```javascript
// Navigate to create question page
await browser_navigate_Playwright({ url: "http://localhost:3000/3141592654/admin/questions/create" });
await browser_take_screenshot_Playwright({ filename: "create-question-page.png" });
await browser_snapshot_Playwright();
```

#### 🎬 Playwright Test Script: Basic Form Fields
```javascript
// Test content input with LaTeX
await browser_type_Playwright({
  element: "Question content textarea",
  ref: "textarea[data-testid='question-content']",
  text: "What is the solution to $x^2 + 2x + 1 = 0$?"
});

// Test question type selection
await browser_click_Playwright({ element: "Question type dropdown", ref: "[data-testid='question-type-select']" });
await browser_select_option_Playwright({
  element: "Question type",
  ref: "select[data-testid='question-type-select']",
  values: ["MC"]
});

// Test difficulty selection
await browser_click_Playwright({ element: "Difficulty dropdown", ref: "[data-testid='difficulty-select']" });
await browser_select_option_Playwright({
  element: "Difficulty",
  ref: "select[data-testid='difficulty-select']",
  values: ["MEDIUM"]
});

await browser_take_screenshot_Playwright({ filename: "form-basic-fields-filled.png" });
```

- [ ] **Basic Form Fields**
  - [ ] Content input (LaTeX support)
    - **Playwright:** Type LaTeX content: `textarea[data-testid="question-content"]`
  - [ ] Question type selection
    - **Playwright:** Select from dropdown: `select[data-testid="question-type-select"]`
  - [ ] Difficulty selection
    - **Playwright:** Select difficulty: `select[data-testid="difficulty-select"]`
  - [ ] Category input
    - **Playwright:** Type category: `input[data-testid="category-input"]`
  - [ ] Tags management
    - **Playwright:** Add/remove tags: `[data-testid="tags-input"]`
  - [ ] Points & time limit
    - **Playwright:** Set values: `input[data-testid="points"]`, `input[data-testid="time-limit"]`

#### 🎬 Playwright Test Script: Answer Management
```javascript
// Test multiple choice answers
await browser_click_Playwright({ element: "Add answer button", ref: "[data-testid='add-answer-btn']" });
await browser_type_Playwright({
  element: "Answer 1 input",
  ref: "input[data-testid='answer-0-content']",
  text: "x = -1 (double root)"
});
await browser_click_Playwright({ element: "Answer 1 correct checkbox", ref: "input[data-testid='answer-0-correct']" });

await browser_click_Playwright({ element: "Add answer button", ref: "[data-testid='add-answer-btn']" });
await browser_type_Playwright({
  element: "Answer 2 input",
  ref: "input[data-testid='answer-1-content']",
  text: "x = 1"
});

await browser_take_screenshot_Playwright({ filename: "answers-added.png" });
```

- [ ] **Answer Management**
  - [ ] Multiple choice answers
    - **Playwright:** Add answers: `[data-testid="add-answer-btn"]`, fill: `input[data-testid="answer-{index}-content"]`
  - [ ] True/False options
    - **Playwright:** Select T/F type and verify options appear
  - [ ] Short answer format
    - **Playwright:** Test short answer input field
  - [ ] Essay questions
    - **Playwright:** Verify essay format options
  - [ ] Matching pairs
    - **Playwright:** Add matching pairs: `[data-testid="add-matching-pair"]`

#### 🎬 Playwright Test Script: Form Validation
```javascript
// Test required field validation
await browser_click_Playwright({ element: "Save button", ref: "[data-testid='save-question-btn']" });
await browser_take_screenshot_Playwright({ filename: "validation-errors.png" });

// Test content length limits
await browser_type_Playwright({
  element: "Question content",
  ref: "textarea[data-testid='question-content']",
  text: "A".repeat(5001) // Exceed limit
});
await browser_take_screenshot_Playwright({ filename: "content-length-error.png" });
```

- [ ] **Form Validation**
  - [ ] Required field validation
    - **Playwright:** Submit empty form and verify error messages
  - [ ] Content length limits
    - **Playwright:** Test maximum character limits
  - [ ] Answer validation rules
    - **Playwright:** Test MC questions need at least one correct answer
  - [ ] Real-time validation feedback
    - **Playwright:** Verify validation messages appear as user types
  - [ ] Error message display
    - **Playwright:** Check error styling and positioning

### 2.2 Advanced Features (2 giờ)

#### 🎬 Playwright Test Script: LaTeX Integration
```javascript
// Test LaTeX preview
await browser_type_Playwright({
  element: "Question content",
  ref: "textarea[data-testid='question-content']",
  text: "Solve: $\\int_{0}^{\\pi} \\sin(x) dx$"
});
await browser_click_Playwright({ element: "Preview tab", ref: "[data-testid='preview-tab']" });
await browser_take_screenshot_Playwright({ filename: "latex-preview.png" });

// Test TikZ diagram
await browser_type_Playwright({
  element: "Question content",
  ref: "textarea[data-testid='question-content']",
  text: "\\begin{tikzpicture}\\draw (0,0) -- (1,1);\\end{tikzpicture}"
});
await browser_click_Playwright({ element: "Preview tab", ref: "[data-testid='preview-tab']" });
await browser_take_screenshot_Playwright({ filename: "tikz-preview.png" });

// Test invalid LaTeX error handling
await browser_type_Playwright({
  element: "Question content",
  ref: "textarea[data-testid='question-content']",
  text: "$\\invalid{latex}$"
});
await browser_click_Playwright({ element: "Preview tab", ref: "[data-testid='preview-tab']" });
await browser_take_screenshot_Playwright({ filename: "latex-error.png" });
```

- [ ] **LaTeX Integration**
  - [ ] LaTeX preview
    - **Playwright:** Switch to preview tab: `[data-testid="preview-tab"]`
  - [ ] Math formula rendering
    - **Playwright:** Verify math formulas render correctly in preview
  - [ ] TikZ diagram support
    - **Playwright:** Test TikZ diagrams in preview mode
  - [ ] Error handling for invalid LaTeX
    - **Playwright:** Input invalid LaTeX and verify error display

#### 🎬 Playwright Test Script: Preview Functionality
```javascript
// Test different preview modes
await browser_click_Playwright({ element: "Student view button", ref: "[data-testid='preview-student-view']" });
await browser_take_screenshot_Playwright({ filename: "student-preview.png" });

await browser_click_Playwright({ element: "Teacher view button", ref: "[data-testid='preview-teacher-view']" });
await browser_take_screenshot_Playwright({ filename: "teacher-preview.png" });

await browser_click_Playwright({ element: "Print preview button", ref: "[data-testid='preview-print']" });
await browser_take_screenshot_Playwright({ filename: "print-preview.png" });

// Test mobile preview
await browser_resize_Playwright({ width: 375, height: 667 });
await browser_click_Playwright({ element: "Mobile preview button", ref: "[data-testid='preview-mobile']" });
await browser_take_screenshot_Playwright({ filename: "mobile-preview.png" });
```

- [ ] **Preview Functionality**
  - [ ] Student view preview
    - **Playwright:** Click student view: `[data-testid="preview-student-view"]`
  - [ ] Teacher view preview
    - **Playwright:** Click teacher view: `[data-testid="preview-teacher-view"]`
  - [ ] Print preview
    - **Playwright:** Click print preview: `[data-testid="preview-print"]`
  - [ ] Mobile preview
    - **Playwright:** Resize to mobile and test preview

#### 🎬 Playwright Test Script: Draft Management
```javascript
// Test auto-save functionality
await browser_type_Playwright({
  element: "Question content",
  ref: "textarea[data-testid='question-content']",
  text: "Auto-save test content"
});
// Wait for auto-save indicator
await browser_wait_for_Playwright({ text: "Đã lưu tự động", time: 5 });
await browser_take_screenshot_Playwright({ filename: "auto-save-indicator.png" });

// Test unsaved changes warning
await browser_type_Playwright({
  element: "Question content",
  ref: "textarea[data-testid='question-content']",
  text: "Unsaved changes test"
});
await browser_navigate_Playwright({ url: "http://localhost:3000/3141592654/admin/questions" });
// Should trigger unsaved changes dialog
await browser_take_screenshot_Playwright({ filename: "unsaved-changes-warning.png" });
```

- [ ] **Draft Management**
  - [ ] Auto-save functionality
    - **Playwright:** Type content and wait for auto-save indicator
  - [ ] Draft restoration
    - **Playwright:** Refresh page and verify draft content restored
  - [ ] Unsaved changes warning
    - **Playwright:** Navigate away with unsaved changes and verify warning dialog

## 3. Trang Chỉnh Sửa (`/questions/[id]/edit`)

### 3.1 Edit Operations (2 giờ)
- [ ] **Data Loading**
  - [ ] Question data population
  - [ ] Form field pre-filling
  - [ ] Answer options loading
  - [ ] Metadata display

- [ ] **Update Operations**
  - [ ] Save changes
  - [ ] Validation on update
  - [ ] Optimistic updates
  - [ ] Error handling

- [ ] **Version Control**
  - [ ] Change tracking
  - [ ] Revert functionality
  - [ ] History display

---

## 🟡 HIGH PRIORITY - Tính Năng Quan Trọng

### ⏱️ Ước tính: 12-15 giờ

## 4. Import/Export System (`/questions/inputques`)

### 4.1 Import Functionality (3 giờ)
- [ ] **File Upload**
  - [ ] CSV file support
  - [ ] File validation
  - [ ] Size limits
  - [ ] Format checking

- [ ] **Data Processing**
  - [ ] CSV parsing
  - [ ] Data validation
  - [ ] Error reporting
  - [ ] Progress tracking

- [ ] **Bulk Import**
  - [ ] Multiple questions
  - [ ] Batch processing
  - [ ] Error handling
  - [ ] Success feedback

### 4.2 Export Functionality (2 giờ)
- [ ] **Export Options**
  - [ ] CSV format
  - [ ] PDF format
  - [ ] LaTeX format
  - [ ] Custom templates

- [ ] **Export Filters**
  - [ ] Selected questions
  - [ ] Filtered results
  - [ ] Date ranges
  - [ ] Category selection

## 5. Question Detail Page (`/questions/[id]`)

### 5.1 Public View (2 giờ)
- [ ] **Content Display**
  - [ ] Question content rendering
  - [ ] LaTeX math display
  - [ ] Answer options
  - [ ] Metadata information

- [ ] **Interactive Features**
  - [ ] Answer submission
  - [ ] Solution reveal
  - [ ] Bookmark functionality
  - [ ] Share options

### 5.2 SEO & Performance (1 giờ)
- [ ] **SEO Optimization**
  - [ ] Meta tags
  - [ ] Open Graph tags
  - [ ] Structured data
  - [ ] Canonical URLs

- [ ] **Performance**
  - [ ] Page load speed
  - [ ] LaTeX rendering time
  - [ ] Image optimization

## 6. Browse Questions (`/questions/browse`)

### 6.1 Public Interface (2 giờ)
- [ ] **Grid/List Views**
  - [ ] View mode switching
  - [ ] Card layouts
  - [ ] Virtual scrolling
  - [ ] Infinite scroll

- [ ] **Search & Filter**
  - [ ] Public search
  - [ ] Category filters
  - [ ] Difficulty filters
  - [ ] Sort options

### 6.2 Performance Testing (2 giờ)
- [ ] **Large Dataset Handling**
  - [ ] 1000+ questions
  - [ ] Virtual scrolling performance
  - [ ] Memory usage
  - [ ] Scroll performance

---

## 🟢 MEDIUM PRIORITY - Trải Nghiệm Người Dùng

### ⏱️ Ước tính: 8-10 giờ

## 7. Accessibility Testing (3 giờ)

### 7.1 WCAG 2.1 AA Compliance

#### 🎬 Playwright Test Script: Keyboard Navigation
```javascript
// Test tab order
await browser_navigate_Playwright({ url: "http://localhost:3000/3141592654/admin/questions" });
await browser_press_key_Playwright({ key: "Tab" });
await browser_take_screenshot_Playwright({ filename: "focus-1.png" });
await browser_press_key_Playwright({ key: "Tab" });
await browser_take_screenshot_Playwright({ filename: "focus-2.png" });
await browser_press_key_Playwright({ key: "Tab" });
await browser_take_screenshot_Playwright({ filename: "focus-3.png" });

// Test escape key functionality
await browser_click_Playwright({ element: "Filter dropdown", ref: "[data-testid='filter-dropdown']" });
await browser_press_key_Playwright({ key: "Escape" });
await browser_take_screenshot_Playwright({ filename: "escape-closes-dropdown.png" });

// Test enter key submissions
await browser_type_Playwright({
  element: "Search input",
  ref: "input[placeholder='Tìm kiếm câu hỏi...']",
  text: "test search"
});
await browser_press_key_Playwright({ key: "Enter" });
await browser_take_screenshot_Playwright({ filename: "enter-submits-search.png" });
```

- [ ] **Keyboard Navigation**
  - [ ] Tab order logical
    - **Playwright:** Use Tab key to navigate and verify logical order
  - [ ] All interactive elements accessible
    - **Playwright:** Ensure all buttons, links, inputs are reachable via keyboard
  - [ ] Escape key functionality
    - **Playwright:** Test Escape closes modals and dropdowns
  - [ ] Enter key submissions
    - **Playwright:** Test Enter submits forms and activates buttons

#### 🎬 Playwright Test Script: Screen Reader Support
```javascript
// Check ARIA labels and semantic structure
await browser_evaluate_Playwright({
  function: `() => {
    const results = [];

    // Check for ARIA labels
    const buttons = document.querySelectorAll('button');
    buttons.forEach((btn, index) => {
      if (!btn.getAttribute('aria-label') && !btn.textContent.trim()) {
        results.push(\`Button \${index} missing aria-label\`);
      }
    });

    // Check form labels
    const inputs = document.querySelectorAll('input');
    inputs.forEach((input, index) => {
      const label = document.querySelector(\`label[for="\${input.id}"]\`);
      if (!label && !input.getAttribute('aria-label')) {
        results.push(\`Input \${index} missing label\`);
      }
    });

    return results;
  }`
});
await browser_take_screenshot_Playwright({ filename: "accessibility-check.png" });
```

- [ ] **Screen Reader Support**
  - [ ] ARIA labels present
    - **Playwright:** Check all interactive elements have proper ARIA labels
  - [ ] Semantic HTML structure
    - **Playwright:** Verify proper heading hierarchy (h1, h2, h3)
  - [ ] Alt text for images
    - **Playwright:** Check all images have descriptive alt text
  - [ ] Form labels associated
    - **Playwright:** Verify all form inputs have associated labels

#### 🎬 Playwright Test Script: Visual Accessibility
```javascript
// Test color contrast (requires manual verification of screenshot)
await browser_take_screenshot_Playwright({ filename: "color-contrast-check.png" });

// Test focus indicators
await browser_press_key_Playwright({ key: "Tab" });
await browser_take_screenshot_Playwright({ filename: "focus-indicator-visible.png" });

// Test text scaling
await browser_evaluate_Playwright({
  function: `() => {
    document.body.style.fontSize = '200%';
  }`
});
await browser_take_screenshot_Playwright({ filename: "text-scaled-200.png" });
```

- [ ] **Visual Accessibility**
  - [ ] Color contrast ratios
    - **Playwright:** Take screenshots for manual contrast checking
  - [ ] Focus indicators visible
    - **Playwright:** Tab through elements and verify focus rings
  - [ ] Text scaling (200%)
    - **Playwright:** Scale text and verify layout doesn't break
  - [ ] High contrast mode
    - **Playwright:** Test with high contrast CSS

### 7.2 Assistive Technology

#### 🎬 Playwright Test Script: Keyboard-Only Navigation
```javascript
// Complete keyboard-only workflow
await browser_navigate_Playwright({ url: "http://localhost:3000/3141592654/admin/questions" });

// Navigate to create question using only keyboard
await browser_press_key_Playwright({ key: "Tab" }); // Focus first element
// Continue tabbing until reaching create button
for (let i = 0; i < 10; i++) {
  await browser_press_key_Playwright({ key: "Tab" });
}
await browser_press_key_Playwright({ key: "Enter" }); // Activate create button
await browser_take_screenshot_Playwright({ filename: "keyboard-navigation-create.png" });

// Fill form using only keyboard
await browser_type_Playwright({
  element: "Question content",
  ref: "textarea[data-testid='question-content']",
  text: "Keyboard accessibility test question"
});
await browser_press_key_Playwright({ key: "Tab" }); // Move to next field
await browser_take_screenshot_Playwright({ filename: "keyboard-form-filling.png" });
```

- [ ] **Screen Readers**
  - [ ] NVDA testing
    - **Playwright:** Manual testing with NVDA screen reader
  - [ ] JAWS testing
    - **Playwright:** Manual testing with JAWS screen reader
  - [ ] VoiceOver testing
    - **Playwright:** Manual testing with VoiceOver (macOS)

- [ ] **Keyboard Only**
  - [ ] Complete navigation
    - **Playwright:** Navigate entire application using only keyboard
  - [ ] Form completion
    - **Playwright:** Fill and submit forms without mouse
  - [ ] Modal interactions
    - **Playwright:** Open, interact with, and close modals using keyboard

## 8. Error Handling & Edge Cases (3 giờ)

### 8.1 Network Errors

#### 🎬 Playwright Test Script: Connection Issues
```javascript
// Test offline behavior
await browser_evaluate_Playwright({
  function: `() => {
    // Simulate offline
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false
    });
    window.dispatchEvent(new Event('offline'));
  }`
});
await browser_click_Playwright({ element: "Create question button", ref: "[data-testid='create-question-btn']" });
await browser_take_screenshot_Playwright({ filename: "offline-error.png" });

// Test slow connection simulation
await browser_evaluate_Playwright({
  function: `() => {
    // Simulate slow network
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      return new Promise(resolve => {
        setTimeout(() => resolve(originalFetch.apply(this, args)), 5000);
      });
    };
  }`
});
await browser_click_Playwright({ element: "Load more button", ref: "[data-testid='load-more']" });
await browser_take_screenshot_Playwright({ filename: "slow-loading.png" });
```

- [ ] **Connection Issues**
  - [ ] Offline behavior
    - **Playwright:** Simulate offline mode and test error handling
  - [ ] Slow connections
    - **Playwright:** Throttle network and verify loading states
  - [ ] Timeout handling
    - **Playwright:** Test request timeouts and error messages
  - [ ] Retry mechanisms
    - **Playwright:** Verify retry buttons work after failures

#### 🎬 Playwright Test Script: API Errors
```javascript
// Test 404 error handling
await browser_navigate_Playwright({ url: "http://localhost:3000/3141592654/admin/questions/nonexistent-id/edit" });
await browser_take_screenshot_Playwright({ filename: "404-error-page.png" });

// Test validation errors
await browser_navigate_Playwright({ url: "http://localhost:3000/3141592654/admin/questions/create" });
await browser_click_Playwright({ element: "Save button", ref: "[data-testid='save-question-btn']" });
await browser_take_screenshot_Playwright({ filename: "validation-errors.png" });

// Test server error simulation
await browser_evaluate_Playwright({
  function: `() => {
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      return Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Internal Server Error' })
      });
    };
  }`
});
await browser_click_Playwright({ element: "Save button", ref: "[data-testid='save-question-btn']" });
await browser_take_screenshot_Playwright({ filename: "server-error.png" });
```

- [ ] **API Errors**
  - [ ] 404 responses
    - **Playwright:** Navigate to non-existent question and verify 404 page
  - [ ] 500 server errors
    - **Playwright:** Simulate server errors and test error boundaries
  - [ ] Validation errors
    - **Playwright:** Submit invalid data and verify error messages
  - [ ] Authentication errors
    - **Playwright:** Test expired session handling

### 8.2 Data Edge Cases

#### 🎬 Playwright Test Script: Empty States
```javascript
// Test no questions found
await browser_evaluate_Playwright({
  function: `() => {
    // Mock empty response
    const originalFetch = window.fetch;
    window.fetch = function(url, ...args) {
      if (url.includes('/questions')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ questions: [], total: 0 })
        });
      }
      return originalFetch(url, ...args);
    };
  }`
});
await browser_navigate_Playwright({ url: "http://localhost:3000/3141592654/admin/questions" });
await browser_take_screenshot_Playwright({ filename: "empty-questions-list.png" });

// Test empty search results
await browser_type_Playwright({
  element: "Search input",
  ref: "input[placeholder='Tìm kiếm câu hỏi...']",
  text: "nonexistentquestion12345"
});
await browser_press_key_Playwright({ key: "Enter" });
await browser_take_screenshot_Playwright({ filename: "empty-search-results.png" });
```

- [ ] **Empty States**
  - [ ] No questions found
    - **Playwright:** Mock empty API response and verify empty state UI
  - [ ] Empty search results
    - **Playwright:** Search for non-existent content and verify message
  - [ ] No filters applied
    - **Playwright:** Clear all filters and verify default state
  - [ ] Loading states
    - **Playwright:** Verify loading spinners during data fetching

#### 🎬 Playwright Test Script: Large Data
```javascript
// Test very long content
await browser_navigate_Playwright({ url: "http://localhost:3000/3141592654/admin/questions/create" });
await browser_type_Playwright({
  element: "Question content",
  ref: "textarea[data-testid='question-content']",
  text: "A".repeat(10000) // Very long content
});
await browser_take_screenshot_Playwright({ filename: "long-content-handling.png" });

// Test many answer options
for (let i = 0; i < 10; i++) {
  await browser_click_Playwright({ element: "Add answer button", ref: "[data-testid='add-answer-btn']" });
  await browser_type_Playwright({
    element: `Answer ${i} input`,
    ref: `input[data-testid='answer-${i}-content']`,
    text: `Answer option ${i + 1}`
  });
}
await browser_take_screenshot_Playwright({ filename: "many-answers.png" });

// Test large LaTeX formulas
await browser_type_Playwright({
  element: "Question content",
  ref: "textarea[data-testid='question-content']",
  text: "$\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}$ and $\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$"
});
await browser_click_Playwright({ element: "Preview tab", ref: "[data-testid='preview-tab']" });
await browser_take_screenshot_Playwright({ filename: "large-latex-formulas.png" });
```

- [ ] **Large Data**
  - [ ] Very long content
    - **Playwright:** Input extremely long text and verify handling
  - [ ] Many answer options
    - **Playwright:** Add 10+ answer options and test performance
  - [ ] Large LaTeX formulas
    - **Playwright:** Test complex mathematical expressions
  - [ ] Multiple images
    - **Playwright:** Test questions with multiple embedded images

## 9. Performance Testing (2 giờ)

### 9.1 Load Performance

#### 🎬 Playwright Test Script: Page Load Times
```javascript
// Test initial load performance
const startTime = Date.now();
await browser_navigate_Playwright({ url: "http://localhost:3000/3141592654/admin/questions" });
await browser_wait_for_Playwright({ text: "Danh sách câu hỏi", time: 10 });
const loadTime = Date.now() - startTime;
console.log(`Page load time: ${loadTime}ms`);
await browser_take_screenshot_Playwright({ filename: "page-loaded.png" });

// Test subsequent navigation performance
const navStartTime = Date.now();
await browser_click_Playwright({ element: "Create question button", ref: "[data-testid='create-question-btn']" });
await browser_wait_for_Playwright({ text: "Tạo câu hỏi mới", time: 5 });
const navTime = Date.now() - navStartTime;
console.log(`Navigation time: ${navTime}ms`);

// Test LaTeX rendering performance
await browser_type_Playwright({
  element: "Question content",
  ref: "textarea[data-testid='question-content']",
  text: "$\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}$"
});
const latexStartTime = Date.now();
await browser_click_Playwright({ element: "Preview tab", ref: "[data-testid='preview-tab']" });
await browser_wait_for_Playwright({ time: 3 }); // Wait for LaTeX rendering
const latexTime = Date.now() - latexStartTime;
console.log(`LaTeX rendering time: ${latexTime}ms`);
await browser_take_screenshot_Playwright({ filename: "latex-rendered.png" });
```

- [ ] **Page Load Times**
  - [ ] Initial load <3s
    - **Playwright:** Measure time from navigation to content visible
  - [ ] Subsequent loads <1s
    - **Playwright:** Test navigation between pages
  - [ ] LaTeX rendering <2s
    - **Playwright:** Measure LaTeX preview rendering time
  - [ ] Image loading optimized
    - **Playwright:** Check image loading performance

### 9.2 Runtime Performance

#### 🎬 Playwright Test Script: User Interactions
```javascript
// Test filter response time
const filterStartTime = Date.now();
await browser_click_Playwright({ element: "Type filter", ref: "[data-testid='filter-type']" });
await browser_select_option_Playwright({
  element: "Type dropdown",
  ref: "select[data-testid='filter-type']",
  values: ["MC"]
});
await browser_wait_for_Playwright({ time: 1 }); // Wait for filter to apply
const filterTime = Date.now() - filterStartTime;
console.log(`Filter response time: ${filterTime}ms`);

// Test search response time
const searchStartTime = Date.now();
await browser_type_Playwright({
  element: "Search input",
  ref: "input[placeholder='Tìm kiếm câu hỏi...']",
  text: "mathematics"
});
await browser_press_key_Playwright({ key: "Enter" });
await browser_wait_for_Playwright({ time: 1 }); // Wait for search results
const searchTime = Date.now() - searchStartTime;
console.log(`Search response time: ${searchTime}ms`);

// Test form submission performance
await browser_navigate_Playwright({ url: "http://localhost:3000/3141592654/admin/questions/create" });
await browser_type_Playwright({
  element: "Question content",
  ref: "textarea[data-testid='question-content']",
  text: "Performance test question"
});
const submitStartTime = Date.now();
await browser_click_Playwright({ element: "Save button", ref: "[data-testid='save-question-btn']" });
await browser_wait_for_Playwright({ text: "Thành công", time: 5 });
const submitTime = Date.now() - submitStartTime;
console.log(`Form submission time: ${submitTime}ms`);

// Test modal opening performance
const modalStartTime = Date.now();
await browser_click_Playwright({ element: "Preview button", ref: "[data-testid='preview-btn']" });
await browser_wait_for_Playwright({ text: "Xem trước", time: 2 });
const modalTime = Date.now() - modalStartTime;
console.log(`Modal opening time: ${modalTime}ms`);
await browser_take_screenshot_Playwright({ filename: "modal-opened.png" });
```

- [ ] **User Interactions**
  - [ ] Filter response <500ms
    - **Playwright:** Measure time from filter selection to results update
  - [ ] Search response <300ms
    - **Playwright:** Measure search input to results display
  - [ ] Form submission <1s
    - **Playwright:** Measure form submit to success message
  - [ ] Modal opening <200ms
    - **Playwright:** Measure modal trigger to modal visible

---

## 🔵 LOW PRIORITY - Tối Ưu Hóa

### ⏱️ Ước tính: 5-7 giờ

## 10. Cross-Browser Testing (2 giờ)

### 10.1 Browser Compatibility
- [ ] **Chrome** (Latest)
- [ ] **Firefox** (Latest)
- [ ] **Safari** (Latest)
- [ ] **Edge** (Latest)
- [ ] **Mobile Browsers**

### 10.2 Feature Support
- [ ] **Modern Features**
  - [ ] CSS Grid support
  - [ ] Flexbox layouts
  - [ ] ES6+ features
  - [ ] WebP images

## 11. Security Testing (2 giờ)

### 11.1 Input Security
- [ ] **XSS Prevention**
  - [ ] Script injection
  - [ ] HTML injection
  - [ ] LaTeX injection
  - [ ] File upload security

### 11.2 Authentication
- [ ] **Access Control**
  - [ ] Admin-only features
  - [ ] Role-based access
  - [ ] Session management

## 12. Integration Testing (1 giờ)

### 12.1 Component Integration
- [ ] **Filter + Table**
- [ ] **Form + Validation**
- [ ] **Modal + Form**
- [ ] **Search + Results**

---

## 📊 Báo Cáo & Theo Dõi

### Test Execution Tracking

#### 🎬 Playwright Test Session Template
```javascript
// ===== TEST SESSION SETUP =====
// Date: [YYYY-MM-DD]
// Tester: [Name]
// Browser: [Chrome/Firefox/Safari/Edge]
// Viewport: [Desktop/Tablet/Mobile]

// Start test session
await browser_navigate_Playwright({ url: "http://localhost:3000/3141592654/admin/questions" });
await browser_take_screenshot_Playwright({ filename: "session-start.png" });

// ===== TEST EXECUTION LOG =====
// Test 1: [Test Name]
// Status: [PASS/FAIL/SKIP]
// Notes: [Any observations]
// Screenshots: [List of screenshots taken]

// Test 2: [Test Name]
// Status: [PASS/FAIL/SKIP]
// Notes: [Any observations]
// Screenshots: [List of screenshots taken]

// ===== SESSION SUMMARY =====
// Total Tests: [Number]
// Passed: [Number]
// Failed: [Number]
// Skipped: [Number]
// Issues Found: [Number]
```

#### Progress Tracking Checklist
```markdown
## Progress Tracking

### Critical Priority: ___/15 tasks completed
- [ ] Question List Page: ___/8 tasks
  - [ ] Functional Testing (4h): ___/3 sections
  - [ ] UI/UX Testing (2h): ___/2 sections
  - [ ] Responsive Testing (2h): ___/3 sections
- [ ] Create Question Page: ___/5 tasks
  - [ ] Form Functionality (3h): ___/3 sections
  - [ ] Advanced Features (2h): ___/3 sections
- [ ] Edit Question Page: ___/2 tasks
  - [ ] Edit Operations (2h): ___/3 sections

### High Priority: ___/12 tasks completed
- [ ] Import/Export: ___/5 tasks
- [ ] Detail Page: ___/3 tasks
- [ ] Browse Page: ___/4 tasks

### Medium Priority: ___/8 tasks completed
- [ ] Accessibility: ___/3 tasks
- [ ] Error Handling: ___/3 tasks
- [ ] Performance: ___/2 tasks

### Low Priority: ___/5 tasks completed
- [ ] Cross-Browser: ___/2 tasks
- [ ] Security: ___/2 tasks
- [ ] Integration: ___/1 task

**Overall Progress: ___/40 tasks (____%)**
```

### Bug Tracking Template
```markdown
## Bug Report #XXX

**Priority:** Critical/High/Medium/Low
**Component:** [Component Name]
**Page:** [Page URL]
**Device:** [Desktop/Tablet/Mobile]
**Browser:** [Browser Name & Version]
**Playwright Session:** [Session ID/Timestamp]

**Steps to Reproduce (Playwright Commands):**
1. await browser_navigate_Playwright({ url: "[URL]" });
2. await browser_click_Playwright({ element: "[Element]", ref: "[Selector]" });
3. await browser_type_Playwright({ element: "[Element]", ref: "[Selector]", text: "[Text]" });

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happens]

**Screenshots:**
- Before: [screenshot-before.png]
- After: [screenshot-after.png]
- Error: [screenshot-error.png]

**Playwright Evidence:**
- Console logs: [console-output.txt]
- Network requests: [network-log.txt]
- Page snapshot: [page-snapshot.html]

**Additional Notes:**
[Any other relevant information]
```

### 🎬 Playwright Testing Best Practices

#### Screenshot Naming Convention
```javascript
// Use descriptive, consistent naming
await browser_take_screenshot_Playwright({
  filename: "questions-list-page-loaded.png"
});
await browser_take_screenshot_Playwright({
  filename: "create-question-form-validation-error.png"
});
await browser_take_screenshot_Playwright({
  filename: "mobile-375px-questions-table.png"
});
```

#### Element Selection Strategy
```javascript
// Priority order for element selection:
// 1. data-testid attributes (preferred)
await browser_click_Playwright({
  element: "Create button",
  ref: "[data-testid='create-question-btn']"
});

// 2. Semantic selectors
await browser_click_Playwright({
  element: "Submit button",
  ref: "button[type='submit']"
});

// 3. Text content (when unique)
await browser_click_Playwright({
  element: "Save button",
  ref: "button:has-text('Lưu')"
});

// 4. CSS selectors (last resort)
await browser_click_Playwright({
  element: "First row",
  ref: "tbody tr:first-child"
});
```

#### Error Handling in Tests
```javascript
// Always wrap critical actions in try-catch
try {
  await browser_click_Playwright({
    element: "Save button",
    ref: "[data-testid='save-btn']"
  });
  await browser_take_screenshot_Playwright({
    filename: "save-success.png"
  });
} catch (error) {
  await browser_take_screenshot_Playwright({
    filename: "save-error.png"
  });
  console.log("Save action failed:", error.message);
}
```

#### Performance Measurement
```javascript
// Measure and log performance metrics
const startTime = Date.now();
await browser_navigate_Playwright({ url: "http://localhost:3000/questions" });
await browser_wait_for_Playwright({ text: "Danh sách câu hỏi", time: 10 });
const loadTime = Date.now() - startTime;

// Log performance data
console.log(`Page load time: ${loadTime}ms`);
if (loadTime > 3000) {
  console.warn("Page load time exceeds 3s threshold");
}
```

---

## 🚀 Execution Guidelines

### 🚀 Pre-Testing Setup

#### 1. Environment Preparation
```bash
# Start development server
cd d:\0.111\exam-bank-system\apps\frontend
pnpm dev

# Verify server is running
curl http://localhost:3000/health

# Check admin access
open http://localhost:3000/3141592654/admin/questions
```

- [ ] **Development environment ready**
  - [ ] Frontend server running on localhost:3000
  - [ ] Backend API accessible
  - [ ] Database populated with test data
  - [ ] Admin access working

- [ ] **MCP Playwright Setup**
  - [ ] Playwright browser installed
  - [ ] MCP tools accessible
  - [ ] Screenshot directory created
  - [ ] Test data prepared

#### 2. Playwright Testing Tools
```javascript
// Essential Playwright commands for testing
const PLAYWRIGHT_COMMANDS = {
  navigation: "browser_navigate_Playwright",
  screenshot: "browser_take_screenshot_Playwright",
  snapshot: "browser_snapshot_Playwright",
  click: "browser_click_Playwright",
  type: "browser_type_Playwright",
  resize: "browser_resize_Playwright",
  wait: "browser_wait_for_Playwright",
  evaluate: "browser_evaluate_Playwright"
};

// Responsive breakpoints for testing
const BREAKPOINTS = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1920, height: 1080 }
};
```

- [ ] **Testing Tools Ready**
  - [ ] MCP Playwright browser automation
  - [ ] Screenshot capture capability
  - [ ] Responsive testing setup
  - [ ] Performance monitoring tools

#### 3. Test Data Preparation
```javascript
// Sample test data for questions
const TEST_DATA = {
  basicQuestion: {
    content: "What is 2 + 2?",
    type: "MC",
    answers: ["3", "4", "5", "6"],
    correctAnswer: 1
  },
  latexQuestion: {
    content: "Solve: $\\int_{0}^{\\pi} \\sin(x) dx$",
    type: "SA",
    solution: "2"
  },
  longQuestion: {
    content: "A".repeat(1000),
    type: "ES"
  }
};
```

### 🎯 Testing Best Practices

#### Playwright-Specific Guidelines
- **Always take screenshots** before and after critical actions
- **Use descriptive filenames** for screenshots and logs
- **Verify element existence** before interacting
- **Handle async operations** properly with wait commands
- **Test across different viewport sizes** systematically

#### Test Execution Order
1. **Critical Priority First** - Core functionality must work
2. **Document issues immediately** with Playwright evidence
3. **Take comprehensive screenshots** for visual verification
4. **Test responsive behavior** at each breakpoint
5. **Verify accessibility** with keyboard navigation

#### Success Criteria with Playwright Verification
- **Critical:** 100% pass rate required
  - All Playwright tests must pass
  - No console errors during test execution
  - Screenshots match expected UI states

- **High:** 95% pass rate required
  - Minor visual inconsistencies acceptable
  - Performance within acceptable thresholds

- **Medium:** 90% pass rate acceptable
  - Edge cases may have minor issues
  - Accessibility improvements noted

- **Low:** 85% pass rate acceptable
  - Nice-to-have features may have limitations
  - Browser compatibility issues documented

### 📊 Final Deliverables

#### Test Report Structure
```markdown
# Question System Testing Report

## Executive Summary
- Total tests executed: [Number]
- Pass rate: [Percentage]
- Critical issues: [Number]
- Recommendations: [List]

## Playwright Test Results
- Screenshots captured: [Number]
- Test sessions: [Number]
- Browser coverage: [List]
- Performance metrics: [Data]

## Issues Found
[Detailed list with Playwright evidence]

## Recommendations
[Prioritized improvement suggestions]
```

---

**Tổng thời gian ước tính:** 40-50 giờ
**Khuyến nghị thực hiện:** 2-3 tuần với 2-3 người tester sử dụng MCP Playwright
**Review cuối:** Sau khi hoàn thành tất cả Critical và High priority tasks
**Deliverables:** Comprehensive test report với Playwright screenshots và performance data
