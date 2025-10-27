import 'package:flutter/material.dart';
import 'dart:math' as math;

class CircularProgressChart extends StatelessWidget {
  final double percentage;
  final String centerText;
  final Color? progressColor;
  final Color? backgroundColor;
  final double strokeWidth;

  const CircularProgressChart({
    super.key,
    required this.percentage,
    required this.centerText,
    this.progressColor,
    this.backgroundColor,
    this.strokeWidth = 12.0,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final defaultProgressColor = progressColor ?? theme.colorScheme.primary;
    final defaultBackgroundColor = backgroundColor ?? Colors.grey[200]!;

    return CustomPaint(
      painter: _CircularProgressPainter(
        percentage: percentage,
        progressColor: defaultProgressColor,
        backgroundColor: defaultBackgroundColor,
        strokeWidth: strokeWidth,
      ),
      child: Center(
        child: Text(
          centerText,
          style: theme.textTheme.headlineMedium?.copyWith(
            fontWeight: FontWeight.bold,
            color: defaultProgressColor,
          ),
        ),
      ),
    );
  }
}

class _CircularProgressPainter extends CustomPainter {
  final double percentage;
  final Color progressColor;
  final Color backgroundColor;
  final double strokeWidth;

  _CircularProgressPainter({
    required this.percentage,
    required this.progressColor,
    required this.backgroundColor,
    required this.strokeWidth,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = (size.width - strokeWidth) / 2;

    // Draw background circle
    final backgroundPaint = Paint()
      ..color = backgroundColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.round;

    canvas.drawCircle(center, radius, backgroundPaint);

    // Draw progress arc
    final progressPaint = Paint()
      ..color = progressColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.round;

    final startAngle = -math.pi / 2; // Start from top
    final sweepAngle = 2 * math.pi * (percentage / 100);

    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      startAngle,
      sweepAngle,
      false,
      progressPaint,
    );
  }

  @override
  bool shouldRepaint(_CircularProgressPainter oldDelegate) {
    return percentage != oldDelegate.percentage ||
        progressColor != oldDelegate.progressColor ||
        backgroundColor != oldDelegate.backgroundColor;
  }
}

