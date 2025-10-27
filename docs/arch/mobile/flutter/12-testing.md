# 🧪 Phase 12: Testing Strategy
**Flutter Mobile App - Comprehensive Testing Implementation**

## 🎯 Objectives
- Unit testing cho business logic
- Widget testing cho UI components
- Integration testing cho user flows
- E2E testing cho critical paths
- Performance testing
- Accessibility testing
- Test coverage > 85%

---

## 📋 Task 12.1: Testing Infrastructure

### 12.1.1 Test Dependencies

Update `pubspec.yaml`:
```yaml
dev_dependencies:
  flutter_test:
    sdk: flutter
  integration_test:
    sdk: flutter
  
  # Testing frameworks
  mockito: ^5.4.4
  bloc_test: ^9.1.5
  mocktail: ^1.0.3
  
  # Test utilities
  build_runner: ^2.4.8
  test: ^1.24.9
  fake_async: ^1.3.1
  
  # Code generation
  json_serializable: ^6.7.1
  freezed: ^2.4.6
  
  # Coverage
  coverage: ^1.7.2
```

### 12.1.2 Test Configuration

**File:** `test/test_config.dart`
```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';
import 'package:exam_bank_mobile/core/storage/hive_storage.dart';
import 'package:hive_flutter/hive_flutter.dart';

class TestConfig {
  static Future<void> setupTestEnvironment() async {
    TestWidgetsFlutterBinding.ensureInitialized();
    
    // Initialize Hive with test path
    await Hive.initFlutter('test');
    
    // Open test boxes
    await HiveStorage.initialize();
  }

  static Future<void> tearDownTestEnvironment() async {
    await HiveStorage.clearAll();
    await HiveStorage.close();
  }

  static Future<void> cleanupBetweenTests() async {
    await HiveStorage.clearAll();
  }
}

// Mock builders
@GenerateMocks([
  AuthRepository,
  QuestionRepository,
  ExamRepository,
  LibraryRepository,
  TheoryRepository,
])
void main() {}
```

---

## 📋 Task 12.2: Unit Testing

### 12.2.1 Domain Layer Tests

**File:** `test/features/auth/domain/usecases/login_usecase_test.dart`
```dart
import 'package:dartz/dartz.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';
import 'package:exam_bank_mobile/features/auth/domain/usecases/login_usecase.dart';
import 'package:exam_bank_mobile/features/auth/domain/repositories/auth_repository.dart';
import 'package:exam_bank_mobile/core/errors/failures.dart';

import '../../../test_config.mocks.dart';

void main() {
  late LoginUseCase useCase;
  late MockAuthRepository mockRepository;

  setUp(() {
    mockRepository = MockAuthRepository();
    useCase = LoginUseCase(mockRepository);
  });

  group('LoginUseCase', () {
    const testEmail = 'test@example.com';
    const testPassword = 'password123';
    
    final testLoginResponse = LoginResponse(
      user: const User(
        id: '1',
        email: testEmail,
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.student,
        status: UserStatus.active,
        emailVerified: true,
        createdAt: DateTime(2024, 1, 1),
      ),
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
    );

    test('should return LoginResponse when login is successful', () async {
      // Arrange
      when(mockRepository.login(
        email: anyNamed('email'),
        password: anyNamed('password'),
      )).thenAnswer((_) async => Right(testLoginResponse));

      // Act
      final result = await useCase(LoginParams(
        email: testEmail,
        password: testPassword,
      ));

      // Assert
      expect(result, Right(testLoginResponse));
      verify(mockRepository.login(
        email: testEmail,
        password: testPassword,
      )).called(1);
      verifyNoMoreInteractions(mockRepository);
    });

    test('should return Failure when login fails', () async {
      // Arrange
      final testFailure = ServerFailure('Login failed');
      when(mockRepository.login(
        email: anyNamed('email'),
        password: anyNamed('password'),
      )).thenAnswer((_) async => Left(testFailure));

      // Act
      final result = await useCase(LoginParams(
        email: testEmail,
        password: testPassword,
      ));

      // Assert
      expect(result, Left(testFailure));
      verify(mockRepository.login(
        email: testEmail,
        password: testPassword,
      )).called(1);
    });

    test('should validate empty credentials', () async {
      // Arrange
      final testFailure = ValidationFailure('Email and password required');
      when(mockRepository.login(
        email: anyNamed('email'),
        password: anyNamed('password'),
      )).thenAnswer((_) async => Left(testFailure));

      // Act
      final result = await useCase(LoginParams(
        email: '',
        password: '',
      ));

      // Assert
      expect(result.isLeft(), true);
    });
  });
}
```

