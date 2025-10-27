import 'package:equatable/equatable.dart';
import 'package:mobile/features/questions/domain/entities/question.dart';

enum ExamStatus { 
  active,     // Đã xuất bản, students có thể làm
  pending,    // Đang soạn thảo, chờ review
  inactive,   // Tạm ngưng
  archived    // Đã lưu trữ
}

enum ExamType { 
  generated,  // Đề thi tạo từ ngân hàng câu hỏi
  official    // Đề thi thật từ trường/sở
}

enum ExamMode { timed, untimed, adaptive }

class Exam extends Equatable {
  final String id;
  final String title;
  final String? description;
  final String? instructions;
  final ExamType type;
  final ExamStatus status;
  final ExamMode mode;
  final int duration; // in minutes
  final int totalQuestions;
  final double totalPoints;
  final double? passingScore;
  final String? subject;
  final int? grade;
  final List<String> tags;
  final Map<String, int> questionTypeDistribution;
  final Map<String, int> difficultyDistribution;
  final DateTime? availableFrom;
  final DateTime? availableUntil;
  final int attemptLimit;
  final bool shuffleQuestions;
  final bool shuffleAnswers;
  final bool showResultsImmediately;
  final bool allowReview;
  
  // Official exam specific fields
  final String? sourceInstitution;
  final String? examYear;
  final String? examCode;
  final String? fileUrl;
  
  final String createdBy;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Exam({
    required this.id,
    required this.title,
    this.description,
    this.instructions,
    required this.type,
    required this.status,
    required this.mode,
    required this.duration,
    required this.totalQuestions,
    required this.totalPoints,
    this.passingScore,
    this.subject,
    this.grade,
    this.tags = const [],
    this.questionTypeDistribution = const {},
    this.difficultyDistribution = const {},
    this.availableFrom,
    this.availableUntil,
    this.attemptLimit = 0,
    this.shuffleQuestions = false,
    this.shuffleAnswers = false,
    this.showResultsImmediately = true,
    this.allowReview = true,
    this.sourceInstitution,
    this.examYear,
    this.examCode,
    this.fileUrl,
    required this.createdBy,
    required this.createdAt,
    required this.updatedAt,
  });

  bool get isAvailable {
    final now = DateTime.now();
    if (availableFrom != null && now.isBefore(availableFrom!)) return false;
    if (availableUntil != null && now.isAfter(availableUntil!)) return false;
    return status == ExamStatus.active;
  }

  bool get isTimed => mode == ExamMode.timed && duration > 0;
  bool get hasUnlimitedAttempts => attemptLimit == 0;
  bool get isOfficial => type == ExamType.official;

  @override
  List<Object?> get props => [
    id,
    title,
    type,
    status,
    mode,
    duration,
    totalQuestions,
    totalPoints,
    passingScore,
    subject,
    grade,
    tags,
    availableFrom,
    availableUntil,
    attemptLimit,
    createdAt,
  ];
}

enum SessionStatus { inProgress, paused, completed, abandoned, timedOut }

class ExamSession extends Equatable {
  final String id;
  final String examId;
  final String userId;
  final SessionStatus status;
  final DateTime startedAt;
  final DateTime? completedAt;
  final DateTime? pausedAt;
  final int timeSpent; // in seconds
  final int currentQuestionIndex;
  final List<ExamQuestion> questions;
  final Map<String, QuestionAnswer> answers;
  final double? score;
  final double? percentage;
  final bool? passed;

  const ExamSession({
    required this.id,
    required this.examId,
    required this.userId,
    required this.status,
    required this.startedAt,
    this.completedAt,
    this.pausedAt,
    required this.timeSpent,
    required this.currentQuestionIndex,
    required this.questions,
    required this.answers,
    this.score,
    this.percentage,
    this.passed,
  });

  int get answeredCount => answers.values
      .where((a) => a.isAnswered)
      .length;

  int get remainingTime => questions.isNotEmpty && questions.first.exam != null
      ? (questions.first.exam!.duration * 60) - timeSpent
      : 0;

  bool get isTimedOut => questions.isNotEmpty &&
      questions.first.exam?.isTimed == true &&
      remainingTime <= 0;

  @override
  List<Object?> get props => [
    id,
    examId,
    userId,
    status,
    startedAt,
    completedAt,
    timeSpent,
    currentQuestionIndex,
    questions,
    answers,
    score,
    percentage,
  ];
}

class ExamQuestion extends Equatable {
  final String id;
  final int order;
  final Question question;
  final double points;
  final Exam? exam;

  const ExamQuestion({
    required this.id,
    required this.order,
    required this.question,
    required this.points,
    this.exam,
  });

  @override
  List<Object?> get props => [id, order, question, points, exam];
}

class QuestionAnswer extends Equatable {
  final String questionId;
  final List<String> selectedAnswerIds;
  final String? textAnswer;
  final bool isAnswered;
  final bool? isCorrect;
  final double? earnedPoints;
  final DateTime answeredAt;
  final int timeSpent; // in seconds

  const QuestionAnswer({
    required this.questionId,
    this.selectedAnswerIds = const [],
    this.textAnswer,
    required this.isAnswered,
    this.isCorrect,
    this.earnedPoints,
    required this.answeredAt,
    required this.timeSpent,
  });

  @override
  List<Object?> get props => [
    questionId,
    selectedAnswerIds,
    textAnswer,
    isAnswered,
    isCorrect,
    earnedPoints,
    answeredAt,
    timeSpent,
  ];
}

class ExamResult {
  final String id;
  final String sessionId;
  final String examId;
  final Exam exam;
  final String userId;
  final DateTime startedAt;
  final DateTime completedAt;
  final int timeSpent;
  final int totalQuestions;
  final int answeredQuestions;
  final int correctAnswers;
  final double totalScore;
  final double earnedScore;
  final double percentage;
  final bool passed;
  final Map<String, QuestionResult> questionResults;
  final ExamStatistics statistics;

  ExamResult({
    required this.id,
    required this.sessionId,
    required this.examId,
    required this.exam,
    required this.userId,
    required this.startedAt,
    required this.completedAt,
    required this.timeSpent,
    required this.totalQuestions,
    required this.answeredQuestions,
    required this.correctAnswers,
    required this.totalScore,
    required this.earnedScore,
    required this.percentage,
    required this.passed,
    required this.questionResults,
    required this.statistics,
  });
}

class QuestionResult {
  final String questionId;
  final Question question;
  final QuestionAnswer userAnswer;
  final List<String> correctAnswerIds;
  final String? correctTextAnswer;
  final bool isCorrect;
  final double points;
  final double earnedPoints;
  final String? feedback;

  QuestionResult({
    required this.questionId,
    required this.question,
    required this.userAnswer,
    required this.correctAnswerIds,
    this.correctTextAnswer,
    required this.isCorrect,
    required this.points,
    required this.earnedPoints,
    this.feedback,
  });
}

class ExamStatistics {
  final Map<String, int> typeDistribution;
  final Map<String, int> difficultyDistribution;
  final Map<String, double> typeAccuracy;
  final Map<String, double> difficultyAccuracy;
  final double averageTimePerQuestion;
  final List<String> strengths;
  final List<String> weaknesses;

  ExamStatistics({
    required this.typeDistribution,
    required this.difficultyDistribution,
    required this.typeAccuracy,
    required this.difficultyAccuracy,
    required this.averageTimePerQuestion,
    required this.strengths,
    required this.weaknesses,
  });
}

