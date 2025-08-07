---
type: "always_apply"
---

# NyNus Clean Code Standards
## Comprehensive Coding Guidelines for NyNus NyNus

## 🎯 Priority Levels
- 🔴 **Critical**: Must follow (CI/CD will fail)
- 🟡 **High**: Should follow (Code review required)
- 🟢 **Medium**: Recommended (Best practice)
- 🔵 **Low**: Optional (Nice to have)

## 📋 Table of Contents
- [Clean Code Fundamentals](#clean-code-fundamentals)
- [Naming Conventions](#naming-conventions)
- [Function Design](#function-design)
- [Code Organization](#code-organization)
- [TypeScript Best Practices](#typescript-best-practices)
- [React/Next.js Patterns](#reactnextjs-patterns)
- [NestJS Backend Patterns](#nestjs-backend-patterns)
- [Database & Prisma](#database--prisma)
- [Testing Standards](#testing-standards)
- [Performance Guidelines](#performance-guidelines)
- [Security Patterns](#security-patterns)
- [Automated Tooling](#automated-tooling)
- [Quick Reference](#quick-reference)

### Monorepo Architecture
```
nynus/
├── apps/                    # Các ứng dụng chính
│   ├── web/                # Next.js frontend
│   ├── api/                # NestJS backend  
│   └── admin/              # Admin dashboard
├── packages/               # Shared packages
│   ├── database/           # Prisma schema & repositories
│   ├── entities/           # Domain entities
│   ├── dto/               # Data Transfer Objects
│   ├── interfaces/        # TypeScript interfaces
│   └── utils/             # Shared utilities
└── configs/               # Shared configurations
```

**✅ NÊN làm:**
- Tổ chức code theo feature/domain
- Sử dụng shared packages cho logic dùng chung
- Tách biệt rõ ràng giữa frontend và backend

**❌ KHÔNG NÊN làm:**
- Trộn lẫn logic frontend/backend
- Duplicate code giữa các packages
- Tạo circular dependencies

### Cách lưu docs, tests
-Lưu các doc trong thư mục docs/... chia theo từng mục vấn đề riêng
- Lưu các tests trong thư mục docs/tests/... chia theo từng mục vấn đề riêng

## Clean Code Fundamentals

### 🔴 Language Policy for NyNus
```typescript
// ✅ GOOD - Vietnamese cho business logic comments
function tinhDiemCauHoi(answers: Answer[]): number {
  // Tính tổng điểm từ các câu trả lời đúng của học viên
  return answers
    .filter(answer => answer.isCorrect)
    .reduce((total, answer) => total + answer.points, 0);
}

// ✅ GOOD - English cho technical implementation comments
function calculateQuestionScore(answers: Answer[]): number {
  // Filter correct answers and sum their points
  return answers
    .filter(answer => answer.isCorrect)
    .reduce((total, answer) => total + answer.points, 0);
}

// ✅ GOOD - Vietnamese cho error messages
throw new ValidationError('Nội dung câu hỏi không được để trống');
throw new AuthenticationError('Thông tin đăng nhập không chính xác');

// ✅ GOOD - Vietnamese cho UI text
const UI_MESSAGES = {
  loginSuccess: 'Đăng nhập thành công',
  invalidEmail: 'Email không hợp lệ',
  passwordTooShort: 'Mật khẩu phải có ít nhất 8 ký tự'
};
```

### 🔴 Single Responsibility Principle
```typescript
// ❌ BAD - Function doing too many things
function processUserData(userData: any) {
  // Validate data
  if (!userData.email) throw new Error('Email required');

  // Transform data
  const user = {
    id: generateId(),
    email: userData.email.toLowerCase(),
    name: userData.name.trim()
  };

  // Save to database
  database.save(user);

  // Send email
  emailService.sendWelcome(user.email);

  return user;
}

// ✅ GOOD - Separate functions for each responsibility
function validateUserData(userData: UserInput): void {
  if (!userData.email) throw new Error('Email required');
  if (!userData.name) throw new Error('Name required');
}

function transformUserData(userData: UserInput): User {
  return {
    id: generateId(),
    email: userData.email.toLowerCase(),
    name: userData.name.trim()
  };
}

function createUser(userData: UserInput): User {
  validateUserData(userData);
  const user = transformUserData(userData);
  return userRepository.save(user);
}
```

### 🔴 Function Size Limits
```typescript
// ✅ GOOD - Concise functions (< 20 lines)
function calculateQuestionScore(answers: Answer[]): number {
  return answers
    .filter(answer => answer.isCorrect)
    .reduce((total, answer) => total + answer.points, 0);
}

// ✅ GOOD - Extract complex logic into helper functions
function processQuestionSubmission(submission: QuestionSubmission): Result {
  const validatedanswers = validateanswers(submission.answers);
  const score = calculateQuestionScore(validatedanswers);
  const result = createResult(submission.userId, score);

  return saveResult(result);
}
```

### 🔴 Parameter Limits
```typescript
// ❌ BAD - Too many parameters
function createQuestion(
  content: string,
  type: QuestionType,
  difficulty: Difficulty,
  category: string,
  tags: string[],
  timeLimit: number,
  points: number,
  explanation: string
) {}

// ✅ GOOD - Use object parameter
interface CreateQuestionParams {
  content: string;
  type: QuestionType;
  difficulty: Difficulty;
  category: string;
  tags: string[];
  timeLimit: number;
  points: number;
  explanation: string;
}

function createQuestion(params: CreateQuestionParams): Question {
  // Implementation
}
```

## Naming Conventions

### 🔴 Intention-Revealing Names
```typescript
// ❌ BAD - Vague names
const d = new Date();
const u = users.filter(x => x.active);
const calc = (a, b) => a * b * 0.1;

// ✅ GOOD - Clear, meaningful names
const currentDate = new Date();
const activeUsers = users.filter(user => user.isActive);
const calculateDiscountAmount = (price: number, quantity: number) =>
  price * quantity * DISCOUNT_RATE;
```

### 🔴 Searchable Names
```typescript
// ❌ BAD - Magic numbers and single letter variables
for (let i = 0; i < 86400; i++) {
  // Process every second in a day
}

// ✅ GOOD - Named constants
const SECONDS_PER_DAY = 86400;
const MILLISECONDS_PER_SECOND = 1000;

for (let secondIndex = 0; secondIndex < SECONDS_PER_DAY; secondIndex++) {
  // Process every second in a day
}
```

### 🟡 Avoid Mental Mapping
```typescript
// ❌ BAD - Requires mental mapping
const locations = ['Hanoi', 'Ho Chi Minh City', 'Da Nang'];
for (let i = 0; i < locations.length; i++) {
  const l = locations[i];
  // Process location
}

// ✅ GOOD - Explicit naming
const vietnameseCities = ['Hanoi', 'Ho Chi Minh City', 'Da Nang'];
for (const cityName of vietnameseCities) {
  // Process city
}
```

## Function Design

### 🔴 Do One Thing
```typescript
// ❌ BAD - Function doing multiple things
function handleUserLogin(email: string, password: string) {
  // Validate input
  if (!email || !password) return false;

  // Check credentials
  const user = findUserByEmail(email);
  if (!user || !verifyPassword(password, user.hashedPassword)) {
    return false;
  }

  // Update last login
  user.lastLoginAt = new Date();
  saveUser(user);

  // Create session
  const session = createSession(user.id);

  // Log activity
  logUserActivity(user.id, 'LOGIN');

  return session;
}

// ✅ GOOD - Separate functions for each responsibility
function validateLoginInput(email: string, password: string): void {
  if (!email || !password) {
    throw new InvalidInputError('Email and password are required');
  }
}

function authenticateUser(email: string, password: string): User {
  const user = findUserByEmail(email);
  if (!user || !verifyPassword(password, user.hashedPassword)) {
    throw new AuthenticationError('Invalid login credentials');
  }
  return user;
}

function handleUserLogin(email: string, password: string): Session {
  validateLoginInput(email, password);
  const user = authenticateUser(email, password);

  updateLastLogin(user);
  logUserActivity(user.id, 'LOGIN');

  return createSession(user.id);
}
```

### 🔴 Avoid Deep Nesting
```typescript
// ❌ BAD - Too many nested levels
function processQuestionAnswer(answer: Answer): Result {
  if (answer) {
    if (answer.Content) {
      if (answer.QuestionID) {
        const question = findQuestion(answer.QuestionID);
        if (question) {
          if (question.Type === 'MULTIPLE_CHOICE') {
            if (answer.selectedOption) {
              return validateMultipleChoice(answer, question);
            }
          }
        }
      }
    }
  }
  return null;
}

// ✅ GOOD - Early returns and guard clauses
function processQuestionAnswer(answer: Answer): Result {
  if (!answer?.Content || !answer.QuestionID) {
    throw new InvalidAnswerError('Answer missing required information');
  }

  const question = findQuestion(answer.QuestionID);
  if (!question) {
    throw new QuestionNotFoundError(`Question ${answer.QuestionID} not found`);
  }

  if (question.Type !== 'MULTIPLE_CHOICE') {
    throw new UnsupportedQuestionTypeError(`Question type ${question.Type} not supported`);
  }

  if (!answer.selectedOption) {
    throw new InvalidAnswerError('Multiple choice question requires selectedOption');
  }

  return validateMultipleChoice(answer, question);
}
```


## Code Organization

### 🔴 File Size Limits
```typescript
// 🔴 Critical: Files không được vượt quá 300 lines
// 🟡 High: Functions không được vượt quá 20 lines
// 🟡 High: Classes không được vượt quá 200 lines

// ✅ NÊN - Tách file lớn thành modules nhỏ
// user.service.ts (< 300 lines)
export class UserService {
  // Core user operations
}

// user-validation.service.ts
export class UserValidationService {
  // Validation logic
}

// user-notification.service.ts  
export class UserNotificationService {
  // Notification logic
}
```

### 🔴 Dependency Direction
```typescript
// ✅ NÊN - High-level modules không depend vào low-level modules
// Domain layer
interface IUserRepository {
  findById(id: string): Promise<User>;
  save(user: User): Promise<User>;
}

// Application layer
class UserService {
  constructor(private userRepository: IUserRepository) {}
  
  async getUser(id: string): Promise<User> {
    return this.userRepository.findById(id);
  }
}

// Infrastructure layer
class PrismaUserRepository implements IUserRepository {
  async findById(id: string): Promise<User> {
    // Prisma implementation
  }
}

## Error Handling

### 🔴 Don't Return Null
```typescript
// ❌ BAD - Return null
function findUserByEmail(email: string): User | null {
  const user = database.findUser(email);
  return user || null; // Caller must check null
}

// ✅ GOOD - Throw exceptions or use Optional pattern
function findUserByEmail(email: string): User {
  const user = database.findUser(email);
  if (!user) {
    throw new UserNotFoundError(`User with email ${email} not found`);
  }
  return user;
}

// ✅ OR - Use Optional pattern
function findUserByEmailOptional(email: string): Optional<User> {
  const user = database.findUser(email);
  return Optional.ofNullable(user);
}
```

### 🔴 Fail Fast Principle
```typescript
// ✅ GOOD - Validate inputs at the beginning of function
function createQuestion(params: CreateQuestionParams): Question {
  // Fail fast - validate all inputs first
  if (!params.Content?.trim()) {
    throw new ValidationError('Question content cannot be empty');
  }

  if (params.Content.length > MAX_QUESTION_LENGTH) {
    throw new ValidationError(`Question content cannot exceed ${MAX_QUESTION_LENGTH} characters`);
  }

  if (!Object.values(QuestionType).includes(params.Type)) {
    throw new ValidationError(`Question type ${params.Type} is invalid`);
  }

  // Business logic after validation
  return questionRepository.create(params);
}
```

## Testing Standards

### 🔴 AAA Pattern (Arrange-Act-Assert)
```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create user successfully with valid data', async () => {
      // Arrange - Prepare test data
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe'
      };
      const expectedUser = { id: '123', ...userData };
      mockUserRepository.save.mockResolvedValue(expectedUser);

      // Act - Execute the action to test
      const result = await userService.createUser(userData);

      // Assert - Check the result
      expect(result).toEqual(expectedUser);
      expect(mockUserRepository.save).toHaveBeenCalledWith(userData);
    });

    it('should throw ValidationError when email is invalid', async () => {
      // Arrange
      const invalidUserData = {
        email: 'invalid-email',
        firstName: 'John',
        lastName: 'Doe'
      };

      // Act & Assert
      await expect(userService.createUser(invalidUserData))
        .rejects
        .toThrow(ValidationError);
    });
  });
});
```

### 🔴 Test Coverage Requirements
```typescript
// 🔴 Critical: 90%+ coverage for business logic
// 🟡 High: 80%+ coverage for services and repositories
// 🟢 Medium: 70%+ coverage for controllers and components

// ✅ GOOD - Test all edge cases
describe('calculateQuestionScore', () => {
  it('should return 0 when no answers provided', () => {
    expect(calculateQuestionScore([])).toBe(0);
  });

  it('should return 0 when all answers are wrong', () => {
    const wronganswers = [
      { isCorrect: false, points: 10 },
      { isCorrect: false, points: 5 }
    ];
    expect(calculateQuestionScore(wronganswers)).toBe(0);
  });

  it('should calculate total points of correct answers', () => {
    const mixedanswers = [
      { isCorrect: true, points: 10 },
      { isCorrect: false, points: 5 },
      { isCorrect: true, points: 15 }
    ];
    expect(calculateQuestionScore(mixedanswers)).toBe(25);
  });
});
```

## Performance Guidelines

### 🟡 Algorithm Complexity
```typescript
// ❌ KHÔNG NÊN - O(n²) complexity
function findDuplicateQuestions(questions: Question[]): Question[] {
  const duplicates = [];
  for (let i = 0; i < questions.length; i++) {
    for (let j = i + 1; j < questions.length; j++) {
      if (questions[i].Content === questions[j].Content) {
        duplicates.push(questions[j]);
      }
    }
  }
  return duplicates;
}

// ✅ NÊN - O(n) complexity với Map
function findDuplicateQuestions(questions: Question[]): Question[] {
  const contentMap = new Map<string, Question>();
  const duplicates: Question[] = [];

  for (const question of questions) {
    if (contentMap.has(question.Content)) {
      duplicates.push(question);
    } else {
      contentMap.set(question.Content, question);
    }
  }

  return duplicates;
}
```

### 🟡 Memory Management
```typescript
// ✅ NÊN - Cleanup event listeners và subscriptions
export function useQuestionSubscription(QuestionID: string) {
  useEffect(() => {
    const subscription = questionService.subscribe(QuestionID, handleUpdate);

    // Cleanup function
    return () => {
      subscription.unsubscribe();
    };
  }, [QuestionID]);
}

// ✅ NÊN - Use pagination cho large datasets
async function getQuestions(page: number = 1, limit: number = 20): Promise<PaginatedResult<Question>> {
  const offset = (page - 1) * limit;

  const [questions, total] = await Promise.all([
    questionRepository.findMany({ offset, limit }),
    questionRepository.count()
  ]);

  return {
    data: questions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
}
```

## Security Patterns

### 🔴 Input Sanitization
```typescript
// ✅ GOOD - Sanitize all user inputs
import DOMPurify from 'dompurify';
import { escape } from 'html-escaper';

function sanitizeQuestionContent(content: string): string {
  // Remove malicious HTML/JS
  const cleanHtml = DOMPurify.sanitize(content);

  // Escape special characters
  return escape(cleanHtml);
}

// ✅ GOOD - Validate with Zod schemas
const CreateQuestionSchema = z.object({
  content: z.string()
    .min(10, 'Content must be at least 10 characters')
    .max(1000, 'Content cannot exceed 1000 characters')
    .refine(content => !content.includes('<script'), 'Content cannot contain script tags'),
  type: z.enum(['MULTIPLE_CHOICE', 'ESSAY', 'TRUE_FALSE']),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD'])
});
```

### 🔴 Authentication & Authorization
```typescript
// ✅ GOOD - Role-based access control
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.INSTRUCTOR, UserRole.ADMIN)
@Post('questions')
async createQuestion(
  @Body() createDto: CreateQuestionDto,
  @CurrentUser() user: User
): Promise<QuestionResponseDto> {
  // Verify user can create questions in this category
  await this.authorizationService.verifyQuestionCreationPermission(user, createDto.categoryId);

  return this.questionsService.create(createDto, user.id);
}

// ✅ GOOD - Resource-level authorization
async function updateQuestion(QuestionID: string, updates: UpdateQuestionDto, userId: string): Promise<Question> {
  const question = await questionRepository.findById(QuestionID);

  if (!question) {
    throw new QuestionNotFoundError();
  }

  // Check if user owns the question or is admin
  if (question.Creator !== userId && !await isAdmin(userId)) {
    throw new ForbiddenError('You do not have permission to edit this question');
  }

  return questionRepository.update(QuestionID, updates);
}
```

## Automated Tooling

### 🔴 ESLint Configuration
```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended",
    "@typescript-eslint/recommended-requiring-type-checking"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/prefer-const": "error",
    "prefer-const": "error",
    "no-console": "error",
    "no-debugger": "error",
    "import/order": ["error", {
      "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
      "newlines-between": "always"
    }]
  }
}
```

### 🔴 Pre-commit Hooks
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "git add"
    ],
    "*.{js,jsx,ts,tsx}": [
      "jest --findRelatedTests --passWithNoTests"
    ]
  }
}
```

## Quick Reference

### 🔴 Pre-commit Checklist
- [ ] Code follows naming conventions
- [ ] Functions < 20 lines, < 4 parameters
- [ ] No console.log statements
- [ ] All TypeScript errors resolved
- [ ] Tests written and pass (90%+ coverage)
- [ ] Error handling implemented
- [ ] Input validation added
- [ ] Performance implications considered

### 🔴 Code Review Checklist
- [ ] Single responsibility principle
- [ ] No deep nesting (< 3 levels)
- [ ] Meaningful variable/function names
- [ ] Proper error handling
- [ ] Security vulnerabilities checked
- [ ] Performance optimized
- [ ] Tests comprehensive
- [ ] Documentation updated

---

**NyNus Clean Code Standards Features:**
- ✅ Complete Clean Code principles
- ✅ Priority levels (Critical/High/Medium/Low)
- ✅ Comprehensive testing guidelines
- ✅ Security patterns
- ✅ Performance optimization
- ✅ Automated tooling setup
- ✅ Quick reference checklists
- ✅ NyNus tech stack integration
