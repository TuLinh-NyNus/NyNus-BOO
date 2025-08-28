# Comprehensive Question Filters System

## Tổng quan

Hệ thống lọc câu hỏi toàn diện với giao diện đơn giản, dễ sử dụng và layout rõ ràng. Được thiết kế theo yêu cầu cụ thể với 2 phần chính:

1. **Hàng CƠ BẢN** (luôn hiển thị): 9 elements trong 1 hàng ngang
2. **Section NÂNG CAO** (có thể thu gọn): Các filters chi tiết với animation

## Cấu trúc Components

```
comprehensive-question-filters-new.tsx     # Main component
├── basic-filters-row.tsx                  # Hàng cơ bản
├── advanced-filters-section.tsx           # Section nâng cao
└── hooks/
    ├── use-question-filters-url.ts        # URL sync
    └── use-debounce.ts                     # Debouncing
```

## Hàng CƠ BẢN (Basic Filters Row)

### Layout: 9 Elements trong 1 hàng ngang

1. **Subcount**: Input tìm kiếm subcount (VD: TL.100022)
2. **Lớp (Grade)**: Dropdown 0-9 (Lớp 10-12, 3-9)
3. **Môn học (Subject)**: Dropdown P,L,H,T,S,V
4. **Chương (Chapter)**: Dropdown 1-9
5. **Bài (Lesson)**: Dropdown 1-9
6. **Mức độ (Level)**: Dropdown N,H,V,C,T,M
7. **Dạng (Format)**: Dropdown ID5/ID6
8. **Loại câu hỏi (Type)**: Dropdown MC,TF,SA,ES,MA
9. **Toggle Button**: Mở/đóng section nâng cao

### Responsive Behavior

- **Desktop**: Tất cả 9 elements trên 1 hàng
- **Tablet**: Wrap thành 2-3 hàng
- **Mobile**: Wrap thành nhiều hàng theo cần thiết

## Section NÂNG CAO (Advanced Filters)

### Nội dung khi mở

- **Content Search**: Input với debouncing 300ms
- **Usage Count**: Range slider 0-100+
- **Source**: Dropdown nguồn câu hỏi
- **Media Filters**: 3 checkbox (Có hình ảnh, Có lời giải, Có đáp án)
- **Tags**: Multi-select với popular tags
- **Status**: Dropdown ACTIVE/PENDING/INACTIVE/ARCHIVED
- **Creator**: Dropdown người tạo
- **Reset Button**: Xóa tất cả bộ lọc nâng cao

### Animation

- **Smooth expand/collapse** với framer-motion
- **Duration**: 0.3s với easeInOut
- **Height**: auto với overflow hidden

## URL Synchronization

### Supported Parameters

```typescript
// Basic filters
?subcount=TL.100022
&grade=0,1,2
&subject=P,L
&chapter=1,2,3
&lesson=1,2
&level=N,H,V
&format=ID5,ID6
&type=MC,TF

// Advanced filters
&keyword=đạo+hàm
&usageMin=10
&usageMax=50
&source=SGK,SBT
&hasImages=true
&hasSolution=true
&hasAnswers=true
&tags=đạo+hàm,tích+phân
&status=ACTIVE,PENDING
&creator=ADMIN

// Pagination & Sort
&page=2
&pageSize=20
&sortBy=usageCount
&sortDir=desc
```

### Browser Navigation Support

- **Back/Forward buttons**: Hoạt động chính xác
- **Refresh page**: Maintain filter state
- **Direct URL access**: Parse và apply filters

## Usage Examples

### Basic Usage

```tsx
import { ComprehensiveQuestionFiltersNew } from '@/components/admin/questions/filters';

function QuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFiltersChange = async (filters: QuestionFilters) => {
    setIsLoading(true);
    try {
      const response = await MockQuestionsService.listQuestions({
        page: filters.page || 1,
        pageSize: filters.pageSize || 20,
        ...filters
      });
      setQuestions(response.data);
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <ComprehensiveQuestionFiltersNew
        onFiltersChange={handleFiltersChange}
        isLoading={isLoading}
        defaultFilters={{
          page: 1,
          pageSize: 20,
          status: ['ACTIVE']
        }}
      />
      
      {/* Questions list */}
      <QuestionsList questions={questions} isLoading={isLoading} />
    </div>
  );
}
```

### Advanced Usage với Custom Defaults

```tsx
function CustomQuestionsPage() {
  const defaultFilters = {
    grade: ['0', '1', '2'], // Chỉ lớp 10-12
    subject: ['P'],         // Chỉ môn Toán
    status: ['ACTIVE'],     // Chỉ câu hỏi active
    pageSize: 50           // 50 items per page
  };

  return (
    <ComprehensiveQuestionFiltersNew
      onFiltersChange={handleFiltersChange}
      defaultFilters={defaultFilters}
      isLoading={isLoading}
    />
  );
}
```

## Performance Features

### Debouncing

- **Content search**: 300ms delay
- **URL updates**: 300ms delay
- **API calls**: Triggered after debounce

### Memoization

- **Filter computations**: React.useMemo
- **Callback functions**: React.useCallback
- **Component re-renders**: Optimized với proper dependencies

### Lazy Loading

- **Dropdown options**: Load on demand (future enhancement)
- **Popular tags**: Cache và reuse

## Testing Checklist

### ✅ Acceptance Criteria

- [ ] Hàng cơ bản hiển thị đúng 9 elements
- [ ] Section nâng cao mở/đóng smooth
- [ ] Tất cả filters combine được (AND logic)
- [ ] URL params reflect và restore correctly
- [ ] Responsive design hoạt động
- [ ] Performance tốt với >1000 questions
- [ ] Reset functionality hoạt động
- [ ] Loading states hiển thị đúng
- [ ] Dependent dropdowns hoạt động (future)

### Manual Testing Scenarios

1. **Basic Filters**:
   - Chọn từng dropdown và verify kết quả
   - Test subcount search với các format khác nhau
   - Verify responsive behavior trên mobile

2. **Advanced Filters**:
   - Test content search với debouncing
   - Adjust usage count slider
   - Toggle media filters
   - Select/deselect tags

3. **URL Sync**:
   - Apply filters và check URL
   - Refresh page và verify state
   - Use browser back/forward buttons
   - Share URL và verify filters load

4. **Performance**:
   - Test với large dataset (>1000 questions)
   - Verify smooth animations
   - Check memory usage

## Troubleshooting

### Common Issues

1. **Filters not syncing to URL**:
   - Check useQuestionFiltersUrl hook
   - Verify debounce timing
   - Check router.replace calls

2. **Animation not smooth**:
   - Verify framer-motion installation
   - Check CSS overflow settings
   - Adjust animation duration

3. **Responsive layout broken**:
   - Check grid classes
   - Verify breakpoint settings
   - Test on actual devices

### Debug Tools

```tsx
// Add to component for debugging
console.log('Current filters:', filters);
console.log('URL params:', new URLSearchParams(window.location.search).toString());
console.log('Clean filters:', getCleanFilters());
```

## Future Enhancements

1. **Dependent Dropdowns**: Chapter depends on Subject
2. **Filter Presets**: Save/load common filter combinations
3. **Advanced Search**: Boolean operators, field-specific search
4. **Export Filters**: Save filter state to file
5. **Filter History**: Recent filter combinations
