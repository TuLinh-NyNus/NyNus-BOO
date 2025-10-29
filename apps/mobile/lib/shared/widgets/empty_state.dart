import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';

class EmptyState extends StatelessWidget {
  final String title;
  final String description;
  final IconData? icon;
  final String? lottieAsset;
  final Widget? action;
  final Color? iconColor;
  final double iconSize;

  const EmptyState({
    super.key,
    required this.title,
    required this.description,
    this.icon,
    this.lottieAsset,
    this.action,
    this.iconColor,
    this.iconSize = 64,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Icon or Lottie animation
            if (lottieAsset != null)
              Lottie.asset(
                lottieAsset!,
                width: 120,
                height: 120,
                fit: BoxFit.contain,
              )
            else if (icon != null)
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: (iconColor ?? Colors.grey[400])!.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  icon,
                  size: iconSize,
                  color: iconColor ?? Colors.grey[400],
                ),
              ),
            
            const SizedBox(height: 24),
            
            // Title
            Text(
              title,
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: Colors.grey[700],
                  ),
              textAlign: TextAlign.center,
            ),
            
            const SizedBox(height: 12),
            
            // Description
            Text(
              description,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Colors.grey[600],
                    height: 1.5,
                  ),
              textAlign: TextAlign.center,
            ),
            
            // Action button
            if (action != null) ...[
              const SizedBox(height: 32),
              action!,
            ],
          ],
        ),
      ),
    );
  }
}

// Specific empty states for different features
class QuestionsEmptyState extends StatelessWidget {
  final VoidCallback? onRefresh;
  final VoidCallback? onClearFilters;
  final bool hasFilters;

  const QuestionsEmptyState({
    super.key,
    this.onRefresh,
    this.onClearFilters,
    this.hasFilters = false,
  });

  @override
  Widget build(BuildContext context) {
    return EmptyState(
      icon: Icons.quiz_outlined,
      iconColor: Colors.blue,
      title: hasFilters ? 'Không tìm thấy câu hỏi' : 'Chưa có câu hỏi',
      description: hasFilters 
          ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để tìm thấy câu hỏi phù hợp.'
          : 'Hiện tại chưa có câu hỏi nào. Hãy quay lại sau hoặc thử tải lại trang.',
      action: hasFilters && onClearFilters != null
          ? Column(
              children: [
                FilledButton.icon(
                  onPressed: onClearFilters,
                  icon: const Icon(Icons.clear_all),
                  label: const Text('Xóa bộ lọc'),
                ),
                const SizedBox(height: 12),
                OutlinedButton.icon(
                  onPressed: onRefresh,
                  icon: const Icon(Icons.refresh),
                  label: const Text('Tải lại'),
                ),
              ],
            )
          : FilledButton.icon(
              onPressed: onRefresh,
              icon: const Icon(Icons.refresh),
              label: const Text('Tải lại'),
            ),
    );
  }
}

class ExamsEmptyState extends StatelessWidget {
  final VoidCallback? onRefresh;
  final VoidCallback? onClearFilters;
  final bool hasFilters;

  const ExamsEmptyState({
    super.key,
    this.onRefresh,
    this.onClearFilters,
    this.hasFilters = false,
  });

  @override
  Widget build(BuildContext context) {
    return EmptyState(
      icon: Icons.assignment_outlined,
      iconColor: Colors.green,
      title: hasFilters ? 'Không tìm thấy đề thi' : 'Chưa có đề thi',
      description: hasFilters 
          ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để tìm thấy đề thi phù hợp.'
          : 'Hiện tại chưa có đề thi nào. Hãy quay lại sau hoặc thử tải lại trang.',
      action: hasFilters && onClearFilters != null
          ? Column(
              children: [
                FilledButton.icon(
                  onPressed: onClearFilters,
                  icon: const Icon(Icons.clear_all),
                  label: const Text('Xóa bộ lọc'),
                ),
                const SizedBox(height: 12),
                OutlinedButton.icon(
                  onPressed: onRefresh,
                  icon: const Icon(Icons.refresh),
                  label: const Text('Tải lại'),
                ),
              ],
            )
          : FilledButton.icon(
              onPressed: onRefresh,
              icon: const Icon(Icons.refresh),
              label: const Text('Tải lại'),
            ),
    );
  }
}

