# Infinite Render Loop Fix

**Date**: October 26, 2025  
**Status**: ✅ Fixed

## Issue

**Error**:
```
Error: Maximum update depth exceeded. 
This can happen when a component repeatedly calls setState inside 
componentWillUpdate or componentDidUpdate. 
React limits the number of nested updates to prevent infinite loops.
```

**Page**: `/3141592654/admin/questions/[id]/edit`

## Root Cause

In `answer-form.tsx`, the `renderAnswerItem` function was defined inside the component **without useCallback memoization**. 

### Problem Flow:

1. Component renders → `renderAnswerItem` function created
2. `fields.map()` calls `renderAnswerItem` for each answer
3. `renderAnswerItem` contains FormField with refs
4. Refs trigger re-render
5. Component re-renders → new `renderAnswerItem` created
6. **Infinite loop** ♾️

### Code Location:

```typescript
// ❌ BAD - Function recreated every render
const renderAnswerItem = (field: Record<"id", string>, index: number) => {
  const isExpanded = expandedAnswers.has(index);
  const hasPreview = showPreview.has(index);
  
  return (
    <Card key={field.id} className="answer-item">
      {/* FormFields with refs inside */}
    </Card>
  );
};

// Called in render
{fields.map((field, index) => renderAnswerItem(field, index))}
```

## Solution

### ✅ Wrap render functions in useCallback

**File**: `apps/frontend/src/components/admin/questions/forms/answer-form.tsx`

#### 1. Add useCallback import

```diff
- import React, { useState } from "react";
+ import React, { useState, useCallback } from "react";
```

#### 2. Memoize renderAnswerItem

```typescript
const renderAnswerItem = useCallback((field: Record<"id", string>, index: number) => {
  const isExpanded = expandedAnswers.has(index);
  const hasPreview = showPreview.has(index);
  
  return (
    <Card key={field.id} className="answer-item">
      {/* FormFields with refs inside */}
    </Card>
  );
}, [control, expandedAnswers, showPreview, handleTogglePreview, handleToggleExpanded, handleRemoveAnswer, minAnswers]);
```

#### 3. Memoize all handler functions

```typescript
const handleAddAnswer = useCallback(() => {
  if (fields.length < maxAnswers) {
    append({
      content: "",
      isCorrect: false
    });
  }
}, [fields.length, maxAnswers, append]);

const handleRemoveAnswer = useCallback((index: number) => {
  if (fields.length > minAnswers) {
    remove(index);
    // Update state sets
    setExpandedAnswers(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
    setShowPreview(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  }
}, [fields.length, minAnswers, remove]);

const handleToggleExpanded = useCallback((index: number) => {
  setExpandedAnswers(prev => {
    const newSet = new Set(prev);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    return newSet;
  });
}, []);

const handleTogglePreview = useCallback((index: number) => {
  setShowPreview(prev => {
    const newSet = new Set(prev);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    return newSet;
  });
}, []);
```

## Dependencies Explained

### renderAnswerItem dependencies:
- `control`: Form control object (stable from react-hook-form)
- `expandedAnswers`: State set tracking expanded answers
- `showPreview`: State set tracking preview visibility
- `handleTogglePreview`: Handler function (memoized)
- `handleToggleExpanded`: Handler function (memoized)
- `handleRemoveAnswer`: Handler function (memoized)
- `minAnswers`: Computed value (stable)

### Handler dependencies:
- `fields.length`: Current number of answer fields
- `maxAnswers`: Maximum allowed answers
- `minAnswers`: Minimum required answers
- `append`, `remove`: Field array actions from react-hook-form

## Best Practices

### ✅ DO

1. **Memoize render functions in map**:
   ```typescript
   const renderItem = useCallback((item) => {
     // render logic
   }, [dependencies]);
   
   {items.map(item => renderItem(item))}
   ```

2. **Memoize event handlers**:
   ```typescript
   const handleClick = useCallback(() => {
     // handler logic
   }, [dependencies]);
   ```

3. **Use stable dependencies**:
   - Primitives (numbers, strings)
   - Memoized values
   - Stable objects from libraries (react-hook-form control)

4. **Update state functionally**:
   ```typescript
   setState(prev => computeNewState(prev))
   ```

### ❌ DON'T

1. **Don't create functions in render without memoization**:
   ```typescript
   // ❌ BAD
   const renderItem = (item) => <div>{item}</div>;
   {items.map(item => renderItem(item))}
   ```

2. **Don't create objects/arrays in dependencies**:
   ```typescript
   // ❌ BAD
   useCallback(() => {}, [{ foo: 'bar' }])
   useCallback(() => {}, [[1, 2, 3]])
   ```

3. **Don't create inline arrow functions in map if they contain refs**:
   ```typescript
   // ❌ BAD
   {items.map(item => (
     <Component ref={someRef} key={item.id} />
   ))}
   ```

## Testing

After fix, verify:

1. ✅ Edit page loads without errors
2. ✅ Can add/remove answers
3. ✅ Can toggle expanded/preview states
4. ✅ No infinite render loops
5. ✅ Form submission works
6. ✅ No performance issues

## Prevention

### React DevTools Profiler

Use React DevTools to identify unnecessary re-renders:

1. Open React DevTools
2. Go to Profiler tab
3. Record a session
4. Look for components rendering repeatedly
5. Check why they're re-rendering

### ESLint Rules

Enable exhaustive-deps rule:

```json
{
  "rules": {
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

## Related Patterns

### When to use useCallback:

1. **Functions passed as props to memoized components**
2. **Functions used in useEffect dependencies**
3. **Functions passed to child components that use React.memo**
4. **Event handlers created in loops (map, forEach)**
5. **Functions used in other hook dependencies**

### When NOT to use useCallback:

1. Simple event handlers not passed as props
2. Functions that don't trigger re-renders
3. Top-level functions (outside components)
4. Functions that should update on every render

## Performance Impact

### Before Fix:
- ❌ Infinite render loop
- ❌ Browser becomes unresponsive
- ❌ Page crashes
- ❌ React error boundary triggered

### After Fix:
- ✅ Normal render cycle
- ✅ Smooth user interactions
- ✅ No performance issues
- ✅ Stable component behavior

## Changelog

### 2025-10-26
- ✅ Added useCallback to renderAnswerItem
- ✅ Memoized all handler functions
- ✅ Fixed infinite render loop
- ✅ Documented pattern for future reference

## References

- [React useCallback Hook](https://react.dev/reference/react/useCallback)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [react-hook-form Field Arrays](https://react-hook-form.com/api/usefieldarray)

