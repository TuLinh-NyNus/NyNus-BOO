/**
 * Admin Breadcrumb Index
 * Barrel exports cho admin breadcrumb components
 */

// Main breadcrumb component
export { AdminBreadcrumb } from './admin-breadcrumb';

// Custom breadcrumb với override support
export {
  AdminBreadcrumbCustom,
  getPageMetadata,
  usePageMetadata,
  useBreadcrumbOverride,
  registerPageMetadata,
  registerDynamicPattern,
  PAGE_METADATA,
  DYNAMIC_PAGE_PATTERNS
} from './admin-breadcrumb-custom';

// Supporting components
export {
  BreadcrumbItemComponent,
  SimpleBreadcrumbItem,
  IconBreadcrumbItem,
  TruncatedBreadcrumbItem
} from './breadcrumb-item';

export {
  BreadcrumbSeparator,
  ChevronSeparator,
  SlashSeparator,
  ArrowSeparator,
  TextSeparator,
  DotSeparator,
  DashSeparator,
  CustomIconSeparator,
  AnimatedSeparator,
  ResponsiveSeparator,
  ConditionalSeparator,
  SeparatorVariants,
  getSeparatorComponent
} from './breadcrumb-separator';
