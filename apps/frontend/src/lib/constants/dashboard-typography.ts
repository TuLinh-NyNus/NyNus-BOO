/**
 * Dashboard Typography System
 * Consistent typography scale cho admin dashboard
 * 
 * @author NyNus Team
 * @created 2025-01-27
 */

/**
 * Typography Scale - Based on Tailwind CSS
 * Hierarchy rõ ràng từ Hero → Primary → Secondary → Supporting
 */
export const TYPOGRAPHY_SCALE = {
  // Hero Metrics - Largest, most important numbers
  hero: {
    value: 'text-6xl font-black tracking-tight', // 60px, 900 weight
    label: 'text-sm font-bold uppercase tracking-wide', // 14px, 700 weight
    description: 'text-base font-medium leading-relaxed', // 16px, 500 weight
    trend: 'text-sm font-bold' // 14px, 700 weight
  },

  // Primary Metrics - Important but secondary
  primary: {
    value: 'text-4xl font-black tracking-tight', // 36px, 900 weight
    label: 'text-xs font-bold uppercase tracking-wide', // 12px, 700 weight
    description: 'text-sm font-medium leading-relaxed', // 14px, 500 weight
    trend: 'text-xs font-bold' // 12px, 700 weight
  },

  // Section Headers - Organize content
  section: {
    title: 'text-2xl font-black bg-gradient-to-r bg-clip-text text-transparent', // 24px, 900 weight
    subtitle: 'text-sm font-medium', // 14px, 500 weight
    description: 'text-sm text-muted-foreground/80 font-medium' // 14px, 500 weight, muted
  },

  // Chart & Visualization
  chart: {
    title: 'text-xl font-bold', // 20px, 700 weight
    subtitle: 'text-sm text-muted-foreground', // 14px, normal, muted
    legend: 'text-xs font-medium text-muted-foreground', // 12px, 500 weight, muted
    axis: 'text-xs text-muted-foreground/60' // 12px, normal, very muted
  },

  // Interactive Elements
  button: {
    primary: 'text-sm font-semibold', // 14px, 600 weight
    secondary: 'text-xs font-semibold', // 12px, 600 weight
    ghost: 'text-xs font-medium' // 12px, 500 weight
  },

  // Supporting Text
  supporting: {
    caption: 'text-xs text-muted-foreground/70', // 12px, normal, muted
    timestamp: 'text-xs text-muted-foreground/60', // 12px, normal, very muted
    badge: 'text-xs font-bold', // 12px, 700 weight
    tooltip: 'text-xs font-medium' // 12px, 500 weight
  }
} as const;

/**
 * Color Gradients for Typography
 * Gradient text effects cho visual hierarchy
 */
export const TEXT_GRADIENTS = {
  primary: 'from-blue-600 via-cyan-500 to-blue-500',
  success: 'from-emerald-600 via-green-500 to-teal-500',
  warning: 'from-amber-600 via-yellow-500 to-orange-500',
  neutral: 'from-gray-600 via-slate-500 to-gray-500',
  
  // Special gradients for sections
  hero: 'from-blue-400 via-cyan-400 to-purple-400',
  metrics: 'from-emerald-400 via-cyan-400 to-blue-400',
  content: 'from-amber-400 via-orange-400 to-red-400'
} as const;

/**
 * Animation Classes
 * Subtle animations cho typography
 */
export const TEXT_ANIMATIONS = {
  // Hover effects
  hover: {
    scale: 'group-hover:scale-110 transition-transform duration-300',
    glow: 'group-hover:drop-shadow-lg transition-all duration-300',
    tracking: 'group-hover:tracking-tight transition-all duration-300'
  },

  // Loading states
  loading: {
    pulse: 'animate-pulse',
    shimmer: 'animate-pulse bg-gradient-to-r from-muted/50 to-muted/30'
  },

  // Entrance animations
  entrance: {
    fadeIn: 'animate-in fade-in-0 duration-500',
    slideUp: 'animate-in slide-in-from-bottom-4 duration-500',
    slideDown: 'animate-in slide-in-from-top-4 duration-500'
  }
} as const;

/**
 * Responsive Typography
 * Adjustments cho mobile/tablet/desktop
 */
export const RESPONSIVE_TYPOGRAPHY = {
  hero: {
    mobile: 'text-4xl', // 36px on mobile
    tablet: 'text-5xl', // 48px on tablet
    desktop: 'text-6xl' // 60px on desktop
  },
  
  primary: {
    mobile: 'text-2xl', // 24px on mobile
    tablet: 'text-3xl', // 30px on tablet
    desktop: 'text-4xl' // 36px on desktop
  },

  section: {
    mobile: 'text-lg', // 18px on mobile
    tablet: 'text-xl', // 20px on tablet
    desktop: 'text-2xl' // 24px on desktop
  }
} as const;

/**
 * Helper Functions
 */

/**
 * Get typography classes for metric values
 */
export function getMetricValueClasses(
  level: 'hero' | 'primary',
  gradient?: keyof typeof TEXT_GRADIENTS,
  responsive = true
) {
  const base = TYPOGRAPHY_SCALE[level].value;
  const gradientClass = gradient ? `bg-gradient-to-r ${TEXT_GRADIENTS[gradient]} bg-clip-text text-transparent` : '';
  const responsiveClass = responsive ? getResponsiveClasses(level) : '';
  
  return `${base} ${gradientClass} ${responsiveClass} drop-shadow-sm`.trim();
}

/**
 * Get typography classes for labels
 */
export function getMetricLabelClasses(level: 'hero' | 'primary') {
  return `${TYPOGRAPHY_SCALE[level].label} text-foreground/90`;
}

/**
 * Get typography classes for descriptions
 */
export function getMetricDescriptionClasses(level: 'hero' | 'primary') {
  return `${TYPOGRAPHY_SCALE[level].description} text-muted-foreground/80 group-hover:text-muted-foreground/90 transition-colors duration-300`;
}

/**
 * Get section header classes
 */
export function getSectionHeaderClasses(gradient: keyof typeof TEXT_GRADIENTS) {
  return `${TYPOGRAPHY_SCALE.section.title} ${TEXT_GRADIENTS[gradient]}`;
}

/**
 * Get responsive classes
 */
function getResponsiveClasses(level: 'hero' | 'primary' | 'section') {
  const responsive = RESPONSIVE_TYPOGRAPHY[level];
  return `${responsive.mobile} md:${responsive.tablet} lg:${responsive.desktop}`;
}

/**
 * Typography Presets - Ready-to-use combinations
 */
export const TYPOGRAPHY_PRESETS = {
  heroMetric: {
    value: getMetricValueClasses('hero', 'primary'),
    label: getMetricLabelClasses('hero'),
    description: getMetricDescriptionClasses('hero')
  },
  
  primaryMetric: {
    value: getMetricValueClasses('primary', 'primary'),
    label: getMetricLabelClasses('primary'),
    description: getMetricDescriptionClasses('primary')
  },
  
  sectionHeader: {
    title: getSectionHeaderClasses('hero'),
    subtitle: TYPOGRAPHY_SCALE.section.subtitle,
    description: TYPOGRAPHY_SCALE.section.description
  }
} as const;