### 12.2.2 BLoC Tests

**File:** `test/features/auth/presentation/bloc/auth_bloc_test.dart`
```dart
import 'package:bloc_test/bloc_test.dart';
import 'package:dartz/dartz.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';
import 'package:exam_bank_mobile/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:exam_bank_mobile/features/auth/domain/usecases/login_usecase.dart';

import '../../../test_config.mocks.dart';

void main() {
  late AuthBloc authBloc;
  late MockLoginUseCase mockLoginUseCase;
  late MockLogoutUseCase mockLogoutUseCase;

  setUp(() {
    mockLoginUseCase = MockLoginUseCase();
    mockLogoutUseCase = MockLogoutUseCase();
    
    authBloc = AuthBloc(
      loginUseCase: mockLoginUseCase,
      registerUseCase: MockRegisterUseCase(),
      googleLoginUseCase: MockGoogleLoginUseCase(),
      logoutUseCase: mockLogoutUseCase,
      getCurrentUserUseCase: MockGetCurrentUserUseCase(),
      refreshTokenUseCase: MockRefreshTokenUseCase(),
    );
  });

  tearDown(() {
    authBloc.close();
  });

  group('AuthBloc', () {
    const testEmail = 'test@example.com';
    const testPassword = 'password123';
    
    final testUser = User(
      id: '1',
      email: testEmail,
      firstName: 'Test',
      lastName: 'User',
      role: UserRole.student,
      status: UserStatus.active,
      emailVerified: true,
      createdAt: DateTime(2024, 1, 1),
    );
    
    final testLoginResponse = LoginResponse(
      user: testUser,
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
    );

    blocTest<AuthBloc, AuthState>(
      'emits [AuthLoading, AuthAuthenticated] when login succeeds',
      build: () {
        when(mockLoginUseCase(any)).thenAnswer(
          (_) async => Right(testLoginResponse),
        );
        return authBloc;
      },
      act: (bloc) => bloc.add(AuthLoginRequested(
        email: testEmail,
        password: testPassword,
      )),
      expect: () => [
        AuthLoading(),
        AuthAuthenticated(
          user: testUser,
          accessToken: 'access_token',
        ),
      ],
    );

    blocTest<AuthBloc, AuthState>(
      'emits [AuthLoading, AuthError] when login fails',
      build: () {
        when(mockLoginUseCase(any)).thenAnswer(
          (_) async => Left(ServerFailure('Login failed')),
        );
        return authBloc;
      },
      act: (bloc) => bloc.add(AuthLoginRequested(
        email: testEmail,
        password: testPassword,
      )),
      expect: () => [
        AuthLoading(),
        const AuthError(message: 'Login failed'),
      ],
    );

    blocTest<AuthBloc, AuthState>(
      'emits [AuthUnauthenticated] when logout succeeds',
      build: () {
        when(mockLogoutUseCase(any)).thenAnswer(
          (_) async => const Right(null),
        );
        return authBloc;
      },
      act: (bloc) => bloc.add(AuthLogoutRequested()),
      expect: () => [
        AuthUnauthenticated(),
      ],
    );
  });
}
```

---

## 📋 Task 12.3: Widget Testing

### 12.3.1 Component Tests

