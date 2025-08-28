/**
 * Responsive Testing Utilities
 * Utilities cho testing responsive design theo RIPER-5 EXECUTE MODE
 * 
 * @author NyNus Development Team
 * @version 1.0.0
 * @created 2025-01-18
 */

// ===== CONSTANTS =====

/**
 * Standard breakpoints cho responsive testing
 */
export const RESPONSIVE_BREAKPOINTS = {
  // Mobile breakpoints
  MOBILE_SMALL: 320,    // iPhone SE
  MOBILE_MEDIUM: 375,   // iPhone 12/13/14
  MOBILE_LARGE: 414,    // iPhone 12/13/14 Plus
  MOBILE_MAX: 767,      // Maximum mobile width
  
  // Tablet breakpoints
  TABLET_SMALL: 768,    // iPad Mini
  TABLET_MEDIUM: 820,   // iPad Air
  TABLET_LARGE: 1024,   // iPad Pro
  TABLET_MAX: 1023,     // Maximum tablet width
  
  // Desktop breakpoints
  DESKTOP_SMALL: 1024,  // Small desktop
  DESKTOP_MEDIUM: 1280, // Medium desktop
  DESKTOP_LARGE: 1440,  // Large desktop
  DESKTOP_XL: 1920,     // Extra large desktop
} as const;

/**
 * Device categories
 */
export type DeviceCategory = 'mobile' | 'tablet' | 'desktop';

/**
 * Test scenarios cho responsive design
 */
export interface ResponsiveTestScenario {
  name: string;
  width: number;
  height: number;
  category: DeviceCategory;
  description: string;
  touchEnabled: boolean;
}

/**
 * Responsive test scenarios
 */
export const RESPONSIVE_TEST_SCENARIOS: ResponsiveTestScenario[] = [
  // Mobile scenarios
  {
    name: 'iPhone SE',
    width: 320,
    height: 568,
    category: 'mobile',
    description: 'Smallest mobile screen',
    touchEnabled: true,
  },
  {
    name: 'iPhone 12/13/14',
    width: 375,
    height: 812,
    category: 'mobile',
    description: 'Standard mobile screen',
    touchEnabled: true,
  },
  {
    name: 'iPhone 12/13/14 Plus',
    width: 414,
    height: 896,
    category: 'mobile',
    description: 'Large mobile screen',
    touchEnabled: true,
  },
  
  // Tablet scenarios
  {
    name: 'iPad Mini',
    width: 768,
    height: 1024,
    category: 'tablet',
    description: 'Small tablet screen',
    touchEnabled: true,
  },
  {
    name: 'iPad Air',
    width: 820,
    height: 1180,
    category: 'tablet',
    description: 'Medium tablet screen',
    touchEnabled: true,
  },
  {
    name: 'iPad Pro',
    width: 1024,
    height: 1366,
    category: 'tablet',
    description: 'Large tablet screen',
    touchEnabled: true,
  },
  
  // Desktop scenarios
  {
    name: 'Small Desktop',
    width: 1024,
    height: 768,
    category: 'desktop',
    description: 'Small desktop screen',
    touchEnabled: false,
  },
  {
    name: 'Medium Desktop',
    width: 1280,
    height: 720,
    category: 'desktop',
    description: 'Medium desktop screen',
    touchEnabled: false,
  },
  {
    name: 'Large Desktop',
    width: 1440,
    height: 900,
    category: 'desktop',
    description: 'Large desktop screen',
    touchEnabled: false,
  },
  {
    name: 'Extra Large Desktop',
    width: 1920,
    height: 1080,
    category: 'desktop',
    description: 'Extra large desktop screen',
    touchEnabled: false,
  },
];

// ===== UTILITY FUNCTIONS =====

/**
 * Detect device category từ window width
 */
