import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/features/main/presentation/widgets/bottom_navigation.dart';
import 'package:mobile/features/main/presentation/widgets/app_drawer.dart';
import 'package:mobile/core/navigation/routes.dart';
import 'package:mobile/core/navigation/back_button_handler.dart';

class MainShellPage extends StatelessWidget {
  final Widget child;

  const MainShellPage({
    super.key,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    final currentRoute = GoRouterState.of(context).uri.toString();
    final showAppBar = _shouldShowAppBar(currentRoute);
    final showDrawer = _shouldShowDrawer(currentRoute);

    return PopScope(
      canPop: false,
      onPopInvoked: (didPop) async {
        if (!didPop) {
          await BackButtonHandler.handleBackButton(context);
        }
      },
      child: Scaffold(
        appBar: showAppBar
            ? AppBar(
                title: Text(_getPageTitle(currentRoute)),
                actions: _getAppBarActions(context, currentRoute),
              )
            : null,
        drawer: showDrawer ? const AppDrawer() : null,
        body: child,
        bottomNavigationBar: const AppBottomNavigation(),
      ),
    );
  }

  bool _shouldShowAppBar(String route) {
    // Home page has custom app bar
    if (route == '/' || route == '/dashboard') return false;
    return true;
  }

  bool _shouldShowDrawer(String route) {
    // Only show drawer on main pages
    return route == '/' || 
           route == '/questions' ||
           route == '/exams' ||
           route == '/library' ||
           route == '/theory';
  }

  String _getPageTitle(String route) {
    if (route.startsWith('/questions')) return 'Câu hỏi';
    if (route.startsWith('/exams')) return 'Đề thi';
    if (route.startsWith('/library')) return 'Thư viện';
    if (route.startsWith('/theory')) return 'Lý thuyết';
    if (route.startsWith('/profile')) return 'Hồ sơ';
    return 'NyNus Exam Bank';
  }

  List<Widget> _getAppBarActions(BuildContext context, String route) {
    final actions = <Widget>[];

    // Search action for certain pages
    if (route == '/questions' || route == '/library') {
      actions.add(
        IconButton(
          icon: const Icon(Icons.search),
          onPressed: () {
            if (route == '/questions') {
              context.push('${Routes.questions}/search');
            } else if (route == '/library') {
              context.push('${Routes.library}/search');
            }
          },
        ),
      );
    }

    // Settings action
    if (!route.contains('/settings')) {
      actions.add(
        IconButton(
          icon: const Icon(Icons.settings),
          onPressed: () => context.push(Routes.settings),
        ),
      );
    }

    return actions;
  }
}

