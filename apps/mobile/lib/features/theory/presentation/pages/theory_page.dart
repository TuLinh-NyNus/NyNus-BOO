import 'package:flutter/material.dart';

class TheoryPage extends StatefulWidget {
  const TheoryPage({super.key});

  @override
  State<TheoryPage> createState() => _TheoryPageState();
}

class _TheoryPageState extends State<TheoryPage> {
  String _selectedGrade = '10';
  String _selectedSubject = 'math';

  final Map<String, String> _subjects = {
    'math': 'Toán học',
    'physics': 'Vật lý',
    'chemistry': 'Hóa học',
    'biology': 'Sinh học',
    'literature': 'Văn học',
  };

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          // Header with filters
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
            child: Column(
              children: [
                // Search Bar
                TextField(
                  decoration: InputDecoration(
                    hintText: 'Tìm kiếm bài học...',
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
                
                const SizedBox(height: 16),
                
                // Filter chips
                Row(
                  children: [
                    // Grade filter
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        value: _selectedGrade,
                        decoration: const InputDecoration(
                          labelText: 'Lớp',
                          border: OutlineInputBorder(),
                        ),
                        items: ['10', '11', '12'].map((grade) {
                          return DropdownMenuItem(
                            value: grade,
                            child: Text('Lớp $grade'),
                          );
                        }).toList(),
                        onChanged: (value) {
                          setState(() {
                            _selectedGrade = value!;
                          });
                        },
                      ),
                    ),
                    
                    const SizedBox(width: 16),
                    
                    // Subject filter
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        value: _selectedSubject,
                        decoration: const InputDecoration(
                          labelText: 'Môn học',
                          border: OutlineInputBorder(),
                        ),
                        items: _subjects.entries.map((entry) {
                          return DropdownMenuItem(
                            value: entry.key,
                            child: Text(entry.value),
                          );
                        }).toList(),
                        onChanged: (value) {
                          setState(() {
                            _selectedSubject = value!;
                          });
                        },
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          
          // Content
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // Subject overview
                _buildSubjectOverview(),
                
                const SizedBox(height: 24),
                
                // Chapters list
                _buildSectionHeader('Chương trình học'),
                const SizedBox(height: 16),
                ..._buildChaptersList(),
                
                const SizedBox(height: 24),
                
                // Recent lessons
                _buildSectionHeader('Bài học gần đây'),
                const SizedBox(height: 16),
                ..._buildRecentLessons(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSubjectOverview() {
    return Card(
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              _getSubjectColor().withOpacity(0.1),
              _getSubjectColor().withOpacity(0.05),
            ],
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: _getSubjectColor().withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    _getSubjectIcon(),
                    color: _getSubjectColor(),
                    size: 24,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${_subjects[_selectedSubject]} - Lớp $_selectedGrade',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Chương trình chuẩn Bộ Giáo dục',
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: Colors.grey[600],
                            ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: 16),
            
            // Progress indicators
            Row(
              children: [
                Expanded(
                  child: _buildProgressItem(
                    'Chương đã học',
                    '8/12',
                    0.67,
                    Colors.blue,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _buildProgressItem(
                    'Bài đã hoàn thành',
                    '24/36',
                    0.67,
                    Colors.green,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProgressItem(String label, String value, double progress, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              label,
              style: Theme.of(context).textTheme.bodySmall,
            ),
            Text(
              value,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: color,
                  ),
            ),
          ],
        ),
        const SizedBox(height: 4),
        LinearProgressIndicator(
          value: progress,
          backgroundColor: color.withOpacity(0.2),
          valueColor: AlwaysStoppedAnimation<Color>(color),
        ),
      ],
    );
  }

  Widget _buildSectionHeader(String title) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          title,
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
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

  List<Widget> _buildChaptersList() {
    return List.generate(6, (index) {
      final isCompleted = index < 4;
      final isInProgress = index == 4;
      
      return Card(
        margin: const EdgeInsets.only(bottom: 12),
        child: ExpansionTile(
          leading: CircleAvatar(
            backgroundColor: isCompleted 
                ? Colors.green.withOpacity(0.1)
                : isInProgress
                    ? Colors.orange.withOpacity(0.1)
                    : Colors.grey.withOpacity(0.1),
            child: Icon(
              isCompleted 
                  ? Icons.check_circle
                  : isInProgress
                      ? Icons.play_circle
                      : Icons.circle_outlined,
              color: isCompleted 
                  ? Colors.green
                  : isInProgress
                      ? Colors.orange
                      : Colors.grey,
            ),
          ),
          title: Text('Chương ${index + 1}: ${_getChapterTitle(index)}'),
          subtitle: Text('${_getLessonCount(index)} bài học'),
          children: _buildLessonsList(index),
        ),
      );
    });
  }

  List<Widget> _buildLessonsList(int chapterIndex) {
    return List.generate(4, (lessonIndex) {
      return ListTile(
        contentPadding: const EdgeInsets.only(left: 72, right: 16),
        leading: Icon(
          Icons.play_circle_outline,
          color: _getSubjectColor(),
        ),
        title: Text('Bài ${lessonIndex + 1}: ${_getLessonTitle(chapterIndex, lessonIndex)}'),
        subtitle: Text('15 phút • Video + Bài tập'),
        trailing: const Icon(Icons.chevron_right),
        onTap: () {
          // TODO: Navigate to lesson detail
          _showLessonDetail(chapterIndex, lessonIndex);
        },
      );
    });
  }

  List<Widget> _buildRecentLessons() {
    return List.generate(3, (index) {
      return Card(
        margin: const EdgeInsets.only(bottom: 8),
        child: ListTile(
          leading: CircleAvatar(
            backgroundColor: _getSubjectColor().withOpacity(0.1),
            child: Icon(
              Icons.play_circle,
              color: _getSubjectColor(),
            ),
          ),
          title: Text('Bài ${index + 1}: ${_getLessonTitle(0, index)}'),
          subtitle: Text('Học ${index + 1} ngày trước'),
          trailing: const Icon(Icons.chevron_right),
          onTap: () {
            // TODO: Navigate to lesson detail
            _showLessonDetail(0, index);
          },
        ),
      );
    });
  }

  Color _getSubjectColor() {
    switch (_selectedSubject) {
      case 'math':
        return Colors.blue;
      case 'physics':
        return Colors.purple;
      case 'chemistry':
        return Colors.green;
      case 'biology':
        return Colors.teal;
      case 'literature':
        return Colors.orange;
      default:
        return Colors.blue;
    }
  }

  IconData _getSubjectIcon() {
    switch (_selectedSubject) {
      case 'math':
        return Icons.calculate;
      case 'physics':
        return Icons.science;
      case 'chemistry':
        return Icons.biotech;
      case 'biology':
        return Icons.eco;
      case 'literature':
        return Icons.menu_book;
      default:
        return Icons.book;
    }
  }

  String _getChapterTitle(int index) {
    switch (_selectedSubject) {
      case 'math':
        return [
          'Mệnh đề và tập hợp',
          'Hàm số bậc nhất và bậc hai',
          'Phương trình và bất phương trình',
          'Hệ phương trình',
          'Thống kê',
          'Hình học không gian',
        ][index];
      case 'physics':
        return [
          'Động học chất điểm',
          'Động lực học chất điểm',
          'Cân bằng và chuyển động quay',
          'Dao động cơ',
          'Sóng cơ',
          'Dòng điện không đổi',
        ][index];
      default:
        return 'Chương ${index + 1}';
    }
  }

  int _getLessonCount(int chapterIndex) {
    return 4 + (chapterIndex % 3); // 4-6 lessons per chapter
  }

  String _getLessonTitle(int chapterIndex, int lessonIndex) {
    return 'Bài học cơ bản ${lessonIndex + 1}';
  }

  void _showLessonDetail(int chapterIndex, int lessonIndex) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        maxChildSize: 0.9,
        minChildSize: 0.5,
        builder: (context, scrollController) => Container(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Handle bar
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey[300],
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              
              // Title
              Text(
                'Chương ${chapterIndex + 1} - Bài ${lessonIndex + 1}',
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              const SizedBox(height: 8),
              Text(
                _getLessonTitle(chapterIndex, lessonIndex),
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      color: Colors.grey[600],
                    ),
              ),
              
              const SizedBox(height: 24),
              
              // Lesson info
              Row(
                children: [
                  _buildInfoChip(Icons.timer, '15 phút'),
                  const SizedBox(width: 12),
                  _buildInfoChip(Icons.video_library, 'Video'),
                  const SizedBox(width: 12),
                  _buildInfoChip(Icons.quiz, 'Bài tập'),
                ],
              ),
              
              const SizedBox(height: 24),
              
              // Description
              Text(
                'Mô tả bài học',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 8),
              const Text(
                'Trong bài học này, bạn sẽ được học về các khái niệm cơ bản và ứng dụng thực tế. '
                'Bài học bao gồm video giảng dạy chi tiết và bài tập thực hành.',
              ),
              
              const Spacer(),
              
              // Action buttons
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Đóng'),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: FilledButton(
                      onPressed: () {
                        Navigator.pop(context);
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Tính năng học bài sẽ sớm có!'),
                          ),
                        );
                      },
                      child: const Text('Bắt đầu học'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoChip(IconData icon, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: _getSubjectColor().withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: 16,
            color: _getSubjectColor(),
          ),
          const SizedBox(width: 6),
          Text(
            label,
            style: TextStyle(
              color: _getSubjectColor(),
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}