import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';

class BackButtonHandler {
  static DateTime? _lastBackPress;
  static const Duration _exitDelay = Duration(seconds: 2);

  static Future<bool> handleBackButton(BuildContext context) async {
    // Check if we can pop
    if (context.canPop()) {
      context.pop();
      return false; // Don't exit app
    }
    
    // At root, confirm exit
    final now = DateTime.now();
    if (_lastBackPress == null || 
        now.difference(_lastBackPress!) > _exitDelay) {
      _lastBackPress = now;
      
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Nhấn lần nữa để thoát'),
            duration: Duration(seconds: 2),
          ),
        );
      }
      
      return false; // Don't exit yet
    }
    
    // Exit app
    await SystemNavigator.pop();
    return true;
  }

  // Use in PopScope (Flutter 3.12+)
  static Widget wrapWithBackHandler({
    required Widget child,
    Future<bool> Function()? onWillPop,
  }) {
    return PopScope(
      canPop: false,
      onPopInvoked: (bool didPop) async {
        if (!didPop && child is StatefulWidget) {
          // Handle custom back logic
        }
      },
      child: child,
    );
  }
}

