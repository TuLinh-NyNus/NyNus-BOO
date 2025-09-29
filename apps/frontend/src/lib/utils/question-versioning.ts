/**
 * Question Versioning Utilities
 * Advanced versioning và history tracking cho questions
 * 
 * @author NyNus Team
 * @version 1.0.0
 */

import { Question } from '@/types/question';

// ===== TYPES =====

export interface QuestionVersion {
  id: string;
  questionId: string;
  version: number;
  data: Question;
  changeType: ChangeType;
  changes: QuestionChange[];
  createdBy: string;
  createdAt: string;
  comment?: string;
  tags?: string[];
}

export type ChangeType = 
  | 'create'
  | 'update'
  | 'content_change'
  | 'answer_change'
  | 'metadata_change'
  | 'status_change'
  | 'bulk_update';

export interface QuestionChange {
  field: string;
  oldValue: unknown;
  newValue: unknown;
  changeType: 'add' | 'remove' | 'modify';
  timestamp: string;
}

export interface QuestionHistory {
  questionId: string;
  versions: QuestionVersion[];
  totalVersions: number;
  firstVersion: QuestionVersion;
  latestVersion: QuestionVersion;
  createdAt: string;
  lastModified: string;
}

export interface VersionComparisonResult {
  fromVersion: QuestionVersion;
  toVersion: QuestionVersion;
  changes: QuestionChange[];
  summary: VersionComparisonSummary;
}

export interface VersionComparisonSummary {
  totalChanges: number;
  contentChanged: boolean;
  answersChanged: boolean;
  metadataChanged: boolean;
  statusChanged: boolean;
  majorChanges: number;
  minorChanges: number;
}

export interface VersionRestoreOptions {
  createNewVersion?: boolean;
  preserveMetadata?: boolean;
  comment?: string;
  notifyUsers?: boolean;
}

// ===== VERSION CREATION =====

/**
 * Create new version từ question changes
 */
export function createQuestionVersion(
  questionId: string,
  oldQuestion: Question | null,
  newQuestion: Question,
  createdBy: string,
  comment?: string
): QuestionVersion {
  const changes = oldQuestion ? detectQuestionChanges(oldQuestion, newQuestion) : [];
  const changeType = determineChangeType(changes, oldQuestion === null);
  
  return {
    id: generateVersionId(),
    questionId,
    version: 1, // Will be set by version manager
    data: { ...newQuestion },
    changeType,
    changes,
    createdBy,
    createdAt: new Date().toISOString(),
    comment,
    tags: extractVersionTags(changes)
  };
}

/**
 * Detect changes between two question versions
 */
export function detectQuestionChanges(
  oldQuestion: Question,
  newQuestion: Question
): QuestionChange[] {
  const changes: QuestionChange[] = [];
  const timestamp = new Date().toISOString();
  
  // Content changes
  if (oldQuestion.content !== newQuestion.content) {
    changes.push({
      field: 'content',
      oldValue: oldQuestion.content,
      newValue: newQuestion.content,
      changeType: 'modify',
      timestamp
    });
  }
  
  // Type changes
  if (oldQuestion.type !== newQuestion.type) {
    changes.push({
      field: 'type',
      oldValue: oldQuestion.type,
      newValue: newQuestion.type,
      changeType: 'modify',
      timestamp
    });
  }
  
  // Difficulty changes
  if (oldQuestion.difficulty !== newQuestion.difficulty) {
    changes.push({
      field: 'difficulty',
      oldValue: oldQuestion.difficulty,
      newValue: newQuestion.difficulty,
      changeType: 'modify',
      timestamp
    });
  }
  
  // Status changes
  if (oldQuestion.status !== newQuestion.status) {
    changes.push({
      field: 'status',
      oldValue: oldQuestion.status,
      newValue: newQuestion.status,
      changeType: 'modify',
      timestamp
    });
  }
  
  // Answer changes
  const answerChanges = detectAnswerChanges(
    oldQuestion.answers || [],
    newQuestion.answers || []
  );
  changes.push(...answerChanges);
  
  // Explanation changes
  if (oldQuestion.explanation !== newQuestion.explanation) {
    changes.push({
      field: 'explanation',
      oldValue: oldQuestion.explanation,
      newValue: newQuestion.explanation,
      changeType: 'modify',
      timestamp
    });
  }
  
  // Tags changes
  const tagChanges = detectArrayChanges(
    'tags',
    oldQuestion.tag || [],
    newQuestion.tag || [],
    timestamp
  );
  changes.push(...tagChanges);
  
  return changes;
}