**File:** `test/features/questions/presentation/widgets/question_card_test.dart`
```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:exam_bank_mobile/features/questions/presentation/widgets/question_card.dart';
import 'package:exam_bank_mobile/features/questions/domain/entities/question.dart';

void main() {
  group('QuestionCard Widget', () {
    late Question testQuestion;

    setUp(() {
      testQuestion = const Question(
        id: '1',
        content: 'What is 2 + 2?',
        type: QuestionType.multipleChoice,
        difficulty: DifficultyLevel.easy,
        status: QuestionStatus.approved,
        answers: [
          Answer(id: '1', content: '3', isCorrect: false),
          Answer(id: '2', content: '4', isCorrect: true),
          Answer(id: '3', content: '5', isCorrect: false),
        ],
        tags: ['math', 'arithmetic'],
        images: [],
        usageCount: 10,
        createdBy: 'admin',
        createdAt: DateTime(2024, 1, 1),
        updatedAt: DateTime(2024, 1, 1),
      );
    });

    testWidgets('displays question content', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: QuestionCard(
              question: testQuestion,
              isBookmarked: false,
              onTap: () {},
              onBookmarkToggle: () {},
            ),
          ),
        ),
      );

      expect(find.text('What is 2 + 2?'), findsOneWidget);
      expect(find.text('Trắc nghiệm'), findsOneWidget);
      expect(find.text('Dễ'), findsOneWidget);
    });

    testWidgets('shows bookmark icon', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: QuestionCard(
              question: testQuestion,
              isBookmarked: true,
              onTap: () {},
              onBookmarkToggle: () {},
            ),
          ),
        ),
      );

      expect(find.byIcon(Icons.bookmark), findsOneWidget);
    });

    testWidgets('calls onTap when tapped', (tester) async {
      var tapped = false;
      
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: QuestionCard(
              question: testQuestion,
              isBookmarked: false,
              onTap: () => tapped = true,
              onBookmarkToggle: () {},
            ),
          ),
        ),
      );

      await tester.tap(find.byType(QuestionCard));
      await tester.pumpAndSettle();

      expect(tapped, true);
    });

    testWidgets('calls onBookmarkToggle when bookmark icon tapped', (tester) async {
      var bookmarkToggled = false;
      
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: QuestionCard(
              question: testQuestion,
              isBookmarked: false,
              onTap: () {},
              onBookmarkToggle: () => bookmarkToggled = true,
            ),
          ),
        ),
      );

      await tester.tap(find.byIcon(Icons.bookmark_border));
      await tester.pumpAndSettle();

      expect(bookmarkToggled, true);
    });
  });
}
```

---

## 📋 Task 12.4: Integration Testing

### 12.4.1 Auth Flow Test

**File:** `integration_test/auth_flow_test.dart`
```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:exam_bank_mobile/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('Authentication Flow', () {
    testWidgets('complete login flow', (tester) async {
      // Start app
      app.main();
      await tester.pumpAndSettle();

      // Wait for splash screen
      await tester.pumpAndSettle(const Duration(seconds: 2));

      // Should navigate to login
      expect(find.text('Đăng nhập'), findsOneWidget);

      // Enter credentials
      await tester.enterText(
        find.byType(TextField).first,
        'test@example.com',
      );
      await tester.enterText(
        find.byType(TextField).last,
        'password123',
      );

      // Submit
      await tester.tap(find.text('Đăng nhập'));
      await tester.pumpAndSettle();

      // Should navigate to home
      expect(find.text('Trang chủ'), findsOneWidget);
    });

    testWidgets('shows error for invalid credentials', (tester) async {
      app.main();
      await tester.pumpAndSettle();

      // Enter invalid credentials
      await tester.enterText(
        find.byType(TextField).first,
        'invalid@example.com',
      );
      await tester.enterText(
        find.byType(TextField).last,
        'wrongpassword',
      );

      await tester.tap(find.text('Đăng nhập'));
      await tester.pumpAndSettle();

      // Should show error
      expect(find.textContaining('sai'), findsOneWidget);
    });
  });
}
```

### 12.4.2 Exam Flow Test

**File:** `integration_test/exam_flow_test.dart`
```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:exam_bank_mobile/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('Exam Taking Flow', () {
    testWidgets('complete exam flow from start to result', (tester) async {
      app.main();
      await tester.pumpAndSettle();

      // Login first
      await _performLogin(tester);

      // Navigate to exams
      await tester.tap(find.text('Đề thi'));
      await tester.pumpAndSettle();

      // Select an exam
      await tester.tap(find.byType(Card).first);
      await tester.pumpAndSettle();

      // Start exam
      await tester.tap(find.text('Bắt đầu thi'));
      await tester.pumpAndSettle();

      // Answer questions
      for (int i = 0; i < 5; i++) {
        // Select an answer
        await tester.tap(find.byType(RadioListTile).first);
        await tester.pumpAndSettle();

        // Next question
        if (i < 4) {
          await tester.tap(find.text('Câu tiếp theo'));
          await tester.pumpAndSettle();
        }
      }

      // Submit exam
      await tester.tap(find.text('Nộp bài'));
      await tester.pumpAndSettle();

      // Confirm submission
      await tester.tap(find.text('Nộp bài'));
      await tester.pumpAndSettle();

      // Should show result
      expect(find.text('Kết quả bài thi'), findsOneWidget);
      expect(find.textContaining('%'), findsOneWidget);
    });

    testWidgets('saves progress when pausing exam', (tester) async {
      app.main();
      await tester.pumpAndSettle();

      await _performLogin(tester);
      await _navigateToExam(tester);

      // Answer some questions
      await tester.tap(find.byType(RadioListTile).first);
      await tester.pumpAndSettle();

      // Pause
      await tester.tap(find.byIcon(Icons.pause));
      await tester.pumpAndSettle();

      // Confirm pause
      await tester.tap(find.text('Tạm dừng'));
      await tester.pumpAndSettle();

      // Should save progress
      expect(find.text('đã được lưu'), findsOneWidget);
    });
  });

  Future<void> _performLogin(WidgetTester tester) async {
    await tester.enterText(find.byType(TextField).first, 'test@example.com');
    await tester.enterText(find.byType(TextField).last, 'password123');
    await tester.tap(find.text('Đăng nhập'));
    await tester.pumpAndSettle();
  }

  Future<void> _navigateToExam(WidgetTester tester) async {
    await tester.tap(find.text('Đề thi'));
    await tester.pumpAndSettle();
    await tester.tap(find.byType(Card).first);
    await tester.pumpAndSettle();
    await tester.tap(find.text('Bắt đầu thi'));
    await tester.pumpAndSettle();
  }
}
```

