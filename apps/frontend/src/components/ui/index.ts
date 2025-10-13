// UI Components Root Barrel Export
// Organized by category for better maintainability

// Display Components
export * from './display';

// Feedback Components
export * from './feedback';

// Form Components
export * from './form';

// Layout Components
export * from './layout';

// Navigation Components
export * from './navigation';

// Overlay Components
export * from './overlay';

// Theme Components
export * from './theme';

// Individual component re-exports for backward compatibility
// Form Components
export { Button } from './form/button';
export { Select as BasicSelect } from './form/basic-select';
export { MultiSelect } from './form/multi-select';
export { PasswordStrengthIndicator, PasswordRequirements } from './form/password-strength';
export { RadioGroup, RadioGroupItem } from './form/radio-group';
export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './form/select';
export { Slider } from './form/slider';
export { Switch } from './form/switch';

// Display Components
export { Progress } from './display/progress';
export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './display/table';

// Layout Components
export { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './layout/accordion';
export { ScrollArea } from './layout/scroll-area';

// Feedback Components
// ErrorBoundary moved to @/components/common/error-boundary to avoid duplicate
// export { ErrorBoundary } from './feedback/error-boundary';
// export type { ErrorFallbackProps } from './feedback/error-boundary';

// Display Components (additional)
export { LoadingSpinner } from './display/loading-spinner';

// Animation Components
export {
  AnimatedCounter,
  NumberCounter,
  PercentageCounter,
  CurrencyCounter,
  DecimalCounter,
  RatingCounter,
  createCustomFormatter,
  calculateOptimalDuration
} from './animated-counter';

// Overlay Components
export { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './overlay/alert-dialog';
export { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './overlay/dropdown-menu';
