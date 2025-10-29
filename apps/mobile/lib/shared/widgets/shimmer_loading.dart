import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

class ShimmerLoading extends StatelessWidget {
  final Widget child;
  final bool isLoading;
  final Color? baseColor;
  final Color? highlightColor;

  const ShimmerLoading({
    super.key,
    required this.child,
    required this.isLoading,
    this.baseColor,
    this.highlightColor,
  });

  @override
  Widget build(BuildContext context) {
    if (!isLoading) {
      return child;
    }

    return Shimmer.fromColors(
      baseColor: baseColor ?? Colors.grey[300]!,
      highlightColor: highlightColor ?? Colors.grey[100]!,
      child: child,
    );
  }
}

class ShimmerBox extends StatelessWidget {
  final double width;
  final double height;
  final BorderRadius? borderRadius;

  const ShimmerBox({
    super.key,
    required this.width,
    required this.height,
    this.borderRadius,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: borderRadius ?? BorderRadius.circular(4),
      ),
    );
  }
}

class ShimmerLine extends StatelessWidget {
  final double width;
  final double height;

  const ShimmerLine({
    super.key,
    required this.width,
    this.height = 16,
  });

  @override
  Widget build(BuildContext context) {
    return ShimmerBox(
      width: width,
      height: height,
      borderRadius: BorderRadius.circular(height / 2),
    );
  }
}

class ShimmerCircle extends StatelessWidget {
  final double size;

  const ShimmerCircle({
    super.key,
    required this.size,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: const BoxDecoration(
        color: Colors.white,
        shape: BoxShape.circle,
      ),
    );
  }
}

// Specific shimmer components for different content types
class QuestionCardShimmer extends StatelessWidget {
  const QuestionCardShimmer({super.key});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: ShimmerLoading(
          isLoading: true,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header row with badges
              Row(
                children: [
                  ShimmerBox(width: 60, height: 20, borderRadius: BorderRadius.circular(4)),
                  const SizedBox(width: 8),
                  ShimmerBox(width: 50, height: 20, borderRadius: BorderRadius.circular(4)),
                  const Spacer(),
                  const ShimmerCircle(size: 24),
                ],
              ),
              
              const SizedBox(height: 12),
              
              // Title lines
              const ShimmerLine(width: double.infinity, height: 18),
              const SizedBox(height: 8),
              const ShimmerLine(width: 250, height: 18),
              
              const SizedBox(height: 12),
              
              // Content lines
              const ShimmerLine(width: double.infinity, height: 14),
              const SizedBox(height: 6),
              const ShimmerLine(width: 300, height: 14),
              const SizedBox(height: 6),
              const ShimmerLine(width: 180, height: 14),
              
              const SizedBox(height: 16),
              
              // Answers preview
              Column(
                children: List.generate(3, (index) => Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Row(
                    children: [
                      const ShimmerCircle(size: 16),
                      const SizedBox(width: 12),
                      ShimmerLine(width: 200 - (index * 30), height: 14),
                    ],
                  ),
                )),
              ),
              
              const SizedBox(height: 16),
              
              // Footer with metadata
              Row(
                children: [
                  const ShimmerLine(width: 80, height: 12),
                  const SizedBox(width: 16),
                  const ShimmerLine(width: 60, height: 12),
                  const Spacer(),
                  ShimmerBox(width: 24, height: 24, borderRadius: BorderRadius.circular(12)),
                  const SizedBox(width: 8),
                  ShimmerBox(width: 24, height: 24, borderRadius: BorderRadius.circular(12)),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class ExamCardShimmer extends StatelessWidget {
  const ExamCardShimmer({super.key});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: ShimmerLoading(
          isLoading: true,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header with badges
              Row(
                children: [
                  ShimmerBox(width: 70, height: 20, borderRadius: BorderRadius.circular(4)),
                  const SizedBox(width: 8),
                  ShimmerBox(width: 60, height: 20, borderRadius: BorderRadius.circular(4)),
                  const Spacer(),
                  const ShimmerCircle(size: 24),
                ],
              ),
              
              const SizedBox(height: 12),
              
              // Title
              const ShimmerLine(width: double.infinity, height: 20),
              const SizedBox(height: 8),
              const ShimmerLine(width: 280, height: 20),
              
              const SizedBox(height: 12),
              
              // Description
              const ShimmerLine(width: double.infinity, height: 14),
              const SizedBox(height: 6),
              const ShimmerLine(width: 220, height: 14),
              
              const SizedBox(height: 16),
              
              // Metadata row
              Row(
                children: [
                  const ShimmerLine(width: 60, height: 12),
                  const SizedBox(width: 16),
                  const ShimmerLine(width: 50, height: 12),
                  const SizedBox(width: 16),
                  const ShimmerLine(width: 70, height: 12),
                ],
              ),
              
              const SizedBox(height: 16),
              
              // Tags
              Row(
                children: [
                  ShimmerBox(width: 60, height: 24, borderRadius: BorderRadius.circular(12)),
                  const SizedBox(width: 8),
                  ShimmerBox(width: 50, height: 24, borderRadius: BorderRadius.circular(12)),
                  const SizedBox(width: 8),
                  ShimmerBox(width: 70, height: 24, borderRadius: BorderRadius.circular(12)),
                ],
              ),
              
              const SizedBox(height: 16),
              
              // Action buttons
              Row(
                children: [
                  Expanded(
                    child: ShimmerBox(height: 36, width: double.infinity, borderRadius: BorderRadius.circular(8)),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ShimmerBox(height: 36, width: double.infinity, borderRadius: BorderRadius.circular(8)),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class ProfileStatsShimmer extends StatelessWidget {
  const ProfileStatsShimmer({super.key});

  @override
  Widget build(BuildContext context) {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      childAspectRatio: 1.2,
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      children: List.generate(4, (index) => Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: ShimmerLoading(
            isLoading: true,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const ShimmerCircle(size: 48),
                const SizedBox(height: 12),
                const ShimmerLine(width: 60, height: 24),
                const SizedBox(height: 4),
                const ShimmerLine(width: 80, height: 12),
              ],
            ),
          ),
        ),
      )),
    );
  }
}

class ListItemShimmer extends StatelessWidget {
  final bool showAvatar;
  final bool showTrailing;

  const ListItemShimmer({
    super.key,
    this.showAvatar = true,
    this.showTrailing = true,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: ShimmerLoading(
        isLoading: true,
        child: Row(
          children: [
            if (showAvatar) ...[
              const ShimmerCircle(size: 40),
              const SizedBox(width: 16),
            ],
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const ShimmerLine(width: double.infinity, height: 16),
                  const SizedBox(height: 6),
                  const ShimmerLine(width: 200, height: 14),
                ],
              ),
            ),
            if (showTrailing) ...[
              const SizedBox(width: 16),
              const ShimmerCircle(size: 24),
            ],
          ],
        ),
      ),
    );
  }
}

