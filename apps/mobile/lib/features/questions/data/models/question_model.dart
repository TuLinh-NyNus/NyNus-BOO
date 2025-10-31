import 'package:mobile/features/questions/domain/entities/question.dart';

class QuestionModel extends Question {
  const QuestionModel({
    required super.id,
    required super.content,
    super.rawContent,
    super.subContent,
    required super.type,
    required super.difficulty,
    required super.status,
    super.source,
    super.solution,
    super.solutionDetail,
    required super.answers,
    super.questionCode,
    super.tags,
    super.images,
    super.usageCount,
    super.averageRating,
    required super.createdBy,
    required super.createdAt,
    required super.updatedAt,
  });

  factory QuestionModel.fromJson(Map<String, dynamic> json) {
    return QuestionModel(
      id: json['id'] as String,
      content: json['content'] as String,
      rawContent: json['rawContent'] as String?,
      subContent: json['subContent'] as String?,
      type: _parseQuestionType(json['type']),
      difficulty: _parseDifficultyLevel(json['difficulty']),
      status: _parseQuestionStatus(json['status']),
      source: json['source'] as String?,
      solution: json['solution'] as String?,
      solutionDetail: json['solutionDetail'] as String?,
      answers: (json['answers'] as List<dynamic>)
          .map((e) => AnswerModel.fromJson(e as Map<String, dynamic>))
          .toList(),
      questionCode: json['questionCode'] != null
          ? QuestionCodeModel.fromJson(json['questionCode'] as Map<String, dynamic>)
          : null,
      tags: (json['tags'] as List<dynamic>?)?.map((e) => e as String).toList() ?? [],
      images: (json['images'] as List<dynamic>?)
          ?.map((e) => QuestionImageModel.fromJson(e as Map<String, dynamic>))
          .toList() ?? [],
      usageCount: json['usageCount'] as int? ?? 0,
      averageRating: (json['averageRating'] as num?)?.toDouble(),
      createdBy: json['createdBy'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'content': content,
      'rawContent': rawContent,
      'subContent': subContent,
      'type': type.name,
      'difficulty': difficulty.name,
      'status': status.name,
      'source': source,
      'solution': solution,
      'solutionDetail': solutionDetail,
      'answers': answers.map((e) => (e as AnswerModel).toJson()).toList(),
      'questionCode': questionCode != null 
          ? (questionCode as QuestionCodeModel).toJson() 
          : null,
      'tags': tags,
      'images': images.map((e) => (e as QuestionImageModel).toJson()).toList(),
      'usageCount': usageCount,
      'averageRating': averageRating,
      'createdBy': createdBy,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  factory QuestionModel.fromEntity(Question entity) {
    return QuestionModel(
      id: entity.id,
      content: entity.content,
      rawContent: entity.rawContent,
      subContent: entity.subContent,
      type: entity.type,
      difficulty: entity.difficulty,
      status: entity.status,
      source: entity.source,
      solution: entity.solution,
      solutionDetail: entity.solutionDetail,
      answers: entity.answers,
      questionCode: entity.questionCode,
      tags: entity.tags,
      images: entity.images,
      usageCount: entity.usageCount,
      averageRating: entity.averageRating,
      createdBy: entity.createdBy,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    );
  }

  static QuestionType _parseQuestionType(dynamic value) {
    if (value == null) return QuestionType.multipleChoice;
    if (value is QuestionType) return value;
    if (value is String) {
      switch (value.toLowerCase()) {
        case 'multiplechoice':
        case 'multiple_choice':
          return QuestionType.multipleChoice;
        case 'truefalse':
        case 'true_false':
          return QuestionType.trueFalse;
        case 'shortanswer':
        case 'short_answer':
          return QuestionType.shortAnswer;
        case 'essay':
          return QuestionType.essay;
        case 'matching':
          return QuestionType.matching;
        case 'fillinblank':
        case 'fill_in_blank':
          return QuestionType.fillInBlank;
        default:
          return QuestionType.multipleChoice;
      }
    }
    return QuestionType.multipleChoice;
  }

  static DifficultyLevel _parseDifficultyLevel(dynamic value) {
    if (value == null) return DifficultyLevel.medium;
    if (value is DifficultyLevel) return value;
    if (value is String) {
      switch (value.toLowerCase()) {
        case 'easy':
          return DifficultyLevel.easy;
        case 'medium':
          return DifficultyLevel.medium;
        case 'hard':
          return DifficultyLevel.hard;
        case 'expert':
          return DifficultyLevel.expert;
        default:
          return DifficultyLevel.medium;
      }
    }
    return DifficultyLevel.medium;
  }

  static QuestionStatus _parseQuestionStatus(dynamic value) {
    if (value == null) return QuestionStatus.pending;
    if (value is QuestionStatus) return value;
    if (value is String) {
      switch (value.toLowerCase()) {
        case 'pending':
          return QuestionStatus.pending;
        case 'approved':
          return QuestionStatus.approved;
        case 'rejected':
          return QuestionStatus.rejected;
        case 'archived':
          return QuestionStatus.archived;
        default:
          return QuestionStatus.pending;
      }
    }
    return QuestionStatus.pending;
  }
}

class AnswerModel extends Answer {
  const AnswerModel({
    required super.id,
    required super.content,
    required super.isCorrect,
    super.order,
  });

  factory AnswerModel.fromJson(Map<String, dynamic> json) {
    return AnswerModel(
      id: json['id'] as String,
      content: json['content'] as String,
      isCorrect: json['isCorrect'] as bool,
      order: json['order'] as int?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'content': content,
      'isCorrect': isCorrect,
      'order': order,
    };
  }
}

class QuestionCodeModel extends QuestionCode {
  const QuestionCodeModel({
    required super.id,
    required super.code,
    required super.grade,
    required super.subject,
    super.subjectDetail,
    super.topic,
    super.chapter,
    super.section,
    required super.questionFormat,
  });

  factory QuestionCodeModel.fromJson(Map<String, dynamic> json) {
    return QuestionCodeModel(
      id: json['id'] as String,
      code: json['code'] as String,
      grade: json['grade'] as int,
      subject: json['subject'] as String,
      subjectDetail: json['subjectDetail'] as String?,
      topic: json['topic'] as String?,
      chapter: json['chapter'] as String?,
      section: json['section'] as String?,
      questionFormat: json['questionFormat'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'code': code,
      'grade': grade,
      'subject': subject,
      'subjectDetail': subjectDetail,
      'topic': topic,
      'chapter': chapter,
      'section': section,
      'questionFormat': questionFormat,
    };
  }
}

class QuestionImageModel extends QuestionImage {
  const QuestionImageModel({
    required super.id,
    required super.url,
    super.caption,
    super.order,
  });

  factory QuestionImageModel.fromJson(Map<String, dynamic> json) {
    return QuestionImageModel(
      id: json['id'] as String,
      url: json['url'] as String,
      caption: json['caption'] as String?,
      order: json['order'] as int?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'url': url,
      'caption': caption,
      'order': order,
    };
  }
}
