# Comprehensive Question Filters System

## 📋 Tổng quan

Hệ thống lọc câu hỏi toàn diện cho trang admin questions với hai cấp độ lọc: Basic và Advanced, tích hợp đầy đủ với URL params, debounced search, và responsive design.

## 🎯 Tính năng chính

### **1. Bộ lọc cơ bản (Basic Filters)**
- **QuestionCode filters**: Lọc theo mã câu hỏi
  - Lớp (grade): 1-12
  - Môn học (subject): Toán, Lý, Hóa, etc.
  - Chương (chapter): Phụ thuộc môn học
  - Bài (lesson): Phụ thuộc chương
  - Mức độ (level): Dễ, Trung bình, Khó
  - Dạng (format): ID5/ID6
- **Question type**: MC, TF, SA, ES, MA
- **Sub-count**: Lọc theo tên subcount

### **2. Bộ lọc nâng cao (Advanced Filters)**
- **Content search**: Full-text search với debouncing (300ms)
- **Usage count**: Range slider min/max
- **Source**: Lọc theo nguồn câu hỏi
- **Media filters**:
  - Có hình ảnh ✓
  - Có lời giải ✓
  - Có đáp án ✓
- **Tags**: Multi-select với autocomplete
- **Status**: ACTIVE, PENDING, INACTIVE, ARCHIVED
- **Creator**: Lọc theo người tạo
- **Feedback**: Có/không có feedback

## 🏗️ Kiến trúc

### **Components Structure**
```
apps/frontend/src/components/admin/questions/filters/
├── comprehensive-question-filters.tsx    # Main component
├── question-code-filters.tsx             # QuestionCode filters
├── question-metadata-filters.tsx         # Type, status, difficulty
├── question-content-filters.tsx          # Content, media filters
├── question-usage-filters.tsx            # Usage, feedback filters
├── question-search-filters.tsx           # Search với debouncing
├── filter-presets.tsx                    # Preset filters
├── filter-chips.tsx                      # Active filter chips
├── smart-filter-interactions.tsx         # Smart interactions
├── filter-validation-ui.tsx              # Validation feedback
├── filter-help-system.tsx                # Help system
└── index.ts                              # Exports
```

### **State Management**
```typescript
// Zustand store
apps/frontend/src/lib/stores/question-filters.ts

// URL sync hook
apps/frontend/src/hooks/use-question-filters-url.ts

// Types
apps/frontend/src/lib/types/question.ts (QuestionFilters interface)
```

## 🚀 Cách sử dụng

### **1. Tích hợp vào trang**
```typescript
import { ComprehensiveQuestionFilters } from '@/components/admin/questions/filters/comprehensive-question-filters';
import { useQuestionFiltersUrl } from '@/hooks/use-question-filters-url';

export default function AdminQuestionsPage() {
  const { filters } = useQuestionFiltersUrl();

  const handleFiltersChange = (newFilters: QuestionFilters) => {
    // Filters are managed by store automatically
  };

  return (
    <ComprehensiveQuestionFilters
      onFiltersChange={handleFiltersChange}
      resultCount={totalQuestions}
      isLoading={isLoading}
    />
  );
}
```

### **2. Sử dụng store trực tiếp**
```typescript
import { useQuestionFiltersStore } from '@/lib/stores/question-filters';

const {
  filters,
  setFilters,
  resetFilters,
  isAdvancedMode,
  toggleAdvancedMode
} = useQuestionFiltersStore();
```

## 🎨 UI/UX Features

### **Progressive Disclosure**
- Basic filters luôn hiển thị
- Advanced filters collapsible
- Auto-expand khi có active filters

### **Smart Interactions**
- Dependent dropdowns (subject → chapter → lesson)
- Filter validation và suggestions
- Real-time result count

### **Responsive Design**
- Mobile-first approach
- Collapsible sections trên mobile
- Touch-friendly controls

## ⚡ Performance

### **Optimizations**
- Debounced search (300ms delay)
- Memoized filter computations
- Lazy loading cho dropdown options
- Client-side caching

### **URL State Management**
- Sync filters với URL params
- Browser back/forward support
- Shareable filter URLs

## 🧪 Testing

### **Demo Page**
```
http://localhost:3000/3141592654/admin/questions/filters-demo
```

### **Test Cases**
- [ ] Basic filters hoạt động
- [ ] Advanced filters hoạt động
- [ ] Filter combination
- [ ] URL params sync
- [ ] Debounced search
- [ ] Mobile responsive
- [ ] Reset functionality
- [ ] Performance với large datasets

## 📱 Mobile Support

### **Responsive Breakpoints**
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### **Mobile Optimizations**
- Collapsible filter sections
- Touch-friendly controls
- Optimized spacing
- Swipe gestures

## 🔧 Configuration

### **Filter Options**
```typescript
// Customize trong store
const defaultFilters: QuestionFilters = {
  // Default values
};

// Preset configurations
const filterPresets: FilterPreset[] = [
  {
    id: 'recent',
    name: 'Câu hỏi gần đây',
    filters: { sortBy: 'createdAt', sortDir: 'desc' }
  }
];
```

## 🐛 Troubleshooting

### **Common Issues**
1. **Filters không sync với URL**: Kiểm tra useQuestionFiltersUrl hook
2. **Search không debounce**: Kiểm tra useDebounce implementation
3. **Mobile layout broken**: Kiểm tra responsive classes

### **Debug Tools**
- Filter demo page với raw filter object
- Console logs trong development mode
- Performance metrics tracking

## 📈 Future Enhancements

### **Planned Features**
- [ ] Filter analytics
- [ ] Custom filter presets
- [ ] Export filter configurations
- [ ] Advanced search operators
- [ ] Filter history
- [ ] Collaborative filtering

## 🔗 Related Documentation

- [Question Types](./question-types.md)
- [Admin Navigation](./admin-navigation.md)
- [Performance Guidelines](./performance.md)
- [Testing Strategy](./testing.md)

---

**Version**: 1.0.0  
**Last Updated**: 2025-01-16  
**Author**: NyNus Team
