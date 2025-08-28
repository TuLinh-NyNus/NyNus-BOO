# PublicQuestionFiltersStore Documentation

## Overview

PublicQuestionFiltersStore là Zustand store được thiết kế để quản lý state cho public question filtering system. Store này cung cấp comprehensive state management với persistence, performance optimization, và seamless integration với React components.

## Features

### ✅ Core Features
- **Zustand Integration**: Modern state management với minimal boilerplate
- **Persistence**: localStorage integration với automatic serialization/deserialization
- **DevTools**: Redux DevTools integration cho debugging
- **TypeScript**: Full type safety với comprehensive interfaces
- **Performance**: Optimized selectors để minimize re-renders
- **Filter Management**: Comprehensive filter operations với validation
- **Search Integration**: Advanced search state management với history
- **Navigation Persistence**: Filters persist across page navigation và browser refresh

### ✅ State Structure
```typescript
interface PublicQuestionFiltersState {
  // Filter state
  filters: PublicQuestionFilters;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Search state
  searchQuery: string;
  searchHistory: string[];
  searchSuggestions: string[];
  
  // Results state
  resultCount: number;
  hasResults: boolean;
  
  // Actions
  setFilters: (filters: Partial<PublicQuestionFilters>) => void;
  updateFilter: <K extends keyof PublicQuestionFilters>(key: K, value: PublicQuestionFilters[K]) => void;
  resetFilters: () => void;
  // ... more actions
}
```

## Usage Examples

### Basic Usage

```typescript
import { usePublicQuestionFiltersStore, publicQuestionFiltersSelectors } from '@/lib/stores/public';

function QuestionFilterComponent() {
  // Get specific state slices với selectors
  const filters = usePublicQuestionFiltersStore(publicQuestionFiltersSelectors.filters);
  const searchQuery = usePublicQuestionFiltersStore(publicQuestionFiltersSelectors.searchQuery);
  const isLoading = usePublicQuestionFiltersStore(publicQuestionFiltersSelectors.isLoading);
  
  // Get actions
  const setFilters = usePublicQuestionFiltersStore(state => state.setFilters);
  const updateFilter = usePublicQuestionFiltersStore(state => state.updateFilter);
  const resetFilters = usePublicQuestionFiltersStore(state => state.resetFilters);
  
  return (
    <div>
      <input 
        value={searchQuery}
        onChange={(e) => updateFilter('keyword', e.target.value)}
      />
      <button onClick={resetFilters}>Reset</button>
    </div>
  );
}
```

### Advanced Filter Operations

```typescript
function AdvancedFilterComponent() {
  const store = usePublicQuestionFiltersStore();
  
  // Toggle difficulty filter
  const handleDifficultyToggle = (difficulty: QuestionDifficulty) => {
    store.toggleDifficulty(difficulty);
  };
  
  // Set multiple filters at once
  const handlePresetFilter = () => {
    store.setFilters({
      category: ['Đại số'],
      difficulty: [QuestionDifficulty.MEDIUM],
      sortBy: PublicQuestionSortBy.RATING,
      sortDir: 'desc'
    });
  };
  
  // Clear specific filter
  const handleClearCategory = () => {
    store.clearFilter('category');
  };
  
  return (
    <div>
      {/* Filter UI */}
    </div>
  );
}
```

### Search Integration

```typescript
function SearchComponent() {
  const searchQuery = usePublicQuestionFiltersStore(publicQuestionFiltersSelectors.searchQuery);
  const searchHistory = usePublicQuestionFiltersStore(publicQuestionFiltersSelectors.searchHistory);
  const searchSuggestions = usePublicQuestionFiltersStore(publicQuestionFiltersSelectors.searchSuggestions);
  
  const setSearchQuery = usePublicQuestionFiltersStore(state => state.setSearchQuery);
  const addToSearchHistory = usePublicQuestionFiltersStore(state => state.addToSearchHistory);
  const clearSearchHistory = usePublicQuestionFiltersStore(state => state.clearSearchHistory);
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    addToSearchHistory(query);
  };
  
  return (
    <div>
      <input 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
      />
      
      {/* Search History */}
      <div>
        {searchHistory.map((query, index) => (
          <button key={index} onClick={() => handleSearch(query)}>
            {query}
          </button>
        ))}
        <button onClick={clearSearchHistory}>Clear History</button>
      </div>
      
      {/* Search Suggestions */}
      <div>
        {searchSuggestions.map((suggestion, index) => (
          <button key={index} onClick={() => handleSearch(suggestion)}>
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
```

