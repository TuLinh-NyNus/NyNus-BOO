import 'package:flutter/material.dart';
import 'package:mobile/core/storage/hive_storage.dart';
import 'package:mobile/core/storage/cache_manager.dart';

class StorageSettingsPage extends StatefulWidget {
  static const String routeName = '/settings/storage';
  
  const StorageSettingsPage({super.key});

  @override
  State<StorageSettingsPage> createState() => _StorageSettingsPageState();
}

class _StorageSettingsPageState extends State<StorageSettingsPage> {
  Map<String, int>? _storageSize;
  CacheStats? _cacheStats;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadStorageInfo();
  }

  Future<void> _loadStorageInfo() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final storageSize = await HiveStorage.getStorageSize();
      final cacheStats = await CacheManager.getCacheStats();

      setState(() {
        _storageSize = storageSize;
        _cacheStats = cacheStats;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Quản lý bộ nhớ'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadStorageInfo,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // Total Storage
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Tổng dung lượng',
                            style: Theme.of(context).textTheme.titleMedium,
                          ),
                          const SizedBox(height: 16),
                          Center(
                            child: Column(
                              children: [
                                Text(
                                  _formatBytes(_storageSize?['total'] ?? 0),
                                  style: Theme.of(context).textTheme.displaySmall?.copyWith(
                                    color: Theme.of(context).colorScheme.primary,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  'được sử dụng',
                                  style: Theme.of(context).textTheme.bodyMedium,
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Storage Breakdown
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Chi tiết',
                            style: Theme.of(context).textTheme.titleMedium,
                          ),
                          const SizedBox(height: 16),
                          _buildStorageItem('Người dùng', _storageSize?['user'] ?? 0, Icons.person_outline),
                          _buildStorageItem('Câu hỏi', _storageSize?['questions'] ?? 0, Icons.quiz_outlined),
                          _buildStorageItem('Đề thi', _storageSize?['exams'] ?? 0, Icons.assignment_outlined),
                          _buildStorageItem('Bộ nhớ đệm', _storageSize?['cache'] ?? 0, Icons.storage),
                          _buildStorageItem('Cài đặt', _storageSize?['settings'] ?? 0, Icons.settings),
                          _buildStorageItem('Hàng đợi đồng bộ', _storageSize?['syncQueue'] ?? 0, Icons.sync),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Cache Info
                  if (_cacheStats != null)
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Bộ nhớ đệm',
                              style: Theme.of(context).textTheme.titleMedium,
                            ),
                            const SizedBox(height: 16),
                            _buildCacheInfo('Tổng số mục', '${_cacheStats!.totalEntries}'),
                            _buildCacheInfo('Mục hợp lệ', '${_cacheStats!.validEntries}'),
                            _buildCacheInfo('Mục đã hết hạn', '${_cacheStats!.expiredEntries}'),
                            _buildCacheInfo('Dung lượng', _cacheStats!.formattedSize),
                          ],
                        ),
                      ),
                    ),

                  const SizedBox(height: 16),

                  // Clear Actions
                  FilledButton.tonal(
                    onPressed: _clearCache,
                    child: const Text('Xóa bộ nhớ đệm'),
                  ),

                  const SizedBox(height: 8),

                  OutlinedButton(
                    onPressed: _clearAllData,
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Theme.of(context).colorScheme.error,
                    ),
                    child: const Text('Xóa tất cả dữ liệu'),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildStorageItem(String label, int bytes, IconData icon) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Icon(icon, size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Text(label),
          ),
          Text(
            _formatBytes(bytes),
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCacheInfo(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label),
          Text(
            value,
            style: const TextStyle(fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }

  String _formatBytes(int bytes) {
    if (bytes < 1024) return '$bytes B';
    if (bytes < 1024 * 1024) {
      return '${(bytes / 1024).toStringAsFixed(1)} KB';
    }
    if (bytes < 1024 * 1024 * 1024) {
      return '${(bytes / (1024 * 1024)).toStringAsFixed(1)} MB';
    }
    return '${(bytes / (1024 * 1024 * 1024)).toStringAsFixed(1)} GB';
  }

  Future<void> _clearCache() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Xóa bộ nhớ đệm'),
        content: const Text('Bạn có chắc muốn xóa tất cả bộ nhớ đệm?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Hủy'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Xóa'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      await CacheManager.clearAllCache();
      await _loadStorageInfo();
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Đã xóa bộ nhớ đệm'),
            backgroundColor: Colors.green,
          ),
        );
      }
    }
  }

  Future<void> _clearAllData() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Xóa tất cả dữ liệu'),
        content: const Text(
          'Cảnh báo: Thao tác này sẽ xóa TẤT CẢ dữ liệu đã lưu. '
          'Bạn có chắc chắn muốn tiếp tục?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Hủy'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            style: FilledButton.styleFrom(
              backgroundColor: Theme.of(context).colorScheme.error,
            ),
            child: const Text('Xóa tất cả'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      await HiveStorage.clearAll();
      await _loadStorageInfo();
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Đã xóa tất cả dữ liệu'),
            backgroundColor: Colors.green,
          ),
        );
      }
    }
  }
}

