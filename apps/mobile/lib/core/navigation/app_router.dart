import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/core/navigation/routes.dart';
import 'package:mobile/core/navigation/page_transitions.dart';
import 'package:mobile/features/auth/presentation/pages/login_page.dart';
import 'package:mobile/features/auth/presentation/pages/register_page.dart';
import 'package:mobile/features/auth/presentation/pages/active_sessions_page.dart';
import 'package:mobile/features/main/presentation/pages/main_shell_page.dart';

// Navigator keys
final GlobalKey<NavigatorState> rootNavigatorKey = GlobalKey<NavigatorState>();
final GlobalKey<NavigatorState> shellNavigatorKey = GlobalKey<NavigatorState>();

class AppRouter {
  static GoRouter createRouter({
    required bool isAuthenticated,
    required VoidCallback onAuthStateChange,
  }) {
    return GoRouter(
      navigatorKey: rootNavigatorKey,
      initialLocation: Routes.splash,
      debugLogDiagnostics: true,
      
      // Redirect logic
      redirect: (context, state) {
        final isAuthRoute = state.matchedLocation == Routes.login ||
                           state.matchedLocation == Routes.register ||
                           state.matchedLocation == Routes.splash;
        
        // If not authenticated and trying to access protected route
        if (!isAuthenticated && !isAuthRoute) {
          return '${Routes.login}?redirect=${Uri.encodeComponent(state.uri.toString())}';
        }
        
        // If authenticated and trying to access auth routes
        if (isAuthenticated && isAuthRoute && state.matchedLocation != Routes.splash) {
          return Routes.home;
        }
        
        return null;
      },
      
      // Error handling
      errorBuilder: (context, state) => Scaffold(
        appBar: AppBar(title: const Text('Error')),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 64, color: Colors.red),
              const SizedBox(height: 16),
              Text(
                'Page not found',
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              const SizedBox(height: 8),
              Text(state.error?.toString() ?? 'Unknown error'),
              const SizedBox(height: 24),
              FilledButton(
                onPressed: () => context.go(Routes.home),
                child: const Text('Go Home'),
              ),
            ],
          ),
        ),
      ),
      
      // Routes
      routes: [
        // Splash
        GoRoute(
          path: Routes.splash,
          name: 'splash',
          pageBuilder: (context, state) => CustomTransitionPage(
            key: state.pageKey,
            child: const Scaffold(
              body: Center(
                child: CircularProgressIndicator(),
              ),
            ),
            transitionsBuilder: PageTransitions.fade,
          ),
        ),
        
        // Auth routes
        GoRoute(
          path: Routes.login,
          name: 'login',
          pageBuilder: (context, state) => CustomTransitionPage(
            key: state.pageKey,
            child: const LoginPage(),
            transitionsBuilder: PageTransitions.slideFromBottom,
          ),
        ),
        
        GoRoute(
          path: Routes.register,
          name: 'register',
          pageBuilder: (context, state) => CustomTransitionPage(
            key: state.pageKey,
            child: const RegisterPage(),
            transitionsBuilder: PageTransitions.slideFromRight,
          ),
        ),
        
        // Main shell with bottom navigation
        ShellRoute(
          navigatorKey: shellNavigatorKey,
          builder: (context, state, child) => MainShellPage(child: child),
          routes: [
            // Home/Dashboard
            GoRoute(
              path: Routes.home,
              name: 'home',
              pageBuilder: (context, state) => const NoTransitionPage(
                child: Scaffold(
                  body: Center(child: Text('Dashboard - Coming Soon')),
                ),
              ),
            ),
            
            // Questions
            GoRoute(
              path: Routes.questions,
              name: 'questions',
              pageBuilder: (context, state) => const NoTransitionPage(
                child: Scaffold(
                  body: Center(child: Text('Questions - Coming Soon')),
                ),
              ),
            ),
            
            // Exams
            GoRoute(
              path: Routes.exams,
              name: 'exams',
              pageBuilder: (context, state) => const NoTransitionPage(
                child: Scaffold(
                  body: Center(child: Text('Exams - Coming Soon')),
                ),
              ),
            ),
            
            // Library
            GoRoute(
              path: Routes.library,
              name: 'library',
              pageBuilder: (context, state) => const NoTransitionPage(
                child: Scaffold(
                  body: Center(child: Text('Library - Coming Soon')),
                ),
              ),
            ),
            
            // Theory
            GoRoute(
              path: Routes.theory,
              name: 'theory',
              pageBuilder: (context, state) => const NoTransitionPage(
                child: Scaffold(
                  body: Center(child: Text('Theory - Coming Soon')),
                ),
              ),
            ),
            
            // Profile
            GoRoute(
              path: Routes.profile,
              name: 'profile',
              pageBuilder: (context, state) => const NoTransitionPage(
                child: Scaffold(
                  body: Center(child: Text('Profile - Coming Soon')),
                ),
              ),
              routes: [
                GoRoute(
                  path: 'sessions',
                  name: 'sessions',
                  pageBuilder: (context, state) => CustomTransitionPage(
                    key: state.pageKey,
                    child: const ActiveSessionsPage(),
                    transitionsBuilder: PageTransitions.slideFromRight,
                  ),
                ),
              ],
            ),
          ],
        ),
        
        // Settings (outside shell for full screen)
        GoRoute(
          path: Routes.settings,
          name: 'settings',
          parentNavigatorKey: rootNavigatorKey,
          pageBuilder: (context, state) => CustomTransitionPage(
            key: state.pageKey,
            child: const Scaffold(
              body: Center(child: Text('Settings - Coming Soon')),
            ),
            transitionsBuilder: PageTransitions.slideFromRight,
          ),
        ),
      ],
    );
  }
}