class LibraryEmptyState extends StatelessWidget {
  final String type; // 'saved', 'history', 'downloads', 'notes'
  final VoidCallback? onAction;

  const LibraryEmptyState({
    super.key,
    required this.type,
    this.onAction,
  });

  @override
  Widget build(BuildContext context) {
    final config = _getConfig(type);
    
    return EmptyState(
      icon: config['icon'] as IconData,
      iconColor: config['color'] as Color,
      title: config['title'] as String,
      description: config['description'] as String,
      action: onAction != null
          ? FilledButton.icon(
              onPressed: onAction,
              icon: Icon(config['actionIcon'] as IconData),
              label: Text(config['actionLabel'] as String),
            )
          : null,
    );
  }

  Map<String, dynamic> _getConfig(String type) {
    switch (type) {
      case 'saved':
        return {
          'icon': Icons.bookmark_outline,
          'color': Colors.orange,
          'title': 'Chưa có mục đã lưu',
          'description': 'Lưu câu hỏi và đề thi yêu thích để xem lại sau.',
          'actionIcon': Icons.explore,
          'actionLabel': 'Khám phá ngay',
        };
      case 'history':
        return {
          'icon': Icons.history,
          'color': Colors.purple,
          'title': 'Chưa có lịch sử',
          'description': 'Lịch sử hoạt động của bạn sẽ hiển thị ở đây.',
          'actionIcon': Icons.quiz,
          'actionLabel': 'Bắt đầu học',
        };
      case 'downloads':
        return {
          'icon': Icons.download_outlined,
          'color': Colors.blue,
          'title': 'Chưa có tài liệu tải xuống',
          'description': 'Tải xuống đề thi để học offline khi không có mạng.',
          'actionIcon': Icons.download,
          'actionLabel': 'Tìm tài liệu',
        };
      case 'notes':
        return {
          'icon': Icons.note_outlined,
          'color': Colors.teal,
          'title': 'Chưa có ghi chú',
          'description': 'Tạo ghi chú để lưu lại những kiến thức quan trọng.',
          'actionIcon': Icons.add,
          'actionLabel': 'Tạo ghi chú',
        };
      default:
        return {
          'icon': Icons.inbox_outlined,
          'color': Colors.grey,
          'title': 'Trống',
          'description': 'Không có dữ liệu để hiển thị.',
          'actionIcon': Icons.refresh,
          'actionLabel': 'Tải lại',
        };
    }
  }
}

class SearchEmptyState extends StatelessWidget {
  final String query;
  final VoidCallback? onClearSearch;

  const SearchEmptyState({
    super.key,
    required this.query,
    this.onClearSearch,
  });

  @override
  Widget build(BuildContext context) {
    return EmptyState(
      icon: Icons.search_off,
      iconColor: Colors.orange,
      title: 'Không tìm thấy kết quả',
      description: 'Không tìm thấy kết quả nào cho "$query".\nThử tìm kiếm với từ khóa khác.',
      action: onClearSearch != null
          ? FilledButton.icon(
              onPressed: onClearSearch,
              icon: const Icon(Icons.clear),
              label: const Text('Xóa tìm kiếm'),
            )
          : null,
    );
  }
}

class ErrorState extends StatelessWidget {
  final String title;
  final String description;
  final VoidCallback? onRetry;
  final IconData icon;
  final Color iconColor;

  const ErrorState({
    super.key,
    this.title = 'Đã xảy ra lỗi',
    this.description = 'Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.',
    this.onRetry,
    this.icon = Icons.error_outline,
    this.iconColor = Colors.red,
  });

  @override
  Widget build(BuildContext context) {
    return EmptyState(
      icon: icon,
      iconColor: iconColor,
      title: title,
      description: description,
      action: onRetry != null
          ? FilledButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh),
              label: const Text('Thử lại'),
            )
          : null,
    );
  }
}

class NetworkErrorState extends StatelessWidget {
  final VoidCallback? onRetry;

  const NetworkErrorState({
    super.key,
    this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    return ErrorState(
      icon: Icons.wifi_off,
      iconColor: Colors.orange,
      title: 'Không có kết nối mạng',
      description: 'Vui lòng kiểm tra kết nối internet và thử lại.',
      onRetry: onRetry,
    );
  }
}