### Integration với React Query

```typescript
import { usePublicQuestions } from '@/hooks/public';

function QuestionListComponent() {
  // Get filters từ store
  const filters = usePublicQuestionFiltersStore(publicQuestionFiltersSelectors.filters);
  const setResultCount = usePublicQuestionFiltersStore(state => state.setResultCount);
  const setLoading = usePublicQuestionFiltersStore(state => state.setLoading);
  const setError = usePublicQuestionFiltersStore(state => state.setError);
  
  // Use filters với React Query
  const { data, isLoading, error } = usePublicQuestions(filters);
  
  // Update store state based on query results
  useEffect(() => {
    setLoading(isLoading);
    if (error) {
      setError(error.message);
    } else {
      setError(null);
    }
    if (data) {
      setResultCount(data.pagination.total);
    }
  }, [data, isLoading, error, setLoading, setError, setResultCount]);
  
  return (
    <div>
      {/* Question list UI */}
    </div>
  );
}
```

## Persistence Configuration

### localStorage Integration

Store automatically persists state to localStorage với configuration:

```typescript
{
  name: 'public-question-filters',
  partialize: (state) => ({
    filters: state.filters,
    searchHistory: state.searchHistory
  })
}
```

### What Gets Persisted
- ✅ `filters`: All filter settings
- ✅ `searchHistory`: User search history
- ❌ `isLoading`: Transient UI state
- ❌ `error`: Transient error state
- ❌ `searchSuggestions`: Dynamic suggestions

### Navigation Persistence

Filters persist across:
- ✅ Page navigation (Next.js router)
- ✅ Browser refresh (F5)
- ✅ Browser back/forward buttons
- ✅ Direct URL access
- ✅ Tab switching

## Performance Optimization

### Selectors

Use provided selectors để optimize re-renders:

```typescript
// ✅ Good - Only re-renders when filters change
const filters = usePublicQuestionFiltersStore(publicQuestionFiltersSelectors.filters);

// ❌ Bad - Re-renders on any state change
const { filters } = usePublicQuestionFiltersStore();
```

### Available Selectors

```typescript
export const publicQuestionFiltersSelectors = {
  // Filter selectors
  filters: (state) => state.filters,
  keyword: (state) => state.filters.keyword,
  category: (state) => state.filters.category,
  subject: (state) => state.filters.subject,
  grade: (state) => state.filters.grade,
  type: (state) => state.filters.type,
  difficulty: (state) => state.filters.difficulty,
  
  // Search selectors
  searchQuery: (state) => state.searchQuery,
  searchHistory: (state) => state.searchHistory,
  searchSuggestions: (state) => state.searchSuggestions,
  
  // UI selectors
  isLoading: (state) => state.isLoading,
  error: (state) => state.error,
  resultCount: (state) => state.resultCount,
  hasResults: (state) => state.hasResults,
  
  // Computed selectors
  sorting: (state) => ({
    sortBy: state.filters.sortBy,
    sortDir: state.filters.sortDir
  }),
  pagination: (state) => ({
    page: state.filters.page,
    limit: state.filters.limit
  }),
  activeFilterCount: (state) => {
    return Object.values(state.filters).filter(value => 
      Array.isArray(value) ? value.length > 0 : value !== undefined && value !== ''
    ).length;
  },
  hasActiveFilters: (state) => {
    return Object.values(state.filters).some(value => 
      Array.isArray(value) ? value.length > 0 : value !== undefined && value !== ''
    );
  }
};
```

## Error Handling

### Error States

Store provides comprehensive error handling:

```typescript
function ErrorHandlingComponent() {
  const error = usePublicQuestionFiltersStore(publicQuestionFiltersSelectors.error);
  const setError = usePublicQuestionFiltersStore(state => state.setError);
  
  // Handle errors
  if (error) {
    return (
      <div className="error">
        <p>Error: {error}</p>
        <button onClick={() => setError(null)}>Dismiss</button>
      </div>
    );
  }
  
  return <div>Normal content</div>;
}
```

### Error Types

Common error scenarios:
- **Validation Errors**: Invalid filter values
- **Network Errors**: API call failures
- **Persistence Errors**: localStorage access issues
- **State Errors**: Invalid state transitions

## Testing

### Testing Store Actions

