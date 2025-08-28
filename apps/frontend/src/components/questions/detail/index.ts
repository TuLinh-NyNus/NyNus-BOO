/**
 * Questions Detail Components Index
 * Barrel exports cho questions detail components theo RIPER-5 EXECUTE MODE
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-18
 */

// ===== MAIN COMPONENTS =====

// Question Viewer components
export {
  QuestionViewer,
  CompactQuestionViewer,
  DetailedQuestionViewer,
  EducationalQuestionViewer,
  type QuestionViewerProps
} from './question-viewer';

// Answer Display components
export {
  AnswerDisplay,
  CompactAnswerDisplay,
  EducationalAnswerDisplay,
  ControlledAnswerDisplay,
  type AnswerDisplayProps
} from './answer-display';

// Solution Panel components
export {
  SolutionPanel,
  CompactSolutionPanel,
  DetailedSolutionPanel,
  ExpandedSolutionPanel,
  ControlledSolutionPanel,
  type SolutionPanelProps
} from './solution-panel';

// Metadata Display components
export {
  MetadataDisplay,
  CompactMetadataDisplay,
  DetailedMetadataDisplay,
  StatisticsOnlyMetadataDisplay,
  MetadataOnlyDisplay,
  HorizontalMetadataDisplay,
  type MetadataDisplayProps
} from './metadata-display';

// ===== COMPONENT GROUPS =====

// Import components for object export
import {
  QuestionViewer,
  CompactQuestionViewer,
  DetailedQuestionViewer,
  EducationalQuestionViewer
} from './question-viewer';

import {
  AnswerDisplay,
  CompactAnswerDisplay,
  EducationalAnswerDisplay,
  ControlledAnswerDisplay
} from './answer-display';

import {
  SolutionPanel,
  CompactSolutionPanel,
  DetailedSolutionPanel,
  ExpandedSolutionPanel,
  ControlledSolutionPanel
} from './solution-panel';

import {
  MetadataDisplay,
  CompactMetadataDisplay,
  DetailedMetadataDisplay,
  StatisticsOnlyMetadataDisplay,
  MetadataOnlyDisplay,
  HorizontalMetadataDisplay
} from './metadata-display';

// Main question viewer exports
export const QuestionViewers = {
  QuestionViewer,
  CompactQuestionViewer,
  DetailedQuestionViewer,
  EducationalQuestionViewer
};

// Main answer display exports
export const AnswerDisplays = {
  AnswerDisplay,
  CompactAnswerDisplay,
  EducationalAnswerDisplay,
  ControlledAnswerDisplay
};

// Main solution panel exports
export const SolutionPanels = {
  SolutionPanel,
  CompactSolutionPanel,
  DetailedSolutionPanel,
  ExpandedSolutionPanel,
  ControlledSolutionPanel
};

// Main metadata display exports
export const MetadataDisplays = {
  MetadataDisplay,
  CompactMetadataDisplay,
  DetailedMetadataDisplay,
  StatisticsOnlyMetadataDisplay,
  MetadataOnlyDisplay,
  HorizontalMetadataDisplay
};

// ===== DEFAULT EXPORTS =====

// Default question viewer
export { QuestionViewer as default } from './question-viewer';
