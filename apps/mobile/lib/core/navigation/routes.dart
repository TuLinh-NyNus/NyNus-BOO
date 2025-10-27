class Routes {
  // Auth
  static const String splash = '/splash';
  static const String login = '/login';
  static const String register = '/register';
  static const String forgotPassword = '/forgot-password';
  static const String resetPassword = '/reset-password';
  static const String verifyEmail = '/verify-email';
  
  // Main
  static const String home = '/';
  static const String dashboard = '/dashboard';
  
  // Questions
  static const String questions = '/questions';
  static const String questionDetail = '/questions/:id';
  static const String questionSearch = '/questions/search';
  static const String questionsByCode = '/questions/code/:code';
  static const String bookmarkedQuestions = '/questions/bookmarked';
  
  // Exams
  static const String exams = '/exams';
  static const String examDetail = '/exams/:id';
  static const String examTaking = '/exams/:id/take';
  static const String examResult = '/exams/result/:sessionId';
  static const String examReview = '/exams/review/:sessionId';
  static const String examHistory = '/exams/history';
  
  // Library
  static const String library = '/library';
  static const String libraryCategory = '/library/:category';
  static const String libraryItem = '/library/:category/:id';
  static const String librarySearch = '/library/search';
  static const String downloads = '/library/downloads';
  
  // Theory
  static const String theory = '/theory';
  static const String theoryTopic = '/theory/:topicId';
  static const String theoryArticle = '/theory/:topicId/:articleId';
  
  // Profile
  static const String profile = '/profile';
  static const String editProfile = '/profile/edit';
  static const String changePassword = '/profile/change-password';
  static const String achievements = '/profile/achievements';
  static const String statistics = '/profile/statistics';
  static const String sessions = '/profile/sessions';
  
  // Settings
  static const String settings = '/settings';
  static const String settingsNotifications = '/settings/notifications';
  static const String settingsPrivacy = '/settings/privacy';
  static const String settingsStorage = '/settings/storage';
  static const String settingsAbout = '/settings/about';
  
  // Admin (if role permits)
  static const String admin = '/admin';
  static const String adminUsers = '/admin/users';
  static const String adminContent = '/admin/content';
  static const String adminAnalytics = '/admin/analytics';
  
  // Utility
  static String questionDetailPath(String id) => '/questions/$id';
  static String examDetailPath(String id) => '/exams/$id';
  static String examTakingPath(String id) => '/exams/$id/take';
  static String examResultPath(String sessionId) => '/exams/result/$sessionId';
  static String examReviewPath(String sessionId) => '/exams/review/$sessionId';
  static String libraryItemPath(String category, String id) => '/library/$category/$id';
  static String theoryArticlePath(String topicId, String articleId) => 
      '/theory/$topicId/$articleId';
}

