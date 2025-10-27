import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/core/navigation/models/route_params.dart';

class NavigationService {
  static final NavigationService _instance = NavigationService._internal();
  factory NavigationService() => _instance;
  NavigationService._internal();

  // Navigation methods
  void go(BuildContext context, String location, {Object? extra}) {
    context.go(location, extra: extra);
  }

  Future<T?> push<T>(BuildContext context, String location, {Object? extra}) {
    return context.push<T>(location, extra: extra);
  }

  void pop<T>(BuildContext context, [T? result]) {
    context.pop(result);
  }

  void replace(BuildContext context, String location, {Object? extra}) {
    context.replace(location, extra: extra);
  }

  // Named navigation
  void goNamed(
    BuildContext context,
    String name, {
    Map<String, String> pathParameters = const {},
    Map<String, dynamic> queryParameters = const {},
    Object? extra,
  }) {
    context.goNamed(
      name,
      pathParameters: pathParameters,
      queryParameters: queryParameters,
      extra: extra,
    );
  }

  Future<T?> pushNamed<T>(
    BuildContext context,
    String name, {
    Map<String, String> pathParameters = const {},
    Map<String, dynamic> queryParameters = const {},
    Object? extra,
  }) {
    return context.pushNamed<T>(
      name,
      pathParameters: pathParameters,
      queryParameters: queryParameters,
      extra: extra,
    );
  }

  // Utility methods
  bool canPop(BuildContext context) {
    return context.canPop();
  }

  void popUntil(BuildContext context, String location) {
    while (context.canPop()) {
      final currentLocation = GoRouterState.of(context).uri.toString();
      if (currentLocation == location) {
        break;
      }
      context.pop();
    }
  }

  // Question navigation helpers
  Future<void> navigateToQuestion(
    BuildContext context,
    String questionId, {
    bool fromExam = false,
  }) {
    return pushNamed(
      context,
      'questionDetail',
      pathParameters: {'id': questionId},
      queryParameters: {'fromExam': fromExam.toString()},
    );
  }

  // Exam navigation helpers
  Future<void> navigateToExam(BuildContext context, String examId) {
    return pushNamed(
      context,
      'examDetail',
      pathParameters: {'id': examId},
    );
  }

  Future<void> startExam(
    BuildContext context,
    String examId, {
    String? sessionId,
    bool resume = false,
  }) {
    return pushNamed(
      context,
      'examTaking',
      pathParameters: {'id': examId},
      queryParameters: {
        if (sessionId != null) 'sessionId': sessionId,
        'resume': resume.toString(),
      },
    );
  }

  void showExamResult(
    BuildContext context,
    String sessionId, {
    bool showReview = false,
  }) {
    goNamed(
      context,
      'examResult',
      pathParameters: {'sessionId': sessionId},
      extra: ExamResultData(
        sessionId: sessionId,
        showReview: showReview,
      ),
    );
  }

  // Library navigation helpers
  Future<void> navigateToLibraryItem(
    BuildContext context,
    String category,
    String itemId,
  ) {
    return pushNamed(
      context,
      'libraryItem',
      pathParameters: {
        'category': category,
        'id': itemId,
      },
    );
  }

  // Search navigation
  Future<void> navigateToSearch(
    BuildContext context, {
    String? initialQuery,
    Map<String, dynamic>? filters,
  }) {
    return pushNamed(
      context,
      'questionSearch',
      queryParameters: {
        if (initialQuery != null) 'q': initialQuery,
        if (filters != null) ...filters.map((k, v) => MapEntry(k, v.toString())),
      },
    );
  }
}

