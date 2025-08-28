# 📚 Hệ thống Lý Thuyết NyNus - Content Structure

## 📋 Cấu trúc Thư mục

### 🎯 Môn học được hỗ trợ (8 môn)
```
content/theory/
├── TOÁN/          # Toán học
├── LÝ/            # Vật lý  
├── HÓA/           # Hóa học
├── SINH/          # Sinh học
├── VĂN/           # Ngữ văn
├── ANH/           # Tiếng Anh
├── SỬ/            # Lịch sử
└── ĐỊA/           # Địa lý
```

### 📚 Cấp độ lớp học
- **Lớp 3-12**: Tất cả môn học đều hỗ trợ từ lớp 3 đến lớp 12
- **Cấu trúc**: `{MÔN_HỌC}/LỚP-{SỐ_LỚP}/CHƯƠNG-{SỐ_CHƯƠNG}/bài-{tên-bài}.md`

### 📝 Format nội dung
- **File format**: Markdown (.md) với LaTeX content
- **Metadata**: Frontmatter YAML cho thông tin bài học
- **LaTeX**: Hỗ trợ đầy đủ KaTeX và TikZ diagrams
- **Images**: Responsive images trong public/theory-images/

## 🏗️ Cấu trúc chi tiết

### Ví dụ cấu trúc môn Toán:
```
TOÁN/
├── LỚP-3/
│   ├── CHƯƠNG-1/
│   │   ├── bài-1-số-tự-nhiên.md
│   │   └── bài-2-phép-cộng.md
│   └── CHƯƠNG-2/
├── LỚP-4/
├── ...
└── LỚP-12/
```

### Template file nội dung:
```markdown
---
title: "Tên bài học"
subject: "TOÁN"
grade: 10
chapter: 1
lesson: 1
description: "Mô tả ngắn gọn"
keywords: ["từ khóa 1", "từ khóa 2"]
difficulty: "medium"
estimatedTime: "45 phút"
---

# Tên bài học

## Mục tiêu học tập
- Mục tiêu 1
- Mục tiêu 2

## Nội dung chính

### 1. Khái niệm cơ bản
LaTeX content here...

### 2. Ví dụ minh họa
TikZ diagrams here...

### 3. Bài tập thực hành
Practice problems...
```

## 🚀 Build System

### Pre-rendered Output:
```
apps/frontend/public/
├── theory-built/          # Pre-rendered HTML content
│   ├── TOÁN/LỚP-10/CHƯƠNG-1/bài-1.html
│   └── ...
├── theory-images/         # Responsive images
│   ├── tikz-diagrams/
│   └── illustrations/
└── theory-search-index.json  # Pre-built search index
```

### Build Process:
1. **Scan**: Tìm tất cả .md files trong content/theory/
2. **Parse**: Xử lý Markdown + LaTeX content
3. **Render**: Pre-render HTML với mobile optimization
4. **Index**: Tạo search index và navigation tree
5. **Deploy**: Copy vào public/ cho instant loading

## 📱 Mobile-First Optimization

- **Responsive LaTeX**: Auto-scaling formulas
- **Touch Navigation**: Swipe gestures, large touch targets
- **Performance**: <100ms page load với pre-rendered content
- **Progressive Loading**: Lazy load images và complex diagrams

## 🔍 Search Features

- **Instant Search**: Client-side search trong pre-built index
- **LaTeX Formula Search**: Tìm kiếm công thức toán học
- **Subject/Grade Filters**: Lọc theo môn học và lớp
- **Auto-complete**: Gợi ý tìm kiếm thông minh

---

**Status**: ✅ Content structure created - Ready for Phase 1.2
**Next**: Build system implementation
