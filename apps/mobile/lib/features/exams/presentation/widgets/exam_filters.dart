import 'package:flutter/material.dart';

class ExamFilters extends StatefulWidget {
  final Function(Map<String, dynamic>)? onFiltersChanged;
  
  const ExamFilters({
    super.key,
    this.onFiltersChanged,
  });

  @override
  State<ExamFilters> createState() => _ExamFiltersState();
}

class _ExamFiltersState extends State<ExamFilters> {
  String _selectedType = 'all';
  String _selectedSubject = 'all';
  String _selectedGrade = 'all';
  
  final List<Map<String, String>> _types = [
    {'value': 'all', 'label': 'Tất cả'},
    {'value': 'generated', 'label': 'Luyện tập'},
    {'value': 'official', 'label': 'Chính thức'},
  ];
  
  final List<Map<String, String>> _subjects = [
    {'value': 'all', 'label': 'Tất cả môn'},
    {'value': 'math', 'label': 'Toán học'},
    {'value': 'physics', 'label': 'Vật lý'},
    {'value': 'chemistry', 'label': 'Hóa học'},
    {'value': 'biology', 'label': 'Sinh học'},
    {'value': 'literature', 'label': 'Văn học'},
  ];
  
  final List<Map<String, String>> _grades = [
    {'value': 'all', 'label': 'Tất cả lớp'},
    {'value': '10', 'label': 'Lớp 10'},
    {'value': '11', 'label': 'Lớp 11'},
    {'value': '12', 'label': 'Lớp 12'},
  ];

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Search Bar
        TextField(
          decoration: InputDecoration(
            hintText: 'Tìm kiếm đề thi...',
            prefixIcon: const Icon(Icons.search),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
            ),
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 12,
            ),
          ),
          onChanged: (value) {
            // TODO: Implement search
          },
        ),
        
        const SizedBox(height: 16),
        
        // Filter Chips
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              // Type Filter
              _buildFilterChip(
                label: 'Loại đề thi',
                value: _selectedType,
                options: _types,
                onChanged: (value) {
                  setState(() {
                    _selectedType = value;
                  });
                  _notifyFiltersChanged();
                },
              ),
              
              const SizedBox(width: 12),
              
              // Subject Filter
              _buildFilterChip(
                label: 'Môn học',
                value: _selectedSubject,
                options: _subjects,
                onChanged: (value) {
                  setState(() {
                    _selectedSubject = value;
                  });
                  _notifyFiltersChanged();
                },
              ),
              
              const SizedBox(width: 12),
              
              // Grade Filter
              _buildFilterChip(
                label: 'Lớp',
                value: _selectedGrade,
                options: _grades,
                onChanged: (value) {
                  setState(() {
                    _selectedGrade = value;
                  });
                  _notifyFiltersChanged();
                },
              ),
              
              const SizedBox(width: 12),
              
              // Clear Filters
              if (_hasActiveFilters())
                ActionChip(
                  label: const Text('Xóa bộ lọc'),
                  onPressed: _clearFilters,
                  backgroundColor: Theme.of(context).colorScheme.errorContainer.withOpacity(0.3),
                  labelStyle: TextStyle(
                    color: Theme.of(context).colorScheme.error,
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildFilterChip({
    required String label,
    required String value,
    required List<Map<String, String>> options,
    required Function(String) onChanged,
  }) {
    final selectedOption = options.firstWhere(
      (option) => option['value'] == value,
      orElse: () => options.first,
    );
    
    return FilterChip(
      label: Text('${label}: ${selectedOption['label']}'),
      selected: value != 'all',
      onSelected: (_) => _showFilterDialog(
        context,
        label,
        value,
        options,
        onChanged,
      ),
      backgroundColor: Theme.of(context).colorScheme.surface,
      selectedColor: Theme.of(context).colorScheme.primaryContainer.withOpacity(0.3),
      labelStyle: TextStyle(
        color: value != 'all' 
          ? Theme.of(context).colorScheme.primary
          : Theme.of(context).colorScheme.onSurface,
      ),
    );
  }

  void _showFilterDialog(
    BuildContext context,
    String title,
    String currentValue,
    List<Map<String, String>> options,
    Function(String) onChanged,
  ) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Chọn $title'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: options.map((option) {
            return RadioListTile<String>(
              title: Text(option['label']!),
              value: option['value']!,
              groupValue: currentValue,
              onChanged: (value) {
                if (value != null) {
                  onChanged(value);
                  Navigator.pop(context);
                }
              },
            );
          }).toList(),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Hủy'),
          ),
        ],
      ),
    );
  }

  bool _hasActiveFilters() {
    return _selectedType != 'all' || 
           _selectedSubject != 'all' || 
           _selectedGrade != 'all';
  }

  void _clearFilters() {
    setState(() {
      _selectedType = 'all';
      _selectedSubject = 'all';
      _selectedGrade = 'all';
    });
    _notifyFiltersChanged();
  }

  void _notifyFiltersChanged() {
    if (widget.onFiltersChanged != null) {
      final filters = <String, dynamic>{};
      
      if (_selectedType != 'all') {
        filters['type'] = _selectedType;
      }
      
      if (_selectedSubject != 'all') {
        filters['subject'] = _selectedSubject;
      }
      
      if (_selectedGrade != 'all') {
        filters['grade'] = int.parse(_selectedGrade);
      }
      
      widget.onFiltersChanged!(filters);
    }
  }
}

