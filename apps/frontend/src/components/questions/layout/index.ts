/**
 * Questions Layout Components Index
 * Barrel exports cho questions layout components
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-18
 */

// Layout components
export {
  PageContainer,
  ContentContainer,
  SectionContainer,
  ArticleContainer,
  HeaderContainer,
  useResponsiveContainer,
  CONTAINER_CONFIG
} from './page-container';

export {
  QuestionsHeader,
  MinimalQuestionsHeader,
  FeaturedQuestionsHeader,
  SearchQuestionsHeader,
  QUESTIONS_HEADER_CONFIG
} from './questions-header';

// Type exports
export type {
  ContainerSize,
  ContainerPadding,
  ContainerConfig
} from './page-container';

export type {
  HeaderVariant,
  HeaderSize
} from './questions-header';
