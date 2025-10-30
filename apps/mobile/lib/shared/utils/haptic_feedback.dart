import 'package:flutter/services.dart';

class HapticFeedbackUtil {
  // Light impact - for UI interactions like button taps
  static void lightImpact() {
    HapticFeedback.lightImpact();
  }

  // Medium impact - for more significant actions
  static void mediumImpact() {
    HapticFeedback.mediumImpact();
  }

  // Heavy impact - for important actions or errors
  static void heavyImpact() {
    HapticFeedback.heavyImpact();
  }

  // Selection click - for picker wheels, toggles
  static void selectionClick() {
    HapticFeedback.selectionClick();
  }

  // Vibrate - for notifications or alerts
  static void vibrate() {
    HapticFeedback.vibrate();
  }

  // Success feedback
  static void success() {
    HapticFeedback.lightImpact();
  }

  // Error feedback
  static void error() {
    HapticFeedback.heavyImpact();
  }

  // Warning feedback
  static void warning() {
    HapticFeedback.mediumImpact();
  }

  // Button press feedback
  static void buttonPress() {
    HapticFeedback.lightImpact();
  }

  // Toggle feedback
  static void toggle() {
    HapticFeedback.selectionClick();
  }

  // Long press feedback
  static void longPress() {
    HapticFeedback.mediumImpact();
  }

  // Swipe feedback
  static void swipe() {
    HapticFeedback.lightImpact();
  }

  // Refresh feedback
  static void refresh() {
    HapticFeedback.mediumImpact();
  }

  // Delete feedback
  static void delete() {
    HapticFeedback.heavyImpact();
  }
}

// Extension on common widgets for easy haptic feedback
extension HapticFeedbackExtension on Widget {
  Widget withHapticFeedback({
    VoidCallback? onTap,
    HapticFeedbackType type = HapticFeedbackType.light,
  }) {
    return GestureDetector(
      onTap: () {
        _triggerHaptic(type);
        onTap?.call();
      },
      child: this,
    );
  }

  void _triggerHaptic(HapticFeedbackType type) {
    switch (type) {
      case HapticFeedbackType.light:
        HapticFeedbackUtil.lightImpact();
        break;
      case HapticFeedbackType.medium:
        HapticFeedbackUtil.mediumImpact();
        break;
      case HapticFeedbackType.heavy:
        HapticFeedbackUtil.heavyImpact();
        break;
      case HapticFeedbackType.selection:
        HapticFeedbackUtil.selectionClick();
        break;
      case HapticFeedbackType.success:
        HapticFeedbackUtil.success();
        break;
      case HapticFeedbackType.error:
        HapticFeedbackUtil.error();
        break;
      case HapticFeedbackType.warning:
        HapticFeedbackUtil.warning();
        break;
    }
  }
}

enum HapticFeedbackType {
  light,
  medium,
  heavy,
  selection,
  success,
  error,
  warning,
}

// Mixin for widgets that need haptic feedback
mixin HapticFeedbackMixin {
  void triggerHaptic(HapticFeedbackType type) {
    switch (type) {
      case HapticFeedbackType.light:
        HapticFeedbackUtil.lightImpact();
        break;
      case HapticFeedbackType.medium:
        HapticFeedbackUtil.mediumImpact();
        break;
      case HapticFeedbackType.heavy:
        HapticFeedbackUtil.heavyImpact();
        break;
      case HapticFeedbackType.selection:
        HapticFeedbackUtil.selectionClick();
        break;
      case HapticFeedbackType.success:
        HapticFeedbackUtil.success();
        break;
      case HapticFeedbackType.error:
        HapticFeedbackUtil.error();
        break;
      case HapticFeedbackType.warning:
        HapticFeedbackUtil.warning();
        break;
    }
  }

  void onButtonPress() => triggerHaptic(HapticFeedbackType.light);
  void onToggle() => triggerHaptic(HapticFeedbackType.selection);
  void onSuccess() => triggerHaptic(HapticFeedbackType.success);
  void onError() => triggerHaptic(HapticFeedbackType.error);
  void onWarning() => triggerHaptic(HapticFeedbackType.warning);
  void onLongPress() => triggerHaptic(HapticFeedbackType.medium);
  void onDelete() => triggerHaptic(HapticFeedbackType.heavy);
}