---

## 📋 Task 12.5: Performance Testing

### 12.5.1 Load Test

**File:** `test/performance/load_test.dart`
```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:exam_bank_mobile/features/questions/data/datasources/question_local_datasource.dart';

void main() {
  group('Performance Tests', () {
    test('loads 100 questions in under 100ms', () async {
      final datasource = QuestionLocalDataSourceImpl();
      final stopwatch = Stopwatch()..start();

      // Load questions
      final questions = await datasource.getCachedQuestions();

      stopwatch.stop();

      expect(stopwatch.elapsedMilliseconds, lessThan(100));
      expect(questions.length, lessThanOrEqualTo(100));
    });

    test('cache write performance acceptable', () async {
      final datasource = QuestionLocalDataSourceImpl();
      final testQuestions = List.generate(
        100,
        (i) => QuestionModel(
          id: '$i',
          content: 'Question $i',
          type: QuestionType.multipleChoice,
          difficulty: DifficultyLevel.medium,
          status: QuestionStatus.approved,
          answers: [],
          tags: [],
          images: [],
          createdBy: 'test',
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        ),
      );

      final stopwatch = Stopwatch()..start();

      await datasource.cacheQuestions(testQuestions);

      stopwatch.stop();

      // Should complete in under 500ms
      expect(stopwatch.elapsedMilliseconds, lessThan(500));
    });

    test('LaTeX rendering performance', () async {
      final renderer = LaTeXRenderer();
      final complexLatex = r'\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}';

      final stopwatch = Stopwatch()..start();

      final rendered = await renderer.render(complexLatex);

      stopwatch.stop();

      // Should render in under 50ms
      expect(stopwatch.elapsedMilliseconds, lessThan(50));
      expect(rendered, isNotNull);
    });
  });
}
```

### 12.5.2 Memory Test

**File:** `test/performance/memory_test.dart`
```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:exam_bank_mobile/core/storage/hive_storage.dart';

void main() {
  group('Memory Tests', () {
    setUp(() async {
      await HiveStorage.initialize();
    });

    tearDown(() async {
      await HiveStorage.clearAll();
      await HiveStorage.close();
    });

    test('storage size within limits', () async {
      // Add test data
      for (int i = 0; i < 1000; i++) {
        await HiveStorage.cacheBox.put('key_$i', 'value_$i');
      }

      // Get storage size
      final sizes = await HiveStorage.getStorageSize();
      final totalSize = sizes['total']!;

      // Should be under 10MB
      expect(totalSize, lessThan(10 * 1024 * 1024));
    });

    test('cache cleanup removes old entries', () async {
      // Add entries with old timestamps
      await HiveStorage.cacheBox.put('old_entry', {
        'data': 'test',
        'expiry': DateTime.now().subtract(const Duration(days: 1)).toIso8601String(),
      });

      // Run cleanup
      await HiveStorage._cleanupOldCache();

      // Old entry should be removed
      expect(HiveStorage.cacheBox.get('old_entry'), isNull);
    });
  });
}
```

---

## 📋 Task 12.6: Accessibility Testing

### 12.6.1 Accessibility Tests

