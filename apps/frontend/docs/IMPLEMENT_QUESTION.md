# Question System Implementation Guide

## Overview
This guide covers how to implement question-related features using the gRPC-based question service. All communication is done through gRPC instead of REST API.

## ⚠️ Current Status
- **gRPC Services**: Currently using stub implementations
- **Protobuf Generation**: Pending backend protobuf file generation  
- **Real Implementation**: Will be available once backend provides protobuf files

## Service Architecture

### gRPC Questions Service
Located at: `src/services/api/questions.api.ts`

```typescript
import { QuestionsService } from '@/services/api/questions.api';

// Example usage (currently returns stub data)
const questions = await QuestionsService.getQuestions({
  page: 1,
  limit: 20,
  subject: 'math'
});
```

### Available Methods

#### Get Questions List
```typescript
QuestionsService.getQuestions({
  page: number,
  limit: number,
  search?: string,
  subject?: string,
  difficulty?: string,
  tags?: string[]
})
```

#### Get Single Question
```typescript
QuestionsService.getQuestion(questionId: string)
```

#### Create Question
```typescript
QuestionsService.createQuestion({
  content: string,
  answers: Answer[],
  correctAnswerIndex: number,
  explanation?: string,
  subject: string,
  difficulty: 'easy' | 'medium' | 'hard',
  tags: string[]
})
```

#### Update Question
```typescript
QuestionsService.updateQuestion(questionId: string, updates: Partial<Question>)
```

#### Delete Question
```typescript
QuestionsService.deleteQuestion(questionId: string)
```

#### Get Question Statistics
```typescript
QuestionsService.getQuestionStats(questionId: string)
```

## Data Types

### Question Interface
```typescript
interface Question {
  id: string;
  content: string;
  type: 'multiple_choice' | 'true_false' | 'essay' | 'fill_blank';
  answers: Answer[];
  correctAnswerIndex: number;
  explanation?: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  stats: QuestionStats;
}

interface Answer {
  id: string;
  content: string;
  isCorrect: boolean;
}

interface QuestionStats {
  totalAttempts: number;
  correctAttempts: number;
  averageTime: number;
  successRate: number;
}
```

## Implementation Examples

### Question List Component
```tsx
'use client';

import { useState, useEffect } from 'react';
import { QuestionsService } from '@/services/api/questions.api';

export function QuestionList() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const response = await QuestionsService.getQuestions({
          page: 1,
          limit: 20
        });
        setQuestions(response.questions);
      } catch (error) {
        console.error('Failed to load questions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {questions.map(question => (
        <div key={question.id}>
          <h3>{question.content}</h3>
          <p>Difficulty: {question.difficulty}</p>
          <p>Subject: {question.subject}</p>
        </div>
      ))}
    </div>
  );
}
```

### Question Creation Form
```tsx
'use client';

import { useState } from 'react';
import { QuestionsService } from '@/services/api/questions.api';

export function QuestionCreateForm() {
  const [formData, setFormData] = useState({
    content: '',
    answers: [
      { content: '', isCorrect: false },
      { content: '', isCorrect: false },
      { content: '', isCorrect: false },
      { content: '', isCorrect: false }
    ],
    explanation: '',
    subject: 'math',
    difficulty: 'medium' as const,
    tags: []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const correctAnswerIndex = formData.answers.findIndex(a => a.isCorrect);
      
      await QuestionsService.createQuestion({
        ...formData,
        correctAnswerIndex
      });

      // Handle success (redirect, show message, etc.)
      alert('Question created successfully!');
    } catch (error) {
      console.error('Failed to create question:', error);
      alert('Failed to create question');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Question Content:</label>
        <textarea 
          value={formData.content}
          onChange={(e) => setFormData({...formData, content: e.target.value})}
          required
        />
      </div>
      
      {/* Answer options */}
      {formData.answers.map((answer, index) => (
        <div key={index}>
          <input 
            type="text"
            placeholder={`Answer ${index + 1}`}
            value={answer.content}
            onChange={(e) => {
              const newAnswers = [...formData.answers];
              newAnswers[index].content = e.target.value;
              setFormData({...formData, answers: newAnswers});
            }}
          />
          <input 
            type="radio"
            name="correctAnswer"
            checked={answer.isCorrect}
            onChange={() => {
              const newAnswers = formData.answers.map((a, i) => ({
                ...a,
                isCorrect: i === index
              }));
              setFormData({...formData, answers: newAnswers});
            }}
          />
        </div>
      ))}

      <button type="submit">Create Question</button>
    </form>
  );
}
```

