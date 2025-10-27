import 'package:equatable/equatable.dart';

enum QuestionType { 
  multipleChoice, 
  trueFalse, 
  shortAnswer, 
  essay, 
  matching,
  fillInBlank 
}

enum DifficultyLevel { easy, medium, hard, expert }
enum QuestionStatus { pending, approved, rejected, archived }

class Question extends Equatable {
  final String id;
  final String content;
  final String? rawContent;
  final String? subContent;
  final QuestionType type;
  final DifficultyLevel difficulty;
  final QuestionStatus status;
  final String? source;
  final String? solution;
  final String? solutionDetail;
  final List<Answer> answers;
  final QuestionCode? questionCode;
  final List<String> tags;
  final List<QuestionImage> images;
  final int usageCount;
  final double? averageRating;
  final String createdBy;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Question({
    required this.id,
    required this.content,
    this.rawContent,
    this.subContent,
    required this.type,
    required this.difficulty,
    required this.status,
    this.source,
    this.solution,
    this.solutionDetail,
    required this.answers,
    this.questionCode,
    this.tags = const [],
    this.images = const [],
    this.usageCount = 0,
    this.averageRating,
    required this.createdBy,
    required this.createdAt,
    required this.updatedAt,
  });

  bool get hasLatex => content.contains(r'\(') || content.contains(r'\[');
  bool get hasImages => images.isNotEmpty;
  bool get hasSolution => solution != null && solution!.isNotEmpty;

  @override
  List<Object?> get props => [
    id,
    content,
    type,
    difficulty,
    status,
    answers,
    questionCode,
    tags,
    images,
    usageCount,
    averageRating,
    createdAt,
    updatedAt,
  ];
}

class Answer extends Equatable {
  final String id;
  final String content;
  final bool isCorrect;
  final int? order;

  const Answer({
    required this.id,
    required this.content,
    required this.isCorrect,
    this.order,
  });

  @override
  List<Object?> get props => [id, content, isCorrect, order];
}

class QuestionCode extends Equatable {
  final String id;
  final String code;
  final int grade;
  final String subject;
  final String? subjectDetail;
  final String? topic;
  final String? chapter;
  final String? section;
  final String questionFormat;

  const QuestionCode({
    required this.id,
    required this.code,
    required this.grade,
    required this.subject,
    this.subjectDetail,
    this.topic,
    this.chapter,
    this.section,
    required this.questionFormat,
  });

  String get displayName => '$subject - Lớp $grade';
  String get fullCode => code;

  @override
  List<Object?> get props => [
    id,
    code,
    grade,
    subject,
    subjectDetail,
    topic,
    chapter,
    section,
    questionFormat,
  ];
}

class QuestionImage extends Equatable {
  final String id;
  final String url;
  final String? caption;
  final int? order;

  const QuestionImage({
    required this.id,
    required this.url,
    this.caption,
    this.order,
  });

  @override
  List<Object?> get props => [id, url, caption, order];
}

