import 'package:equatable/equatable.dart';

enum PostType { 
  unspecified,
  article,
  theory,
  mathNote,
  blog 
}

enum Subject {
  math,
  physics,
  chemistry,
  biology,
  literature,
  english,
  history,
  geography,
}

enum NodeType {
  subject,
  grade,
  chapter,
  section,
  topic,
  post,
}

class TheoryPost extends Equatable {
  final String id;
  final String slug;
  final String title;
  final String? description;
  final PostType type;
  final TheoryMetadata metadata;
  final String markdownContent;
  final List<String> tags;
  final String? heroImageUrl;
  final bool mathEnabled;
  final List<TikzAsset> tikzAssets;
  final String authorId;
  final String? authorName;
  final DateTime createdAt;
  final DateTime updatedAt;
  final int viewCount;
  final bool isBookmarked;
  final bool isDownloaded;
  final String? localPath;

  const TheoryPost({
    required this.id,
    required this.slug,
    required this.title,
    this.description,
    required this.type,
    required this.metadata,
    required this.markdownContent,
    this.tags = const [],
    this.heroImageUrl,
    this.mathEnabled = true,
    this.tikzAssets = const [],
    required this.authorId,
    this.authorName,
    required this.createdAt,
    required this.updatedAt,
    this.viewCount = 0,
    this.isBookmarked = false,
    this.isDownloaded = false,
    this.localPath,
  });

  bool get hasLaTeX => mathEnabled && 
      (markdownContent.contains(r'$') || 
       markdownContent.contains(r'\(') ||
       markdownContent.contains(r'\['));
       
  bool get hasTikZ => tikzAssets.isNotEmpty;

  TheoryPost copyWith({
    String? id,
    String? slug,
    String? title,
    String? description,
    PostType? type,
    TheoryMetadata? metadata,
    String? markdownContent,
    List<String>? tags,
    String? heroImageUrl,
    bool? mathEnabled,
    List<TikzAsset>? tikzAssets,
    String? authorId,
    String? authorName,
    DateTime? createdAt,
    DateTime? updatedAt,
    int? viewCount,
    bool? isBookmarked,
    bool? isDownloaded,
    String? localPath,
  }) {
    return TheoryPost(
      id: id ?? this.id,
      slug: slug ?? this.slug,
      title: title ?? this.title,
      description: description ?? this.description,
      type: type ?? this.type,
      metadata: metadata ?? this.metadata,
      markdownContent: markdownContent ?? this.markdownContent,
      tags: tags ?? this.tags,
      heroImageUrl: heroImageUrl ?? this.heroImageUrl,
      mathEnabled: mathEnabled ?? this.mathEnabled,
      tikzAssets: tikzAssets ?? this.tikzAssets,
      authorId: authorId ?? this.authorId,
      authorName: authorName ?? this.authorName,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      viewCount: viewCount ?? this.viewCount,
      isBookmarked: isBookmarked ?? this.isBookmarked,
      isDownloaded: isDownloaded ?? this.isDownloaded,
      localPath: localPath ?? this.localPath,
    );
  }

  @override
  List<Object?> get props => [
    id,
    slug,
    title,
    type,
    metadata,
    markdownContent,
    tags,
    createdAt,
    updatedAt,
    isBookmarked,
    isDownloaded,
  ];
}

class TheoryMetadata extends Equatable {
  final Subject? subject;
  final int? grade;
  final String? chapter;
  final String? section;
  final String? topic;
  final String category;
  final int order;
  final String? parentId;
  final List<String> prerequisites;
  final Map<String, dynamic>? customData;

  const TheoryMetadata({
    this.subject,
    this.grade,
    this.chapter,
    this.section,
    this.topic,
    required this.category,
    this.order = 0,
    this.parentId,
    this.prerequisites = const [],
    this.customData,
  });

  String get displayPath {
    final parts = <String>[];
    
    if (subject != null) {
      parts.add(_getSubjectName(subject!));
    }
    if (grade != null) {
      parts.add('Lớp $grade');
    }
    if (chapter != null) {
      parts.add(chapter!);
    }
    if (section != null) {
      parts.add(section!);
    }
    
    return parts.join(' > ');
  }

  String _getSubjectName(Subject subject) {
    switch (subject) {
      case Subject.math:
        return 'Toán';
      case Subject.physics:
        return 'Vật lý';
      case Subject.chemistry:
        return 'Hóa học';
      case Subject.biology:
        return 'Sinh học';
      case Subject.literature:
        return 'Ngữ văn';
      case Subject.english:
        return 'Tiếng Anh';
      case Subject.history:
        return 'Lịch sử';
      case Subject.geography:
        return 'Địa lý';
    }
  }

  @override
  List<Object?> get props => [
    subject,
    grade,
    chapter,
    section,
    topic,
    category,
    order,
    parentId,
  ];
}

class TikzAsset extends Equatable {
  final String assetId;
  final String url;
  final String hash;
  final int width;
  final int height;
  final String format;
  final String? caption;
  final String originalCode;

  const TikzAsset({
    required this.assetId,
    required this.url,
    required this.hash,
    required this.width,
    required this.height,
    required this.format,
    this.caption,
    required this.originalCode,
  });

  @override
  List<Object?> get props => [
    assetId,
    url,
    hash,
    width,
    height,
    format,
    caption,
  ];
}

class TheoryNavigationNode extends Equatable {
  final String id;
  final String title;
  final String? slug;
  final NodeType nodeType;
  final TheoryMetadata metadata;
  final List<TheoryNavigationNode> children;
  final bool hasContent;
  final int contentCount;

  const TheoryNavigationNode({
    required this.id,
    required this.title,
    this.slug,
    required this.nodeType,
    required this.metadata,
    this.children = const [],
    this.hasContent = false,
    this.contentCount = 0,
  });

  @override
  List<Object?> get props => [
    id,
    title,
    slug,
    nodeType,
    metadata,
    children,
    hasContent,
    contentCount,
  ];
}