```typescript
import { renderHook, act } from '@testing-library/react';
import { usePublicQuestionFiltersStore } from '@/lib/stores/public';

describe('PublicQuestionFiltersStore', () => {
  beforeEach(() => {
    // Reset store state
    usePublicQuestionFiltersStore.getState().resetFilters();
  });
  
  it('should update filters correctly', () => {
    const { result } = renderHook(() => usePublicQuestionFiltersStore());
    
    act(() => {
      result.current.updateFilter('keyword', 'test query');
    });
    
    expect(result.current.filters.keyword).toBe('test query');
  });
  
  it('should persist search history', () => {
    const { result } = renderHook(() => usePublicQuestionFiltersStore());
    
    act(() => {
      result.current.addToSearchHistory('test query');
    });
    
    expect(result.current.searchHistory).toContain('test query');
  });
});
```

### Testing Persistence

```typescript
describe('Store Persistence', () => {
  it('should persist filters to localStorage', () => {
    const { result } = renderHook(() => usePublicQuestionFiltersStore());
    
    act(() => {
      result.current.updateFilter('keyword', 'persistent query');
    });
    
    // Check localStorage
    const stored = localStorage.getItem('public-question-filters');
    const parsed = JSON.parse(stored || '{}');
    
    expect(parsed.state.filters.keyword).toBe('persistent query');
  });
});
```

## Best Practices

### 1. Use Selectors
Always use provided selectors để optimize performance:

```typescript
// ✅ Good
const filters = usePublicQuestionFiltersStore(publicQuestionFiltersSelectors.filters);

// ❌ Bad
const { filters } = usePublicQuestionFiltersStore();
```

### 2. Batch Updates
Use `setFilters` cho multiple filter updates:

```typescript
// ✅ Good - Single update
store.setFilters({
  category: ['Đại số'],
  difficulty: [QuestionDifficulty.MEDIUM],
  sortBy: PublicQuestionSortBy.RATING
});

// ❌ Bad - Multiple updates
store.updateFilter('category', ['Đại số']);
store.updateFilter('difficulty', [QuestionDifficulty.MEDIUM]);
store.updateFilter('sortBy', PublicQuestionSortBy.RATING);
```

### 3. Error Handling
Always handle error states:

```typescript
const error = usePublicQuestionFiltersStore(publicQuestionFiltersSelectors.error);

if (error) {
  // Handle error appropriately
}
```

### 4. Cleanup
Reset filters when appropriate:

```typescript
useEffect(() => {
  return () => {
    // Cleanup on unmount if needed
    store.resetFilters();
  };
}, []);
```

## Integration Examples

### Complete Filter Component

```typescript
function CompleteFilterComponent() {
  const filters = usePublicQuestionFiltersStore(publicQuestionFiltersSelectors.filters);
  const searchQuery = usePublicQuestionFiltersStore(publicQuestionFiltersSelectors.searchQuery);
  const activeFilterCount = usePublicQuestionFiltersStore(publicQuestionFiltersSelectors.activeFilterCount);
  
  const setFilters = usePublicQuestionFiltersStore(state => state.setFilters);
  const updateFilter = usePublicQuestionFiltersStore(state => state.updateFilter);
  const resetFilters = usePublicQuestionFiltersStore(state => state.resetFilters);
  const toggleDifficulty = usePublicQuestionFiltersStore(state => state.toggleDifficulty);
  
  return (
    <div className="filter-component">
      {/* Search */}
      <input
        value={searchQuery}
        onChange={(e) => updateFilter('keyword', e.target.value)}
        placeholder="Search questions..."
      />
      
      {/* Difficulty Filters */}
      <div>
        {Object.values(QuestionDifficulty).map(difficulty => (
          <button
            key={difficulty}
            className={filters.difficulty?.includes(difficulty) ? 'active' : ''}
            onClick={() => toggleDifficulty(difficulty)}
          >
            {difficulty}
          </button>
        ))}
      </div>
      
      {/* Filter Summary */}
      <div>
        Active Filters: {activeFilterCount}
        <button onClick={resetFilters}>Reset All</button>
      </div>
    </div>
  );
}
```

## Troubleshooting

### Common Issues

1. **Store not persisting**: Check localStorage permissions
2. **Performance issues**: Use selectors instead of full store access
3. **State not updating**: Ensure actions are called correctly
4. **TypeScript errors**: Check filter value types

### Debug Tools

- Redux DevTools integration
- Console logging trong development
- Store state inspection
- Persistence verification

## API Reference

See the complete TypeScript interfaces trong store implementation cho detailed API documentation.
