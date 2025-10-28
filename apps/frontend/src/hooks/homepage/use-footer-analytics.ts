import { useCallback } from 'react';

interface FooterAnalyticsEvent {
  event_category: string;
  event_label: string;
  value?: string | number;
  [key: string]: unknown;
}

export const useFooterAnalytics = () => {
  const trackEvent = useCallback((event: FooterAnalyticsEvent) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'footer_interaction', event);
    }
  }, []);

  const trackLinkClick = useCallback((linkName: string, linkUrl: string) => {
    trackEvent({
      event_category: 'Footer',
      event_label: `Link Click: ${linkName}`,
      value: linkUrl
    });
  }, [trackEvent]);

  const trackSocialClick = useCallback((platform: string, url: string) => {
    trackEvent({
      event_category: 'Footer',
      event_label: `Social Click: ${platform}`,
      value: url
    });
  }, [trackEvent]);

  const trackNewsletterSignup = useCallback((email: string) => {
    trackEvent({
      event_category: 'Footer',
      event_label: 'Newsletter Signup',
      value: email
    });
  }, [trackEvent]);

  const trackLanguageChange = useCallback((language: string) => {
    trackEvent({
      event_category: 'Footer',
      event_label: `Language Change: ${language}`
    });
  }, [trackEvent]);

  const trackContactClick = useCallback((method: string) => {
    trackEvent({
      event_category: 'Footer',
      event_label: `Contact Click: ${method}`
    });
  }, [trackEvent]);

  const trackBackToTop = useCallback(() => {
    trackEvent({
      event_category: 'Footer',
      event_label: 'Back to Top Click'
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackLinkClick,
    trackSocialClick,
    trackNewsletterSignup,
    trackLanguageChange,
    trackContactClick,
    trackBackToTop
  };
};