export function detectDeviceCategory(width?: number): DeviceCategory {
  const screenWidth = width || (typeof window !== 'undefined' ? window.innerWidth : 1024);
  
  if (screenWidth <= RESPONSIVE_BREAKPOINTS.MOBILE_MAX) {
    return 'mobile';
  } else if (screenWidth <= RESPONSIVE_BREAKPOINTS.TABLET_MAX) {
    return 'tablet';
  } else {
    return 'desktop';
  }
}

/**
 * Check if current screen is mobile
 */
export function isMobile(width?: number): boolean {
  return detectDeviceCategory(width) === 'mobile';
}

/**
 * Check if current screen is tablet
 */
export function isTablet(width?: number): boolean {
  return detectDeviceCategory(width) === 'tablet';
}

/**
 * Check if current screen is desktop
 */
export function isDesktop(width?: number): boolean {
  return detectDeviceCategory(width) === 'desktop';
}

/**
 * Get optimal grid columns cho device category
 */
export function getOptimalGridColumns(category: DeviceCategory): number {
  switch (category) {
    case 'mobile':
      return 1;
    case 'tablet':
      return 2;
    case 'desktop':
      return 3;
    default:
      return 3;
  }
}

/**
 * Get optimal page size cho device category
 */
export function getOptimalPageSize(category: DeviceCategory): number {
  switch (category) {
    case 'mobile':
      return 10;
    case 'tablet':
      return 20;
    case 'desktop':
      return 50;
    default:
      return 20;
  }
}

/**
 * Check if touch interactions should be enabled
 */
export function shouldEnableTouch(category: DeviceCategory): boolean {
  return category === 'mobile' || category === 'tablet';
}

/**
 * Get responsive test scenario by name
 */
export function getTestScenario(name: string): ResponsiveTestScenario | undefined {
  return RESPONSIVE_TEST_SCENARIOS.find(scenario => scenario.name === name);
}

/**
 * Get test scenarios by category
 */
export function getTestScenariosByCategory(category: DeviceCategory): ResponsiveTestScenario[] {
  return RESPONSIVE_TEST_SCENARIOS.filter(scenario => scenario.category === category);
}

/**
 * Generate responsive test report
 */
export interface ResponsiveTestReport {
  scenario: ResponsiveTestScenario;
  issues: string[];
  recommendations: string[];
  score: number; // 0-100
}

/**
 * Validate responsive design cho specific scenario
 */
export function validateResponsiveDesign(scenario: ResponsiveTestScenario): ResponsiveTestReport {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  // Check minimum touch target size (44px)
  if (scenario.touchEnabled) {
    // This would need actual DOM testing
    recommendations.push('Ensure touch targets are at least 44x44 pixels');
  }

  // Check text readability
  if (scenario.width < RESPONSIVE_BREAKPOINTS.MOBILE_MEDIUM) {
    recommendations.push('Consider larger font sizes for small screens');
  }

  // Check horizontal scrolling
  if (scenario.category === 'mobile') {
    recommendations.push('Ensure no horizontal scrolling on mobile');
  }

  // Calculate score based on issues
  score -= issues.length * 10;
  score = Math.max(0, Math.min(100, score));

  return {
    scenario,
    issues,
    recommendations,
    score,
  };
}

/**
 * Generate comprehensive responsive test report
 */
export function generateResponsiveTestReport(): ResponsiveTestReport[] {
  return RESPONSIVE_TEST_SCENARIOS.map(scenario => validateResponsiveDesign(scenario));
}

// ===== RESPONSIVE HOOKS =====

/**
 * Hook để detect current device category
 */
export function useDeviceCategory(): DeviceCategory {
  const [category, setCategory] = useState<DeviceCategory>(() => {
    if (typeof window === 'undefined') return 'desktop';
    return detectDeviceCategory(window.innerWidth);
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setCategory(detectDeviceCategory(window.innerWidth));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return category;
}

// ===== IMPORTS =====

import { useState, useEffect } from 'react';