## Error Handling

### gRPC Error Types
```typescript
import { isGrpcError, getGrpcErrorMessage } from '@/lib/grpc-error-handler';

try {
  await QuestionsService.getQuestions();
} catch (error) {
  if (isGrpcError(error)) {
    console.error('gRPC Error:', getGrpcErrorMessage(error));
    
    // Handle specific error codes
    switch (error.code) {
      case 16: // UNAUTHENTICATED
        // Redirect to login
        break;
      case 7: // PERMISSION_DENIED  
        // Show permission error
        break;
      case 5: // NOT_FOUND
        // Show not found error
        break;
      default:
        // Show generic error
    }
  } else {
    console.error('Unknown error:', error);
  }
}
```

## Caching & Performance

### Using React Query with gRPC
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QuestionsService } from '@/services/api/questions.api';

// Query for questions list
export function useQuestions(filters: QuestionFilters) {
  return useQuery({
    queryKey: ['questions', filters],
    queryFn: () => QuestionsService.getQuestions(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Query for single question
export function useQuestion(questionId: string) {
  return useQuery({
    queryKey: ['question', questionId],
    queryFn: () => QuestionsService.getQuestion(questionId),
    enabled: !!questionId,
  });
}

// Mutation for creating questions
export function useCreateQuestion() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: QuestionsService.createQuestion,
    onSuccess: () => {
      // Invalidate questions list
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
  });
}
```

## Testing

### Unit Tests for Questions Service
```typescript
import { QuestionsService } from '@/services/api/questions.api';

describe('QuestionsService', () => {
  it('should fetch questions list', async () => {
    const questions = await QuestionsService.getQuestions({
      page: 1,
      limit: 10
    });
    
    expect(Array.isArray(questions.questions)).toBe(true);
    expect(typeof questions.total).toBe('number');
  });

  it('should create a question', async () => {
    const questionData = {
      content: 'Test question?',
      answers: [
        { content: 'Answer 1', isCorrect: true },
        { content: 'Answer 2', isCorrect: false }
      ],
      correctAnswerIndex: 0,
      subject: 'math',
      difficulty: 'easy' as const,
      tags: ['test']
    };

    const result = await QuestionsService.createQuestion(questionData);
    expect(result.success).toBe(true);
  });
});
```

## Migration Notes

### From REST to gRPC
1. **Import Changes**: Use `QuestionsService` from questions.api.ts
2. **Method Names**: Updated to match gRPC conventions
3. **Error Handling**: Use gRPC error handlers instead of HTTP status codes
4. **Data Types**: Updated to match protobuf definitions
5. **Streaming**: gRPC supports streaming for real-time updates (future feature)

### Stub Implementation Notice
Currently, all methods return stub data because:
- Protobuf files are not yet generated from backend
- Backend gRPC services are not fully implemented  
- This allows frontend development to continue without blocking

### Next Steps for Real Implementation
1. Backend team generates protobuf files
2. Copy protobuf files to `src/generated/` directory
3. Replace stub implementations with real gRPC calls
4. Update error handling for actual gRPC responses
5. Test integration with backend services

## Best Practices

1. **Always use TypeScript**: Leverage type safety for gRPC calls
2. **Error Handling**: Always wrap gRPC calls in try-catch
3. **Loading States**: Show loading indicators during gRPC calls  
4. **Caching**: Use React Query for efficient data management
5. **Validation**: Validate data before sending to gRPC services
6. **Logging**: Log gRPC errors for debugging
7. **Testing**: Write unit tests for all gRPC service interactions

## Related Documentation
- [gRPC Migration Guide](./MIGRATION_REST_TO_GRPC_COMPLETE.md)
- [Authentication Guide](./AUTH_COMPLETE_GUIDE.md)  
- [Error Handling Guide](./ERROR_HANDLING.md)
- [Rollback Guide](./ROLLBACK_GRPC_TO_REST.md)