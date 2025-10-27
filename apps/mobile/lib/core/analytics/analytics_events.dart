class AnalyticsEvents {
  // Firebase standard events
  static const String login = 'login';
  static const String signUp = 'sign_up';
  static const String logout = 'logout';
  static const String search = 'search';
  static const String share = 'share';
  static const String viewContent = 'view_item';
  
  // Custom events - Exam
  static const String examStart = 'exam_start';
  static const String examComplete = 'exam_complete';
  static const String examAbandoned = 'exam_abandoned';
  static const String examPause = 'exam_pause';
  static const String examResume = 'exam_resume';
  
  // Custom events - Question
  static const String questionView = 'question_view';
  static const String questionAnswer = 'question_answer';
  static const String questionSkip = 'question_skip';
  
  // Custom events - Content
  static const String theoryView = 'theory_view';
  static const String libraryView = 'library_view';
  static const String pdfOpen = 'pdf_open';
  
  // Custom events - Download
  static const String downloadStart = 'download_start';
  static const String downloadComplete = 'download_complete';
  static const String downloadFailed = 'download_failed';
  static const String downloadCancelled = 'download_cancelled';
  
  // Custom events - Engagement
  static const String bookmarkAdd = 'bookmark_add';
  static const String bookmarkRemove = 'bookmark_remove';
  static const String rate = 'rate_content';
  static const String comment = 'add_comment';
  
  // Custom events - Settings
  static const String settingsChange = 'settings_change';
  static const String themeChange = 'theme_change';
  static const String languageChange = 'language_change';
  
  // Custom events - Error
  static const String error = 'app_error';
  static const String networkError = 'network_error';
  static const String syncError = 'sync_error';
}

class AnalyticsScreens {
  static const String splash = 'Splash';
  static const String login = 'Login';
  static const String register = 'Register';
  static const String home = 'Home';
  
  // Questions
  static const String questions = 'Questions';
  static const String questionDetail = 'QuestionDetail';
  static const String questionSearch = 'QuestionSearch';
  
  // Exams
  static const String exams = 'Exams';
  static const String examDetail = 'ExamDetail';
  static const String examTaking = 'ExamTaking';
  static const String examResult = 'ExamResult';
  static const String examReview = 'ExamReview';
  static const String examHistory = 'ExamHistory';
  
  // Library
  static const String library = 'Library';
  static const String libraryCategory = 'LibraryCategory';
  static const String pdfViewer = 'PDFViewer';
  static const String downloads = 'Downloads';
  
  // Theory
  static const String theory = 'Theory';
  static const String theoryContent = 'TheoryContent';
  static const String theorySearch = 'TheorySearch';
  
  // Profile
  static const String profile = 'Profile';
  static const String editProfile = 'EditProfile';
  static const String statistics = 'Statistics';
  static const String achievements = 'Achievements';
  
  // Settings
  static const String settings = 'Settings';
  static const String settingsStorage = 'SettingsStorage';
  static const String settingsNotifications = 'SettingsNotifications';
}