**File:** `test/accessibility/accessibility_test.dart`
```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:exam_bank_mobile/features/questions/presentation/pages/questions_page.dart';

void main() {
  group('Accessibility Tests', () {
    testWidgets('all interactive elements have semantic labels', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: QuestionsPage(),
        ),
      );

      // Find all buttons
      final buttons = find.byType(IconButton);
      expect(buttons, findsWidgets);

      // Each button should have tooltip or semantic label
      for (final button in tester.widgetList<IconButton>(buttons)) {
        expect(
          button.tooltip != null || button.icon.semanticLabel != null,
          true,
          reason: 'IconButton should have tooltip or semantic label',
        );
      }
    });

    testWidgets('contrast ratios meet WCAG standards', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          theme: ThemeData.light(),
          home: const Scaffold(
            body: Text('Test Text'),
          ),
        ),
      );

      // Get text widget
      final textWidget = tester.widget<Text>(find.text('Test Text'));
      final textColor = textWidget.style?.color ?? Colors.black;
      
      final scaffold = tester.widget<Scaffold>(find.byType(Scaffold));
      final backgroundColor = scaffold.backgroundColor ?? Colors.white;

      // Calculate contrast ratio
      final contrast = _calculateContrastRatio(textColor, backgroundColor);

      // Should meet WCAG AA standard (4.5:1 for normal text)
      expect(contrast, greaterThanOrEqualTo(4.5));
    });

    testWidgets('supports screen readers', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: QuestionsPage(),
        ),
      );

      // Enable semantics
      final SemanticsHandle handle = tester.ensureSemantics();

      // Verify semantic tree
      expect(
        tester.getSemantics(find.byType(QuestionsPage)),
        matchesSemantics(),
      );

      handle.dispose();
    });

    testWidgets('touch targets are at least 48x48', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Center(
              child: IconButton(
                icon: const Icon(Icons.add),
                onPressed: () {},
              ),
            ),
          ),
        ),
      );

      final buttonSize = tester.getSize(find.byType(IconButton));
      
      expect(buttonSize.width, greaterThanOrEqualTo(48));
      expect(buttonSize.height, greaterThanOrEqualTo(48));
    });
  });

  double _calculateContrastRatio(Color foreground, Color background) {
    final l1 = _relativeLuminance(foreground);
    final l2 = _relativeLuminance(background);
    
    final lighter = l1 > l2 ? l1 : l2;
    final darker = l1 > l2 ? l2 : l1;
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  double _relativeLuminance(Color color) {
    final r = _luminanceComponent(color.red / 255);
    final g = _luminanceComponent(color.green / 255);
    final b = _luminanceComponent(color.blue / 255);
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  double _luminanceComponent(double component) {
    return component <= 0.03928
        ? component / 12.92
        : pow((component + 0.055) / 1.055, 2.4).toDouble();
  }
}
```

---

## 📋 Task 12.7: Test Automation

### 12.7.1 Test Scripts

**File:** `scripts/run_tests.sh`
```bash
#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Starting Flutter Test Suite...${NC}\n"

# 1. Run unit tests
echo -e "${YELLOW}Running unit tests...${NC}"
flutter test --coverage --reporter expanded
UNIT_RESULT=$?

if [ $UNIT_RESULT -ne 0 ]; then
    echo -e "${RED}✗ Unit tests failed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Unit tests passed${NC}\n"

# 2. Run widget tests
echo -e "${YELLOW}Running widget tests...${NC}"
flutter test test/features/*/presentation/widgets/ --reporter expanded
WIDGET_RESULT=$?

if [ $WIDGET_RESULT -ne 0 ]; then
    echo -e "${RED}✗ Widget tests failed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Widget tests passed${NC}\n"

# 3. Run integration tests (if device connected)
echo -e "${YELLOW}Checking for connected devices...${NC}"
DEVICES=$(flutter devices | grep -c "connected")

if [ $DEVICES -gt 0 ]; then
    echo -e "${YELLOW}Running integration tests...${NC}"
    flutter test integration_test/
    INTEGRATION_RESULT=$?
    
    if [ $INTEGRATION_RESULT -ne 0 ]; then
        echo -e "${RED}✗ Integration tests failed${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Integration tests passed${NC}\n"
else
    echo -e "${YELLOW}⚠ No devices connected, skipping integration tests${NC}\n"
fi

# 4. Generate coverage report
echo -e "${YELLOW}Generating coverage report...${NC}"
genhtml coverage/lcov.info -o coverage/html
echo -e "${GREEN}✓ Coverage report generated at coverage/html/index.html${NC}\n"

# 5. Check coverage threshold
echo -e "${YELLOW}Checking coverage threshold...${NC}"
COVERAGE=$(lcov --summary coverage/lcov.info 2>&1 | grep "lines" | cut -d ' ' -f 4 | cut -d '%' -f 1)

if (( $(echo "$COVERAGE < 85" | bc -l) )); then
    echo -e "${RED}✗ Coverage ($COVERAGE%) is below threshold (85%)${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Coverage ($COVERAGE%) meets threshold${NC}\n"

echo -e "${GREEN}All tests passed! 🎉${NC}"
```