/**
 * Detect changes trong answers array
 */
function detectAnswerChanges(
  oldAnswers: unknown[],
  newAnswers: unknown[]
): QuestionChange[] {
  const changes: QuestionChange[] = [];
  const timestamp = new Date().toISOString();
  
  // Check for added answers
  newAnswers.forEach((newAnswer, index) => {
    if (index >= oldAnswers.length) {
      changes.push({
        field: `answers[${index}]`,
        oldValue: null,
        newValue: newAnswer,
        changeType: 'add',
        timestamp
      });
    }
  });
  
  // Check for removed answers
  oldAnswers.forEach((oldAnswer, index) => {
    if (index >= newAnswers.length) {
      changes.push({
        field: `answers[${index}]`,
        oldValue: oldAnswer,
        newValue: null,
        changeType: 'remove',
        timestamp
      });
    }
  });
  
  // Check for modified answers
  const minLength = Math.min(oldAnswers.length, newAnswers.length);
  for (let i = 0; i < minLength; i++) {
    if (JSON.stringify(oldAnswers[i]) !== JSON.stringify(newAnswers[i])) {
      changes.push({
        field: `answers[${i}]`,
        oldValue: oldAnswers[i],
        newValue: newAnswers[i],
        changeType: 'modify',
        timestamp
      });
    }
  }
  
  return changes;
}

/**
 * Detect changes trong array fields
 */
function detectArrayChanges(
  fieldName: string,
  oldArray: unknown[],
  newArray: unknown[],
  timestamp: string
): QuestionChange[] {
  const changes: QuestionChange[] = [];
  
  // Find added items
  const added = newArray.filter(item => !oldArray.includes(item));
  added.forEach(item => {
    changes.push({
      field: fieldName,
      oldValue: null,
      newValue: item,
      changeType: 'add',
      timestamp
    });
  });
  
  // Find removed items
  const removed = oldArray.filter(item => !newArray.includes(item));
  removed.forEach(item => {
    changes.push({
      field: fieldName,
      oldValue: item,
      newValue: null,
      changeType: 'remove',
      timestamp
    });
  });
  
  return changes;
}

/**
 * Determine change type từ changes list
 */
function determineChangeType(changes: QuestionChange[], isNew: boolean): ChangeType {
  if (isNew) return 'create';
  if (changes.length === 0) return 'update';
  
  const hasContentChange = changes.some(c => c.field === 'content');
  const hasAnswerChange = changes.some(c => c.field.startsWith('answers'));
  const hasStatusChange = changes.some(c => c.field === 'status');
  
  if (hasContentChange) return 'content_change';
  if (hasAnswerChange) return 'answer_change';
  if (hasStatusChange) return 'status_change';
  
  return 'metadata_change';
}

/**
 * Extract tags từ changes
 */
function extractVersionTags(changes: QuestionChange[]): string[] {
  const tags: string[] = [];
  
  const hasContentChange = changes.some(c => c.field === 'content');
  const hasAnswerChange = changes.some(c => c.field.startsWith('answers'));
  const hasStatusChange = changes.some(c => c.field === 'status');
  const hasMajorChange = changes.length > 5;
  
  if (hasContentChange) tags.push('content-change');
  if (hasAnswerChange) tags.push('answer-change');
  if (hasStatusChange) tags.push('status-change');
  if (hasMajorChange) tags.push('major-change');
  
  return tags;
}

// ===== VERSION COMPARISON =====

/**
 * Compare two question versions
 */
export function compareQuestionVersions(
  fromVersion: QuestionVersion,
  toVersion: QuestionVersion
): VersionComparisonResult {
  const changes = detectQuestionChanges(fromVersion.data, toVersion.data);
  const summary = generateComparisonSummary(changes);
  
  return {
    fromVersion,
    toVersion,
    changes,
    summary
  };
}

/**
 * Generate comparison summary
 */
