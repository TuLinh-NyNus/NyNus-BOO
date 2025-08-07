// Export remaining mock services
export { default as courseService } from './course-service';
export { default as tutorialService } from './tutorial-service';

// Export types for compatibility
export type { ICourse } from './course-service';

// Re-export mock data types
export * from '../mock-data/types';