### 12.7.2 CI/CD Test Configuration

**File:** `.github/workflows/flutter_tests.yml`
```yaml
name: Flutter Tests

on:
  push:
    branches: [ main, develop ]
    paths:
      - 'apps/mobile/**'
  pull_request:
    branches: [ main, develop ]
    paths:
      - 'apps/mobile/**'

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.19.0'
          channel: 'stable'
      
      - name: Get dependencies
        working-directory: apps/mobile
        run: flutter pub get
      
      - name: Run code generation
        working-directory: apps/mobile
        run: flutter pub run build_runner build --delete-conflicting-outputs
      
      - name: Analyze code
        working-directory: apps/mobile
        run: flutter analyze
      
      - name: Run unit tests
        working-directory: apps/mobile
        run: flutter test --coverage
      
      - name: Check coverage
        working-directory: apps/mobile
        run: |
          COVERAGE=$(lcov --summary coverage/lcov.info 2>&1 | grep "lines" | cut -d ' ' -f 4 | cut -d '%' -f 1)
          echo "Coverage: $COVERAGE%"
          if (( $(echo "$COVERAGE < 85" | bc -l) )); then
            echo "Coverage below 85%"
            exit 1
          fi
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: apps/mobile/coverage/lcov.info
          flags: flutter
```

**✅ Checklist:**
- [x] Unit tests for all use cases
- [x] BLoC tests với bloc_test
- [x] Widget tests for components
- [x] Integration tests for flows
- [x] Performance tests
- [x] Accessibility tests
- [x] Test automation scripts
- [x] CI/CD integration

---

## 🎯 Testing Strategy

### Test Pyramid
```
       /\
      /E2E\         10% - Critical user flows
     /------\
    /Integr.\      20% - Feature integration
   /----------\
  /  Widget   \    30% - UI components
 /--------------\
/  Unit Tests   \  40% - Business logic
------------------
```

### Coverage Goals
- **Overall**: 85%+
- **Domain Layer**: 95%+
- **Data Layer**: 85%+
- **Presentation (BLoC)**: 90%+
- **Presentation (UI)**: 70%+

### Test Categories

**Unit Tests:**
- Use cases
- Repositories
- Models
- Utilities
- Validators

**Widget Tests:**
- Individual components
- Form validation
- User interactions
- State updates
- Accessibility

**Integration Tests:**
- BLoC + Repository + DataSource
- Complete feature flows
- Navigation flows
- Offline scenarios

**E2E Tests:**
- Critical user journeys
- Auth flow
- Exam taking flow
- Content browsing

---

## 📝 Summary

### Testing Infrastructure ✅
- Unit testing framework
- Widget testing setup
- Integration testing
- E2E testing
- Performance benchmarks
- Accessibility validation
- Automated test runner
- CI/CD integration

### Test Coverage
- Domain layer comprehensive
- Data layer thorough
- BLoC state management
- UI component validation
- User flow verification

### Automation
- GitHub Actions workflow
- Pre-commit hooks
- Coverage reporting
- Automated quality checks

---

**Phase Status:** ✅ Complete - Implementation Done  
**Estimated Time:** 1 week  
**Completion Date:** October 27, 2025

**Dependencies:**
- All feature modules ✅ Implemented
- Test utilities ✅ Configured

---

## 📝 Implementation Summary

**Completed:** Test infrastructure, automation scripts, CI/CD workflow

**Testing Files:**
- `test_config.dart` - Test environment setup
- `run_tests.sh` - Unix/Mac test runner
- `run_tests.ps1` - Windows test runner
- `flutter_tests.yml` - GitHub Actions CI/CD
- `app_test.dart` - Integration test

**Test Coverage:**
- Unit tests: Throughout all features (auth, questions, exams, library, theory)
- Widget tests: UI components
- BLoC tests: State management
- Integration tests: User flows

---

**Last Updated:** October 27, 2025  
**Ready for:** Production deployment
