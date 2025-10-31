import 'package:mobile/features/theory/domain/entities/theory_content.dart';

class TheoryPostModel extends TheoryPost {
  const TheoryPostModel({
    required super.id,
    required super.slug,
    required super.title,
    super.description,
    required super.type,
    required super.metadata,
    required super.markdownContent,
    super.tags,
    super.heroImageUrl,
    super.mathEnabled,
    super.tikzAssets,
    required super.authorId,
    super.authorName,
    required super.createdAt,
    required super.updatedAt,
    super.viewCount,
    super.isBookmarked,
    super.isDownloaded,
    super.localPath,
  });

  factory TheoryPostModel.fromJson(Map<String, dynamic> json) {
    return TheoryPostModel(
      id: json['id'] as String,
      slug: json['slug'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      type: _parsePostType(json['type']),
      metadata: TheoryMetadataModel.fromJson(json['metadata'] as Map<String, dynamic>),
      markdownContent: json['markdownContent'] as String,
      tags: (json['tags'] as List<dynamic>?)?.map((e) => e as String).toList() ?? [],
      heroImageUrl: json['heroImageUrl'] as String?,
      mathEnabled: json['mathEnabled'] as bool? ?? true,
      tikzAssets: (json['tikzAssets'] as List<dynamic>?)
          ?.map((e) => TikzAssetModel.fromJson(e as Map<String, dynamic>))
          .toList() ?? [],
      authorId: json['authorId'] as String,
      authorName: json['authorName'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      viewCount: json['viewCount'] as int? ?? 0,
      isBookmarked: json['isBookmarked'] as bool? ?? false,
      isDownloaded: json['isDownloaded'] as bool? ?? false,
      localPath: json['localPath'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'slug': slug,
      'title': title,
      'description': description,
      'type': type.name,
      'metadata': (metadata as TheoryMetadataModel).toJson(),
      'markdownContent': markdownContent,
      'tags': tags,
      'heroImageUrl': heroImageUrl,
      'mathEnabled': mathEnabled,
      'tikzAssets': tikzAssets.map((e) => (e as TikzAssetModel).toJson()).toList(),
      'authorId': authorId,
      'authorName': authorName,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'viewCount': viewCount,
      'isBookmarked': isBookmarked,
      'isDownloaded': isDownloaded,
      'localPath': localPath,
    };
  }

  factory TheoryPostModel.fromEntity(TheoryPost entity) {
    return TheoryPostModel(
      id: entity.id,
      slug: entity.slug,
      title: entity.title,
      description: entity.description,
      type: entity.type,
      metadata: entity.metadata,
      markdownContent: entity.markdownContent,
      tags: entity.tags,
      heroImageUrl: entity.heroImageUrl,
      mathEnabled: entity.mathEnabled,
      tikzAssets: entity.tikzAssets,
      authorId: entity.authorId,
      authorName: entity.authorName,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      viewCount: entity.viewCount,
      isBookmarked: entity.isBookmarked,
      isDownloaded: entity.isDownloaded,
      localPath: entity.localPath,
    );
  }

  TheoryPostModel copyWith({
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
    return TheoryPostModel(
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

  static PostType _parsePostType(dynamic value) {
    if (value == null) return PostType.unspecified;
    if (value is PostType) return value;
    if (value is String) {
      switch (value.toLowerCase()) {
        case 'article':
          return PostType.article;
        case 'theory':
          return PostType.theory;
        case 'mathnote':
        case 'math_note':
          return PostType.mathNote;
        case 'blog':
          return PostType.blog;
        default:
          return PostType.unspecified;
      }
    }
    return PostType.unspecified;
  }
}

class TheoryMetadataModel extends TheoryMetadata {
  const TheoryMetadataModel({
    super.subject,
    super.grade,
    super.chapter,
    super.section,
    super.topic,
    super.category,
    super.difficulty,
    super.estimatedReadTime,
  });

  factory TheoryMetadataModel.fromJson(Map<String, dynamic> json) {
    return TheoryMetadataModel(
      subject: _parseSubject(json['subject']),
      grade: json['grade'] as int?,
      chapter: json['chapter'] as String?,
      section: json['section'] as String?,
      topic: json['topic'] as String?,
      category: json['category'] as String?,
      difficulty: json['difficulty'] as String?,
      estimatedReadTime: json['estimatedReadTime'] as int?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'subject': subject?.name,
      'grade': grade,
      'chapter': chapter,
      'section': section,
      'topic': topic,
      'category': category,
      'difficulty': difficulty,
      'estimatedReadTime': estimatedReadTime,
    };
  }

  static Subject? _parseSubject(dynamic value) {
    if (value == null) return null;
    if (value is Subject) return value;
    if (value is String) {
      switch (value.toLowerCase()) {
        case 'math':
          return Subject.math;
        case 'physics':
          return Subject.physics;
        case 'chemistry':
          return Subject.chemistry;
        case 'biology':
          return Subject.biology;
        case 'literature':
          return Subject.literature;
        case 'english':
          return Subject.english;
        case 'history':
          return Subject.history;
        case 'geography':
          return Subject.geography;
        default:
          return null;
      }
    }
    return null;
  }
}

class TikzAssetModel extends TikzAsset {
  const TikzAssetModel({
    required super.id,
    required super.tikzCode,
    required super.renderedImageUrl,
    super.altText,
    super.width,
    super.height,
  });

  factory TikzAssetModel.fromJson(Map<String, dynamic> json) {
    return TikzAssetModel(
      id: json['id'] as String,
      tikzCode: json['tikzCode'] as String,
      renderedImageUrl: json['renderedImageUrl'] as String,
      altText: json['altText'] as String?,
      width: json['width'] as double?,
      height: json['height'] as double?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'tikzCode': tikzCode,
      'renderedImageUrl': renderedImageUrl,
      'altText': altText,
      'width': width,
      'height': height,
    };
  }
}
