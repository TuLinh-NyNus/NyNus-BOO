import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/features/auth/domain/entities/user.dart';

class RouteGuards {
  // Auth guard
  static String? authGuard(
    BuildContext context,
    GoRouterState state,
    bool isAuthenticated,
  ) {
    final protectedRoutes = [
      '/profile',
      '/exams',
      '/library',
      '/admin',
      '/theory',
    ];
    
    final isProtectedRoute = protectedRoutes.any(
      (route) => state.matchedLocation.startsWith(route),
    );
    
    if (isProtectedRoute && !isAuthenticated) {
      return '/login?redirect=${Uri.encodeComponent(state.uri.toString())}';
    }
    
    return null;
  }

  // Role guard
  static String? roleGuard(
    BuildContext context,
    GoRouterState state,
    UserRole userRole,
  ) {
    // Admin routes
    if (state.matchedLocation.startsWith('/admin')) {
      if (userRole != UserRole.admin) {
        return '/unauthorized';
      }
    }
    
    // Teacher routes (create/edit content)
    if (state.matchedLocation.contains('/create') || 
        state.matchedLocation.contains('/edit')) {
      if (userRole != UserRole.teacher && userRole != UserRole.admin) {
        return '/unauthorized';
      }
    }
    
    return null;
  }

  // Subscription guard (for premium features)
  static String? subscriptionGuard(
    BuildContext context,
    GoRouterState state,
    bool isPremium,
  ) {
    final premiumRoutes = [
      '/exams/premium',
      '/library/premium',
    ];
    
    final isPremiumRoute = premiumRoutes.any(
      (route) => state.matchedLocation.startsWith(route),
    );
    
    if (isPremiumRoute && !isPremium) {
      return '/subscription';
    }
    
    return null;
  }

  // Maintenance guard
  static String? maintenanceGuard(
    BuildContext context,
    GoRouterState state,
    bool isInMaintenance,
  ) {
    if (isInMaintenance && !state.matchedLocation.startsWith('/maintenance')) {
      return '/maintenance';
    }
    
    return null;
  }
  
  // Email verification guard
  static String? emailVerificationGuard(
    BuildContext context,
    GoRouterState state,
    bool isEmailVerified,
  ) {
    final requiresVerification = [
      '/exams',
      '/library',
    ];
    
    final requiresVerificationRoute = requiresVerification.any(
      (route) => state.matchedLocation.startsWith(route),
    );
    
    if (requiresVerificationRoute && !isEmailVerified) {
      return '/verify-email-required';
    }
    
    return null;
  }
}

