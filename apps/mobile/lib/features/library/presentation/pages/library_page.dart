import 'package:flutter/material.dart';

class LibraryPage extends StatefulWidget {
  const LibraryPage({super.key});

  @override
  State<LibraryPage> createState() => _LibraryPageState();
}

class _LibraryPageState extends State<LibraryPage>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          // Search Bar
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surface,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 4,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Tìm kiếm trong thư viện...',
                prefixIcon: const Icon(Icons.search),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 12,
                ),
              ),
            ),
          ),
          
          // Tab Bar
          Container(
            color: Theme.of(context).colorScheme.surface,
            child: TabBar(
              controller: _tabController,
              tabs: const [
                Tab(text: 'Đã lưu'),
                Tab(text: 'Lịch sử'),
                Tab(text: 'Tải xuống'),
                Tab(text: 'Ghi chú'),
              ],
            ),
          ),
          
          // Tab Views
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildSavedTab(),
                _buildHistoryTab(),
                _buildDownloadsTab(),
                _buildNotesTab(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSavedTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        _buildSectionHeader('Câu hỏi đã lưu', '25 câu hỏi'),
        const SizedBox(height: 12),
        ..._buildSavedQuestions(),
        
        const SizedBox(height: 24),
        _buildSectionHeader('Đề thi đã lưu', '8 đề thi'),
        const SizedBox(height: 12),
        ..._buildSavedExams(),
      ],
    );
  }

  Widget _buildHistoryTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        _buildSectionHeader('Hoạt động gần đây', 'Hôm nay'),
        const SizedBox(height: 12),
        ..._buildRecentActivities(),
      ],
    );
  }

  Widget _buildDownloadsTab() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.download_outlined,
            size: 64,
            color: Colors.grey[400],
          ),
          const SizedBox(height: 16),
          Text(
            'Chưa có tài liệu tải xuống',
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 8),
          Text(
            'Tải xuống đề thi để học offline',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Colors.grey[600],
                ),
          ),
        ],
      ),
    );
  }

  Widget _buildNotesTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        _buildSectionHeader('Ghi chú của tôi', '12 ghi chú'),
        const SizedBox(height: 12),
        ..._buildNotes(),
      ],
    );
  }

  Widget _buildSectionHeader(String title, String subtitle) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            Text(
              subtitle,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Colors.grey[600],
                  ),
            ),
          ],
        ),
        TextButton(
          onPressed: () {
            // TODO: Navigate to see all
          },
          child: const Text('Xem tất cả'),
        ),
      ],
    );
  }

  List<Widget> _buildSavedQuestions() {
    return List.generate(3, (index) {
      return Card(
        margin: const EdgeInsets.only(bottom: 8),
        child: ListTile(
          leading: CircleAvatar(
            backgroundColor: Colors.blue.withOpacity(0.1),
            child: const Icon(Icons.quiz, color: Colors.blue),
          ),
          title: Text('Câu hỏi Toán học số ${index + 1}'),
          subtitle: Text('Lưu ${index + 1} ngày trước'),
          trailing: IconButton(
            icon: const Icon(Icons.more_vert),
            onPressed: () => _showQuestionOptions(context),
          ),
          onTap: () {
            // TODO: Navigate to question detail
          },
        ),
      );
    });
  }

  List<Widget> _buildSavedExams() {
    return List.generate(2, (index) {
      return Card(
        margin: const EdgeInsets.only(bottom: 8),
        child: ListTile(
          leading: CircleAvatar(
            backgroundColor: Colors.green.withOpacity(0.1),
            child: const Icon(Icons.assignment, color: Colors.green),
          ),
          title: Text('Đề thi Vật lý - Lớp ${10 + index}'),
          subtitle: Text('Lưu ${index + 2} ngày trước'),
          trailing: IconButton(
            icon: const Icon(Icons.more_vert),
            onPressed: () => _showExamOptions(context),
          ),
          onTap: () {
            // TODO: Navigate to exam detail
          },
        ),
      );
    });
  }

  List<Widget> _buildRecentActivities() {
    final activities = [
      {
        'icon': Icons.quiz,
        'title': 'Làm câu hỏi Toán học',
        'subtitle': '2 giờ trước',
        'color': Colors.blue,
      },
      {
        'icon': Icons.assignment_turned_in,
        'title': 'Hoàn thành đề thi Vật lý',
        'subtitle': '5 giờ trước',
        'color': Colors.green,
      },
      {
        'icon': Icons.bookmark_add,
        'title': 'Lưu 3 câu hỏi Hóa học',
        'subtitle': '1 ngày trước',
        'color': Colors.orange,
      },
    ];

    return activities.map((activity) {
      return Card(
        margin: const EdgeInsets.only(bottom: 8),
        child: ListTile(
          leading: CircleAvatar(
            backgroundColor: (activity['color'] as Color).withOpacity(0.1),
            child: Icon(
              activity['icon'] as IconData,
              color: activity['color'] as Color,
            ),
          ),
          title: Text(activity['title'] as String),
          subtitle: Text(activity['subtitle'] as String),
        ),
      );
    }).toList();
  }

  List<Widget> _buildNotes() {
    return List.generate(4, (index) {
      return Card(
        margin: const EdgeInsets.only(bottom: 8),
        child: ListTile(
          leading: CircleAvatar(
            backgroundColor: Colors.purple.withOpacity(0.1),
            child: const Icon(Icons.note, color: Colors.purple),
          ),
          title: Text('Ghi chú ${index + 1}'),
          subtitle: Text('Cập nhật ${index + 1} ngày trước'),
          trailing: IconButton(
            icon: const Icon(Icons.more_vert),
            onPressed: () => _showNoteOptions(context),
          ),
          onTap: () {
            // TODO: Navigate to note detail
          },
        ),
      );
    });
  }

  void _showQuestionOptions(BuildContext context) {
    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.visibility),
              title: const Text('Xem câu hỏi'),
              onTap: () => Navigator.pop(context),
            ),
            ListTile(
              leading: const Icon(Icons.share),
              title: const Text('Chia sẻ'),
              onTap: () => Navigator.pop(context),
            ),
            ListTile(
              leading: const Icon(Icons.bookmark_remove),
              title: const Text('Bỏ lưu'),
              onTap: () => Navigator.pop(context),
            ),
          ],
        ),
      ),
    );
  }

  void _showExamOptions(BuildContext context) {
    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.visibility),
              title: const Text('Xem đề thi'),
              onTap: () => Navigator.pop(context),
            ),
            ListTile(
              leading: const Icon(Icons.play_arrow),
              title: const Text('Làm bài'),
              onTap: () => Navigator.pop(context),
            ),
            ListTile(
              leading: const Icon(Icons.download),
              title: const Text('Tải xuống'),
              onTap: () => Navigator.pop(context),
            ),
            ListTile(
              leading: const Icon(Icons.bookmark_remove),
              title: const Text('Bỏ lưu'),
              onTap: () => Navigator.pop(context),
            ),
          ],
        ),
      ),
    );
  }

  void _showNoteOptions(BuildContext context) {
    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.edit),
              title: const Text('Chỉnh sửa'),
              onTap: () => Navigator.pop(context),
            ),
            ListTile(
              leading: const Icon(Icons.share),
              title: const Text('Chia sẻ'),
              onTap: () => Navigator.pop(context),
            ),
            ListTile(
              leading: const Icon(Icons.delete),
              title: const Text('Xóa'),
              onTap: () => Navigator.pop(context),
            ),
          ],
        ),
      ),
    );
  }
}

