/**
 * Google Analytics 4 Integration
 * Utility functions for tracking events and user interactions
 */

import React from 'react';

// Extend Window interface để include gtag
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date | object,
      config?: object
    ) => void;
    dataLayer: unknown[];
  }
}

/**
 * Initialize Google Analytics
 * Call this in _app.tsx or layout.tsx
 */
export const initGA = (measurementId: string) => {
  // Chỉ chạy trên client-side
  if (typeof window === 'undefined') return;

  // Tạo script tag cho gtag
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Initialize dataLayer và gtag function
  window.dataLayer = window.dataLayer || [];
  window.gtag = function(...args: unknown[]) {
    window.dataLayer.push(args);
  };

  // Configure GA4
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    page_title: document.title,
    page_location: window.location.href,
  });
};

/**
 * Track custom events
 * @param eventName - Tên event (VD: 'cta_click_start_learning')
 * @param parameters - Parameters bổ sung cho event
 */
export const trackEvent = (eventName: string, parameters?: Record<string, unknown>) => {
  // Chỉ track trên client-side và khi gtag available
  if (typeof window === 'undefined' || !window.gtag) {
    console.log('Analytics not available:', eventName, parameters);
    return;
  }

  try {
    window.gtag('event', eventName, {
      // Default parameters
      timestamp: new Date().toISOString(),
      page_url: window.location.href,
      page_title: document.title,
      // Custom parameters
      ...parameters,
    });

    // Log for debugging (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics Event:', eventName, parameters);
    }
  } catch (error) {
    console.error('Error tracking event:', error);
  }
};

/**
 * Track page views
 * @param url - URL của page
 * @param title - Title của page
 */
export const trackPageView = (url: string, title?: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  try {
    window.gtag('event', 'page_view', {
      page_location: url,
      page_title: title || document.title,
    });
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
};

/**
 * Track user interactions
 * Predefined events cho NyNus
 */
export const analytics = {
  // CTA clicks
  ctaClick: (location: string, ctaText: string) => {
    trackEvent('cta_click_start_learning', {
      location,
      cta_text: ctaText,
      category: 'engagement',
    });
  },

  // Video interactions
  videoModalOpen: (location: string) => {
    trackEvent('video_modal_open', {
      location,
      category: 'engagement',
    });
  },

  videoPlay: (videoId: string, location: string) => {
    trackEvent('video_play', {
      video_id: videoId,
      location,
      category: 'engagement',
    });
  },

  // Search interactions
  searchSubmit: (query: string, location: string) => {
    trackEvent('search_submit', {
      search_term: query,
      location,
      category: 'search',
    });
  },

  // Course interactions
  courseClick: (courseId: string, courseTitle: string, location: string) => {
    trackEvent('featured_course_click', {
      course_id: courseId,
      course_title: courseTitle,
      location,
      category: 'course_engagement',
    });
  },

  // Navigation
  navigationClick: (linkText: string, destination: string) => {
    trackEvent('navigation_click', {
      link_text: linkText,
      destination,
      category: 'navigation',
    });
  },

  // Form submissions
  formSubmit: (formName: string, success: boolean) => {
    trackEvent('form_submit', {
      form_name: formName,
      success,
      category: 'form_interaction',
    });
  },

  // User registration/login
  userSignup: (method: string) => {
    trackEvent('sign_up', {
      method,
      category: 'user_lifecycle',
    });
  },

  userLogin: (method: string) => {
    trackEvent('login', {
      method,
      category: 'user_lifecycle',
    });
  },

  // Feature usage
  featureClick: (featureName: string, location: string) => {
    trackEvent('feature_click', {
      feature_name: featureName,
      location,
      category: 'feature_usage',
    });
  },

  // Social proof interactions
  testimonialView: (testimonialId: string) => {
    trackEvent('testimonial_view', {
      testimonial_id: testimonialId,
      category: 'social_proof',
    });
  },

  // Error tracking
  errorOccurred: (errorType: string, errorMessage: string, location: string) => {
    trackEvent('error_occurred', {
      error_type: errorType,
      error_message: errorMessage,
      location,
      category: 'error_tracking',
    });
  },
};

/**
 * Hook để sử dụng analytics trong React components
 */
export const useAnalytics = () => {
  return {
    trackEvent,
    trackPageView,
    ...analytics,
  };
};

/**
 * Higher-order component để auto-track page views
 */
export const withAnalytics = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  pageName?: string
) => {
  return function AnalyticsWrapper(props: P) {
    React.useEffect(() => {
      if (pageName) {
        trackPageView(window.location.href, pageName);
      }
    }, []);

    return React.createElement(WrappedComponent, props);
  };
};

// Export default cho convenience
const analyticsDefault = {
  init: initGA,
  track: trackEvent,
  pageView: trackPageView,
  ...analytics,
};

export default analyticsDefault;