function generateComparisonSummary(changes: QuestionChange[]): VersionComparisonSummary {
  const contentChanged = changes.some(c => c.field === 'content');
  const answersChanged = changes.some(c => c.field.startsWith('answers'));
  const statusChanged = changes.some(c => c.field === 'status');
  const metadataChanged = changes.some(c => 
    !['content', 'status'].includes(c.field) && !c.field.startsWith('answers')
  );
  
  const majorFields = ['content', 'type', 'answers'];
  const majorChanges = changes.filter(c => 
    majorFields.some(field => c.field === field || c.field.startsWith(field))
  ).length;
  
  const minorChanges = changes.length - majorChanges;
  
  return {
    totalChanges: changes.length,
    contentChanged,
    answersChanged,
    metadataChanged,
    statusChanged,
    majorChanges,
    minorChanges
  };
}

// ===== VERSION MANAGEMENT =====

/**
 * Create question history từ versions
 */
export function createQuestionHistory(versions: QuestionVersion[]): QuestionHistory {
  if (versions.length === 0) {
    throw new Error('Cannot create history from empty versions array');
  }
  
  const sortedVersions = [...versions].sort((a, b) => a.version - b.version);
  const firstVersion = sortedVersions[0];
  const latestVersion = sortedVersions[sortedVersions.length - 1];
  
  return {
    questionId: firstVersion.questionId,
    versions: sortedVersions,
    totalVersions: versions.length,
    firstVersion,
    latestVersion,
    createdAt: firstVersion.createdAt,
    lastModified: latestVersion.createdAt
  };
}

/**
 * Restore question to specific version
 */
export function restoreQuestionToVersion(
  currentQuestion: Question,
  targetVersion: QuestionVersion,
  options: VersionRestoreOptions = {}
): Question {
  const {
    preserveMetadata = true,
    createNewVersion = true
  } = options;
  
  const restoredQuestion: Question = {
    ...targetVersion.data,
    id: currentQuestion.id, // Keep current ID
    updatedAt: new Date().toISOString()
  };
  
  // Preserve certain metadata if requested
  if (preserveMetadata) {
    restoredQuestion.usageCount = currentQuestion.usageCount;
    restoredQuestion.feedback = currentQuestion.feedback;
    restoredQuestion.createdAt = currentQuestion.createdAt;
  }

  // If createNewVersion is true, this indicates a new version should be created
  // This is typically handled by the calling code that manages version history
  if (createNewVersion) {
    // Add metadata to indicate this is a restored version
    restoredQuestion.updatedAt = new Date().toISOString();
    // Note: Version creation is handled by the version management system
  }

  return restoredQuestion;
}

// ===== UTILITY FUNCTIONS =====

/**
 * Generate unique version ID
 */
function generateVersionId(): string {
  return `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get version summary text
 */
export function getVersionSummary(version: QuestionVersion): string {
  const changeCount = version.changes.length;
  const changeType = version.changeType;
  
  if (changeType === 'create') {
    return 'Tạo câu hỏi mới';
  }
  
  if (changeCount === 0) {
    return 'Không có thay đổi';
  }
  
  const changeTypeMap = {
    'content_change': 'Thay đổi nội dung',
    'answer_change': 'Thay đổi đáp án',
    'metadata_change': 'Thay đổi thông tin',
    'status_change': 'Thay đổi trạng thái',
    'bulk_update': 'Cập nhật hàng loạt',
    'update': 'Cập nhật'
  };
  
  const typeText = changeTypeMap[changeType] || 'Cập nhật';
  return `${typeText} (${changeCount} thay đổi)`;
}

/**
 * Format version for display
 */
export function formatVersionForDisplay(version: QuestionVersion): {
  title: string;
  subtitle: string;
  timestamp: string;
  changes: string[];
} {
  const title = `Version ${version.version}`;
  const subtitle = getVersionSummary(version);
  const timestamp = new Date(version.createdAt).toLocaleString('vi-VN');
  
  const changes = version.changes.map(change => {
    const action = change.changeType === 'add' ? 'Thêm' : 
                   change.changeType === 'remove' ? 'Xóa' : 'Sửa';
    return `${action} ${change.field}`;
  });
  
  return {
    title,
    subtitle,
    timestamp,
    changes
  };
}
