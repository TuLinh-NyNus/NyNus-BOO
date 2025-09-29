/**
 * Services Index
 * Main barrel exports cho tất cả services trong application
 *
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-18
 * @updated 2025-01-19 - Consolidated service structure
 */

// ===== MOCK SERVICES =====
export * from './mock/questions';

// ===== PUBLIC SERVICES =====
export * from './public';

// ===== API SERVICES =====
export { adminApiService } from './api/admin.api';
export { AuthService, getAuthErrorMessage } from './api/auth.api';

// ===== GRPC SERVICES =====
export { AdminService } from './grpc/admin.service';
export { ContactService } from './grpc/contact.service';
export { ExamService } from './grpc/exam.service';
export { NewsletterService } from './grpc/newsletter.service';
export { NotificationService } from './grpc/notification.service';
export { ProfileService } from './grpc/profile.service';
export { QuestionService } from './grpc/question.service';
export { QuestionFilterService } from './grpc/question-filter.service';
export { QuestionLatexService } from './grpc/question-latex.service';
export { ResourceProtectionService } from './grpc/resource-protection.service';

// ===== UTILITY SERVICES =====
export { ExamExportService } from './exam-export.service';
export { ExamImportService } from './exam-import.service';
